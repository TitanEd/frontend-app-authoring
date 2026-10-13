/*
 * One renderer per widget of the library (control-hub dashboards/library.py WIDGETS). Each
 * receives the widget's data as computed by the server. The charts are plain SVG and CSS built
 * on the design tokens, so they follow the theme, dark mode and the reading direction.
 */
/* eslint-disable react/prop-types, react/no-array-index-key */
import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Hyperlink, Icon } from '@openedx/paragon';
import {
  ArrowForward, BarChart, Bolt, CalendarMonth, Campaign, CheckCircle, EmojiEvents, Groups,
  LocalFireDepartment, Lock, MenuBook, NotificationsActive, PersonAdd, PlayCircle, Star,
  TrackChanges, TrendingUp, VerifiedUser, Videocam,
} from '@openedx/paragon/icons';

import messages from './messages';

// Library icon names -> Paragon icons.
export const ICONS = {
  book: MenuBook,
  play: PlayCircle,
  check: CheckCircle,
  award: EmojiEvents,
  trending: TrendingUp,
  target: TrackChanges,
  flame: LocalFireDepartment,
  zap: Bolt,
  star: Star,
  shield: VerifiedUser,
  users: Groups,
  'user-plus': PersonAdd,
  calendar: CalendarMonth,
  'bar-chart': BarChart,
  bell: NotificationsActive,
  megaphone: Campaign,
  video: Videocam,
};

const day = (intl, value, options = { month: 'short', day: 'numeric' }) => intl.formatDate(value, options);

const Empty = ({ children }) => {
  const intl = useIntl();
  return <p className="tb-empty">{children || intl.formatMessage(messages.empty)}</p>;
};

const Bar = ({ percent, mark, label }) => (
  <span className="tb-bar" role="img" aria-label={label}>
    <span className="tb-bar__fill" style={{ inlineSize: `${Math.max(0, Math.min(100, percent))}%` }} />
    {typeof mark === 'number' && <span className="tb-bar__mark" style={{ insetInlineStart: `${mark}%` }} />}
  </span>
);

const ContinueLearning = ({ data }) => {
  const intl = useIntl();
  const { course } = data;
  if (!course) { return <Empty>{intl.formatMessage(messages.noCourse)}</Empty>; }
  return (
    <div className="tb-continue">
      {course.image && <img className="tb-continue__image" src={course.image} alt="" />}
      <div className="tb-continue__text">
        <span className="tb-muted">{course.org}</span>
        <strong className="tb-continue__title">{course.title}</strong>
        <Bar percent={course.progress} label={intl.formatMessage(messages.complete, { percent: course.progress })} />
        <span className="tb-muted">
          {intl.formatMessage(messages.complete, { percent: course.progress })}
          {course.last_activity && ` · ${intl.formatMessage(messages.lastActivity, { date: day(intl, course.last_activity) })}`}
        </span>
      </div>
      <Button as="a" href={course.url} variant="primary" iconAfter={ArrowForward}>
        {intl.formatMessage(course.progress > 0 ? messages.resume : messages.start)}
      </Button>
    </div>
  );
};

const MyCourses = ({ data }) => {
  const intl = useIntl();
  if (!data.courses.length) { return <Empty>{intl.formatMessage(messages.noCourse)}</Empty>; }
  return (
    <>
      <ul className="tb-rows">
        {data.courses.map((course) => (
          <li key={course.id} className="tb-course">
            <a href={course.url} className="tb-course__title">{course.title}</a>
            <span className="tb-course__chips">
              {typeof course.grade === 'number' && (
                <span className={`tb-chip ${course.passed ? 'is-good' : ''}`}>
                  {course.passed
                    ? intl.formatMessage(messages.passed)
                    : intl.formatMessage(messages.grade, { percent: course.grade })}
                </span>
              )}
              <span className="tb-course__percent">{course.progress}%</span>
            </span>
            <Bar
              percent={course.progress}
              label={intl.formatMessage(messages.complete, { percent: course.progress })}
            />
          </li>
        ))}
      </ul>
      {data.total > data.courses.length && (
        <p className="tb-muted tb-more">{intl.formatMessage(messages.moreCourses, { count: data.total - data.courses.length })}</p>
      )}
    </>
  );
};

const WeeklyGoal = ({ data }) => {
  const intl = useIntl();
  const radius = 52;
  const length = 2 * Math.PI * radius;
  const left = Math.max(0, data.target - data.done);
  const most = Math.max(1, ...data.week.map((item) => item.count));
  return (
    <div className="tb-goal">
      <div className="tb-goal__ring">
        <svg viewBox="0 0 120 120" role="img" aria-label={intl.formatMessage(messages.goalDone, { done: data.done, target: data.target })}>
          <circle className="tb-goal__track" cx="60" cy="60" r={radius} />
          <circle
            className="tb-goal__value"
            cx="60"
            cy="60"
            r={radius}
            strokeDasharray={length}
            strokeDashoffset={length * (1 - data.percent / 100)}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <span className="tb-goal__number"><strong>{data.done}</strong>/ {data.target}</span>
      </div>
      <p className={`tb-goal__text ${left === 0 ? 'is-done' : ''}`}>
        {left === 0 ? intl.formatMessage(messages.goalReached) : intl.formatMessage(messages.goalLeft, { count: left })}
      </p>
      <ol className="tb-goal__week" aria-hidden="true">
        {data.week.map((item) => (
          <li key={item.date} className={item.future ? 'is-future' : ''}>
            <span style={{ blockSize: `${Math.round((item.count / most) * 100)}%` }} className={item.count ? 'is-on' : ''} />
            <small>{day(intl, item.date, { weekday: 'narrow' })}</small>
          </li>
        ))}
      </ol>
    </div>
  );
};

const ActivityHeatmap = ({ data }) => {
  const intl = useIntl();
  const level = (count) => {
    if (!count) { return 0; }
    const share = count / Math.max(1, data.best);
    if (share > 0.75) { return 4; }
    if (share > 0.5) { return 3; }
    return share > 0.25 ? 2 : 1;
  };
  return (
    <div className="tb-heat">
      <div className="tb-heat__grid">
        {data.days.map((item) => (
          <span
            key={item.date}
            className={`tb-heat__cell tb-heat__cell--${level(item.count)}`}
            title={`${day(intl, item.date)}: ${intl.formatMessage(messages.activities, { count: item.count })}`}
          />
        ))}
      </div>
      <div className="tb-heat__foot">
        <span><strong>{intl.formatMessage(messages.heatStreak, { count: data.streak })}</strong></span>
        <span>{intl.formatMessage(messages.heatActive, { count: data.active_days })}</span>
        <span>{intl.formatMessage(messages.heatTotal, { count: data.total })}</span>
        <span className="tb-heat__legend" aria-hidden="true">
          {intl.formatMessage(messages.heatLess)}
          {[0, 1, 2, 3, 4].map((value) => <span key={value} className={`tb-heat__cell tb-heat__cell--${value}`} />)}
          {intl.formatMessage(messages.heatMore)}
        </span>
      </div>
    </div>
  );
};

const Grades = ({ data }) => {
  const intl = useIntl();
  if (!data.courses.length) { return <Empty />; }
  return (
    <ul className="tb-rows">
      {data.courses.map((course) => (
        <li key={course.id} className="tb-course">
          <a href={course.url} className="tb-course__title">{course.title}</a>
          <span className="tb-course__chips">
            {course.passed && <span className="tb-chip is-good">{intl.formatMessage(messages.passed)}</span>}
            <span className="tb-course__percent">{course.grade}%</span>
          </span>
          <Bar
            percent={course.grade}
            mark={course.pass_mark}
            label={intl.formatMessage(messages.grade, { percent: course.grade })}
          />
          {typeof course.pass_mark === 'number' && course.pass_mark > 0 && (
            <span className="tb-muted">{intl.formatMessage(messages.passMark, { percent: course.pass_mark })}</span>
          )}
        </li>
      ))}
    </ul>
  );
};

const BadgeIcon = ({ badge, locked }) => (
  <span className={`tb-badge ${locked ? 'is-locked' : ''}`} title={badge.description}>
    {badge.icon ? <img src={badge.icon} alt="" /> : <Icon src={locked ? Lock : EmojiEvents} />}
    <small>{badge.title}</small>
  </span>
);

const Badges = ({ data }) => {
  const intl = useIntl();
  return (
    <div className="tb-badges">
      <p className="tb-badges__summary">
        <strong>{intl.formatMessage(messages.badgesEarned, { count: data.earned_total })}</strong>
        <span className="tb-chip is-warm">{intl.formatMessage(messages.points, { count: data.points })}</span>
      </p>
      {data.earned.length > 0
        ? <div className="tb-badges__row">{data.earned.map((badge, index) => <BadgeIcon key={index} badge={badge} />)}</div>
        : <Empty>{intl.formatMessage(messages.badgesNone)}</Empty>}
      {data.next.length > 0 && (
        <>
          <p className="tb-muted tb-badges__next">{intl.formatMessage(messages.badgesNext)}</p>
          <div className="tb-badges__row">{data.next.map((badge, index) => <BadgeIcon key={index} badge={badge} locked />)}</div>
        </>
      )}
    </div>
  );
};

const Leaderboard = ({ data }) => {
  const intl = useIntl();
  if (!data.rows.length) { return <Empty />; }
  return (
    <>
      <ol className="tb-ranks">
        {data.rows.map((row, index) => (
          <li key={index} className={row.me ? 'is-me' : ''}>
            <span className={`tb-ranks__place tb-ranks__place--${index + 1}`}>{index + 1}</span>
            <span className="tb-ranks__name">{row.name}{row.me && <span className="tb-chip">{intl.formatMessage(messages.you)}</span>}</span>
            <strong>{intl.formatNumber(row.points)}</strong>
          </li>
        ))}
      </ol>
      {data.my_rank && <p className="tb-muted tb-more">{intl.formatMessage(messages.myRank, { rank: data.my_rank })} · {intl.formatMessage(messages.points, { count: data.my_points })}</p>}
    </>
  );
};

const UpcomingEvents = ({ data }) => {
  const intl = useIntl();
  if (!data.events.length) { return <Empty />; }
  return (
    <>
      <ul className="tb-events">
        {data.events.map((event) => (
          <li key={event.url}>
            <span className="tb-events__date"><strong>{day(intl, event.start, { day: 'numeric' })}</strong>{day(intl, event.start, { month: 'short' })}</span>
            <span className="tb-events__text">
              <a href={event.url}>{event.title}</a>
              <span className="tb-muted">{intl.formatTime(event.start)}{event.online && ` · ${intl.formatMessage(messages.online)}`}</span>
            </span>
          </li>
        ))}
      </ul>
      <Hyperlink destination={data.all_url} className="tb-more">{intl.formatMessage(messages.allEvents)}</Hyperlink>
    </>
  );
};

const Announcement = ({ data }) => {
  if (!data.text) { return <Empty />; }
  return (
    <div className="tb-announcement">
      <p dir="auto">{data.text}</p>
      {data.link_url && <Button as="a" href={data.link_url} variant="outline-primary" iconAfter={ArrowForward}>{data.link_label || data.link_url}</Button>}
    </div>
  );
};

const Video = ({ data }) => {
  if (!/^[\w-]{6,20}$/.test(data.youtube_id || '')) { return <Empty />; }
  return (
    <div className="tb-video">
      <div className="tb-video__frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${data.youtube_id}`}
          title={data.text || 'YouTube'}
          loading="lazy"
          allow="accelerometer; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
      {data.text && <p dir="auto">{data.text}</p>}
    </div>
  );
};

// A line with a soft area under it, from {date, count} points.
const Trend = ({ points, label }) => {
  const intl = useIntl();
  const width = 600;
  const height = 160;
  const most = Math.max(1, ...points.map((point) => point.count));
  const step = width / Math.max(1, points.length - 1);
  const xy = points.map((point, index) => [index * step, height - 8 - (point.count / most) * (height - 24)]);
  const line = xy.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return (
    <div className="tb-trend">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={label}>
        <path className="tb-trend__area" d={`${line} L${width} ${height} L0 ${height} Z`} />
        <path className="tb-trend__line" d={line} />
        {xy.map(([x, y], index) => (
          <circle key={points[index].date} className={points[index].count ? 'tb-trend__dot' : 'tb-trend__dot is-zero'} cx={x} cy={y} r="4">
            <title>
              {intl.formatMessage(messages.enrollmentsOn, {
                date: day(intl, points[index].date), count: points[index].count,
              })}
            </title>
          </circle>
        ))}
      </svg>
      <div className="tb-trend__axis tb-muted">
        <span>{day(intl, points[0].date)}</span>
        <span>{day(intl, points[Math.floor(points.length / 2)].date)}</span>
        <span>{day(intl, points[points.length - 1].date)}</span>
      </div>
    </div>
  );
};

const EnrollmentTrend = ({ data }) => {
  const intl = useIntl();
  const label = intl.formatMessage(messages.enrollments30, { count: data.total });
  return (
    <>
      <p className="tb-figure">{label}</p>
      <Trend points={data.points} label={label} />
    </>
  );
};

const Columns = ({ items, title }) => {
  const most = Math.max(1, ...items.map((item) => item.count));
  return (
    <ol className="tb-columns">
      {items.map((item) => (
        <li key={item.key} title={title(item)}>
          <span className="tb-columns__value">{item.count || ''}</span>
          <span className="tb-columns__bar" style={{ blockSize: `${Math.max(item.count ? 6 : 2, Math.round((item.count / most) * 100))}%` }} />
          <small>{item.label}</small>
        </li>
      ))}
    </ol>
  );
};

const LearnerActivity = ({ data }) => {
  const intl = useIntl();
  return (
    <Columns
      items={data.points.map((point) => ({ key: point.date, count: point.count, label: day(intl, point.date, { day: 'numeric' }) }))}
      title={(item) => intl.formatMessage(messages.learnersOn, { date: day(intl, item.key), count: item.count })}
    />
  );
};

const GradeDistribution = ({ data }) => {
  const intl = useIntl();
  if (!data.total) { return <Empty />; }
  return (
    <>
      <Columns
        items={data.buckets.map((bucket) => ({ key: bucket.label, count: bucket.count, label: `${bucket.label}%` }))}
        title={(item) => `${item.label}: ${item.count}`}
      />
      <p className="tb-muted tb-more">{intl.formatMessage(messages.gradedLearners, { count: data.total })}</p>
    </>
  );
};

const CourseTable = ({ data }) => {
  const intl = useIntl();
  if (!data.courses.length) { return <Empty>{intl.formatMessage(messages.noCourses)}</Empty>; }
  return (
    <div className="tb-table">
      <table>
        <thead>
          <tr>
            <th scope="col">{intl.formatMessage(messages.colCourse)}</th>
            <th scope="col">{intl.formatMessage(messages.colLearners)}</th>
            <th scope="col">{intl.formatMessage(messages.colCompletion)}</th>
            <th scope="col">{intl.formatMessage(messages.colGrade)}</th>
            <th scope="col">{intl.formatMessage(messages.colCertificates)}</th>
          </tr>
        </thead>
        <tbody>
          {data.courses.map((course) => (
            <tr key={course.id}>
              <th scope="row"><a href={course.url}>{course.title}</a></th>
              <td>{intl.formatNumber(course.learners)}</td>
              <td><span className="tb-table__meter"><Bar percent={course.progress} label={`${course.progress}%`} />{course.progress}%</span></td>
              <td>{course.grade}%</td>
              <td>{intl.formatNumber(course.certificates)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const People = ({
  rows, total, more, empty,
}) => {
  if (!rows.length) { return <Empty>{empty}</Empty>; }
  return (
    <>
      <ul className="tb-people">
        {rows.map((row, index) => (
          <li key={index}>
            <span className="tb-people__avatar" aria-hidden="true">{(row.name || '?').trim().charAt(0).toUpperCase()}</span>
            <span className="tb-people__text"><strong>{row.name}</strong><span className="tb-muted">{row.course}</span></span>
            <span className="tb-people__meta">{row.meta}</span>
          </li>
        ))}
      </ul>
      {more && total > rows.length && <p className="tb-muted tb-more">{more}</p>}
    </>
  );
};

const NeedsAttention = ({ data }) => {
  const intl = useIntl();
  return (
    <People
      rows={data.learners.map((row) => ({
        ...row,
        meta: row.last_activity
          ? intl.formatMessage(messages.inactiveSince, { date: day(intl, row.last_activity) })
          : intl.formatMessage(messages.neverActive),
      }))}
      total={data.total}
      more={intl.formatMessage(messages.attentionMore, { count: data.total })}
      empty={intl.formatMessage(messages.attentionNone)}
    />
  );
};

const RecentEnrollments = ({ data }) => {
  const intl = useIntl();
  return <People rows={data.enrollments.map((row) => ({ ...row, meta: day(intl, row.date) }))} total={0} />;
};

const TopLearners = ({ data }) => (
  <People rows={data.learners.map((row) => ({ ...row, meta: `${row.progress}%` }))} total={0} />
);

export const WIDGETS = {
  continue_learning: ContinueLearning,
  my_courses: MyCourses,
  weekly_goal: WeeklyGoal,
  activity_heatmap: ActivityHeatmap,
  grades: Grades,
  badges: Badges,
  leaderboard: Leaderboard,
  upcoming_events: UpcomingEvents,
  announcement: Announcement,
  video: Video,
  enrollment_trend: EnrollmentTrend,
  learner_activity: LearnerActivity,
  course_table: CourseTable,
  grade_distribution: GradeDistribution,
  needs_attention: NeedsAttention,
  recent_enrollments: RecentEnrollments,
  top_learners: TopLearners,
};
