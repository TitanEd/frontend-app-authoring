/*
 * "My Assessments" in Studio: the quizzes, exams and assignments of every course the person
 * runs, so nobody has to open each course to see what is open, closed or waiting for a grade.
 * Filters: status, course, assessment type, due period, search. Each row links to the
 * outline (edit), the learner view, the gradebook and, when responses wait, to grading.
 *
 * Data: GET {LMS}/titaned/api/v2/my-assessments/teaching/ (control-hub
 * assignment_manager/overview.py). The stylesheet is the one of the learner page.
 */
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Container, Form, Icon, Spinner,
} from '@openedx/paragon';
import {
  Assignment, CheckCircle, Edit, EventNote, People, Quiz, RateReview, Schedule, Search, Timer, UploadFile,
  VerifiedUser, VisibilityOff, Warning,
} from '@openedx/paragon/icons';

import messages from './messages';
import './style.scss';

const DAY = 24 * 60 * 60 * 1000;
const KINDS = {
  quiz: { icon: Quiz, label: messages.kindQuiz },
  timed_exam: { icon: Timer, label: messages.kindTimedExam },
  entrance_exam: { icon: VerifiedUser, label: messages.kindEntranceExam },
  open_response: { icon: Edit, label: messages.kindOpenResponse },
  staff_graded: { icon: UploadFile, label: messages.kindStaffGraded },
};
const STATUSES = {
  needs_review: { icon: RateReview, label: messages.statusNeedsReview },
  due: { icon: Schedule, label: messages.statusDue },
  open: { icon: Assignment, label: messages.statusOpen },
  past_due: { icon: Warning, label: messages.statusPastDue },
  closed: { icon: CheckCircle, label: messages.statusClosed },
  scheduled: { icon: EventNote, label: messages.statusScheduled },
  hidden: { icon: VisibilityOff, label: messages.statusHidden },
};
const STATUS_ORDER = ['needs_review', 'due', 'open', 'past_due', 'closed', 'scheduled', 'hidden'];

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const daysAway = (date, now) => Math.round((startOfDay(date) - startOfDay(now)) / DAY);

const inPeriod = (due, period, now) => {
  if (!period) { return true; }
  if (!due) { return false; }
  const days = daysAway(due, now);
  if (period === 'today') { return days === 0; }
  if (period === 'tomorrow') { return days === 1; }
  if (period === 'week') {
    const monday = startOfDay(now);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return due >= monday && due < new Date(monday.getTime() + 7 * DAY);
  }
  if (period === 'month') { return due.getFullYear() === now.getFullYear() && due.getMonth() === now.getMonth(); }
  return due.getFullYear() === now.getFullYear();
};

const TeamAssessmentsPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [status, setStatus] = useState('');
  const [course, setCourse] = useState('');
  const [kind, setKind] = useState('');
  const [period, setPeriod] = useState('');
  const [query, setQuery] = useState('');

  const load = useCallback(() => {
    setFailed(false);
    getAuthenticatedHttpClient()
      .get(`${getConfig().LMS_BASE_URL}/titaned/api/v2/my-assessments/teaching/`)
      .then((response) => setData(response.data))
      .catch(() => setFailed(true));
  }, []);
  useEffect(() => { load(); }, [load]);

  const now = useMemo(() => new Date(), [data]); // eslint-disable-line react-hooks/exhaustive-deps
  const items = useMemo(() => (data ? data.items.map((item) => ({
    ...item,
    dueDate: item.due ? new Date(item.due) : null,
    startDate: item.start ? new Date(item.start) : null,
  })) : []), [data]);

  const scoped = useMemo(() => {
    const text = query.trim().toLowerCase();
    return items.filter((item) => (!course || item.course_id === course)
      && (!kind || item.kind === kind)
      && inPeriod(item.dueDate, period, now)
      && (!text || `${item.title} ${item.course} ${item.section} ${item.format}`.toLowerCase().includes(text)));
  }, [items, course, kind, period, query, now]);
  const counts = useMemo(() => scoped.reduce((all, item) => ({ ...all, [item.status]: (all[item.status] || 0) + 1 }), {}), [scoped]);

  // One group per course; inside, what needs the person first.
  const groups = useMemo(() => {
    const rank = (item) => STATUS_ORDER.indexOf(item.status);
    const byCourse = new Map();
    scoped.filter((item) => !status || item.status === status).forEach((item) => {
      if (!byCourse.has(item.course_id)) { byCourse.set(item.course_id, { key: item.course_id, name: item.course, list: [] }); }
      byCourse.get(item.course_id).list.push(item);
    });
    const list = [...byCourse.values()];
    list.forEach((group) => group.list.sort((a, b) => rank(a) - rank(b)
      || (a.dueDate ? a.dueDate.getTime() : Infinity) - (b.dueDate ? b.dueDate.getTime() : Infinity)));
    return list;
  }, [scoped, status]);
  const shownCount = groups.reduce((sum, group) => sum + group.list.length, 0);

  const time = (date) => intl.formatTime(date, { hour: 'numeric', minute: '2-digit' });
  const day = (date) => intl.formatDate(date, {
    weekday: 'short', month: 'short', day: 'numeric', year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
  const dueText = (item) => {
    if (item.status === 'scheduled' && item.startDate) { return intl.formatMessage(messages.opensOn, { date: day(item.startDate) }); }
    if (!item.dueDate) { return intl.formatMessage(messages.noDueDate); }
    const days = daysAway(item.dueDate, now);
    if (item.dueDate < now) { return intl.formatMessage(messages.closedDays, { count: -days }); }
    if (days === 0) { return intl.formatMessage(messages.dueToday, { time: time(item.dueDate) }); }
    if (days === 1) { return intl.formatMessage(messages.dueTomorrow, { time: time(item.dueDate) }); }
    if (days <= 7) { return intl.formatMessage(messages.dueInDays, { count: days }); }
    return intl.formatMessage(messages.dueOn, { date: day(item.dueDate) });
  };
  const percent = (value) => intl.formatNumber(value / 100, { style: 'percent' });

  const title = intl.formatMessage(messages.pageTitle);
  const filtered = Boolean(status || course || kind || period || query.trim());
  const clear = () => { setStatus(''); setCourse(''); setKind(''); setPeriod(''); setQuery(''); };

  let body;
  if (failed) {
    body = (
      <div className="tas-state" role="alert">
        <p>{intl.formatMessage(messages.error)}</p>
        <Button variant="outline-primary" onClick={load}>{intl.formatMessage(messages.retry)}</Button>
      </div>
    );
  } else if (!data) {
    body = <div className="tas-state"><Spinner animation="border" variant="primary" screenReaderText={intl.formatMessage(messages.loading)} /></div>;
  } else {
    const toReview = items.reduce((sum, item) => sum + item.to_review, 0);
    const dueSoon = items.filter((item) => item.status === 'due').length;
    const expected = items.reduce((sum, item) => sum + item.learners, 0);
    const received = items.reduce((sum, item) => sum + Math.min(item.submitted, item.learners), 0);
    let headline = intl.formatMessage(messages.heroCalm);
    if (toReview) {
      headline = intl.formatMessage(messages.heroReview, { count: toReview });
    } else if (dueSoon) {
      headline = intl.formatMessage(messages.heroDue, { count: dueSoon });
    }
    const kindsHere = Object.keys(KINDS).filter((key) => items.some((item) => item.kind === key));
    const statusesHere = STATUS_ORDER.filter((key) => items.some((item) => item.status === key));

    body = (
      <>
        <section className="tas-hero">
          <span className="tas-state__icon"><Icon src={Assignment} /></span>
          <div className="tas-hero__text">
            <h1>{title}</h1>
            <p>{items.length ? headline : intl.formatMessage(messages.intro)}</p>
          </div>
          <dl className="tas-hero__figures">
            <div><dt>{intl.formatMessage(messages.figureAssessments)}</dt><dd>{intl.formatNumber(items.length)}</dd></div>
            <div><dt>{intl.formatMessage(messages.figureToReview)}</dt><dd>{intl.formatNumber(toReview)}</dd></div>
            <div><dt>{intl.formatMessage(messages.figureSubmissionRate)}</dt><dd>{expected ? percent(Math.round((received / expected) * 100)) : '—'}</dd></div>
          </dl>
        </section>

        {items.length === 0 ? (
          <div className="tas-state tas-card">
            <Icon src={Assignment} className="tas-state__icon" />
            <h2>{intl.formatMessage(messages.emptyTitle)}</h2>
            <p>{intl.formatMessage(messages.emptyText)}</p>
            <Button variant="primary" onClick={() => navigate('/my-courses')}>{intl.formatMessage(messages.myCourses)}</Button>
          </div>
        ) : (
          <>
            <div className="tas-chips" role="group" aria-label={title}>
              <button type="button" className={`tas-chip ${status === '' ? 'is-on' : ''}`} aria-pressed={status === ''} onClick={() => setStatus('')}>
                <span>{intl.formatMessage(messages.statusAll)}</span>
                <strong>{intl.formatNumber(scoped.length)}</strong>
              </button>
              {statusesHere.map((key) => (
                <button
                  type="button"
                  key={key}
                  className={`tas-chip tas-chip--${key} ${status === key ? 'is-on' : ''}`}
                  aria-pressed={status === key}
                  onClick={() => setStatus(status === key ? '' : key)}
                >
                  <Icon src={STATUSES[key].icon} size="sm" />
                  <span>{intl.formatMessage(STATUSES[key].label)}</span>
                  <strong>{intl.formatNumber(counts[key] || 0)}</strong>
                </button>
              ))}
            </div>

            <div className="tas-filters tas-card">
              <Form.Group controlId="tas-course">
                <Form.Label>{intl.formatMessage(messages.filterCourse)}</Form.Label>
                <Form.Control as="select" value={course} onChange={(event) => setCourse(event.target.value)}>
                  <option value="">{intl.formatMessage(messages.filterAllCourses)}</option>
                  {data.courses.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="tas-kind">
                <Form.Label>{intl.formatMessage(messages.filterType)}</Form.Label>
                <Form.Control as="select" value={kind} onChange={(event) => setKind(event.target.value)}>
                  <option value="">{intl.formatMessage(messages.filterAllTypes)}</option>
                  {kindsHere.map((key) => <option key={key} value={key}>{intl.formatMessage(KINDS[key].label)}</option>)}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="tas-due">
                <Form.Label>{intl.formatMessage(messages.filterDue)}</Form.Label>
                <Form.Control as="select" value={period} onChange={(event) => setPeriod(event.target.value)}>
                  <option value="">{intl.formatMessage(messages.filterAnyTime)}</option>
                  <option value="today">{intl.formatMessage(messages.filterToday)}</option>
                  <option value="tomorrow">{intl.formatMessage(messages.filterTomorrow)}</option>
                  <option value="week">{intl.formatMessage(messages.filterWeek)}</option>
                  <option value="month">{intl.formatMessage(messages.filterMonth)}</option>
                  <option value="year">{intl.formatMessage(messages.filterYear)}</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="tas-search" className="tas-filters__search">
                <Form.Label>{intl.formatMessage(messages.search)}</Form.Label>
                <Form.Control
                  type="search"
                  value={query}
                  leadingElement={<Icon src={Search} />}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </Form.Group>
              <div className="tas-filters__foot">
                <span aria-live="polite">{intl.formatMessage(messages.showing, { count: shownCount })}</span>
                {filtered && <Button variant="link" size="inline" onClick={clear}>{intl.formatMessage(messages.clearFilters)}</Button>}
              </div>
            </div>

            {shownCount === 0 && (
              <div className="tas-state tas-card">
                <h2>{intl.formatMessage(messages.noMatchTitle)}</h2>
                <Button variant="outline-primary" onClick={clear}>{intl.formatMessage(messages.clearFilters)}</Button>
              </div>
            )}

            {groups.map((group) => (
              <section key={group.key} className="tas-group">
                <h2>{group.name} <span>{intl.formatNumber(group.list.length)}</span></h2>
                <ul className="tas-list">
                  {group.list.map((item) => {
                    const meta = KINDS[item.kind] || KINDS.quiz;
                    const rate = item.learners ? Math.min(100, Math.round((item.submitted / item.learners) * 100)) : 0;
                    return (
                      <li key={item.id}>
                        <div className={`tas-item tas-item--team tas-item--${item.status}`}>
                          <span className="tas-item__icon"><Icon src={meta.icon} /></span>
                          <span className="tas-item__main">
                            <strong>{item.title}</strong>
                            <span className="tas-item__course">{item.section}</span>
                            <span className="tas-item__tags">
                              <span className="tas-tag">{intl.formatMessage(meta.label)}</span>
                              {item.format && item.format !== intl.formatMessage(meta.label) && <span className="tas-tag tas-tag--plain">{item.format}</span>}
                              <span className={`tas-tag tas-tag--${item.status}`}>
                                <Icon src={STATUSES[item.status].icon} size="xs" /> {intl.formatMessage(STATUSES[item.status].label)}
                              </span>
                            </span>
                          </span>
                          <span className="tas-item__when">
                            <span className="tas-item__due"><Icon src={Schedule} size="sm" /> {dueText(item)}</span>
                            {item.dueDate && <small>{day(item.dueDate)}, {time(item.dueDate)}</small>}
                          </span>
                          <span className="tas-item__state">
                            <span className="tas-meter" role="img" aria-label={`${rate}%`}>
                              <span style={{ inlineSize: `${rate}%` }} />
                            </span>
                            <small className="tas-item__numbers">
                              <span>
                                <Icon src={People} size="xs" className="d-inline-block align-text-bottom" />{' '}
                                {item.learners
                                  ? intl.formatMessage(messages.submitted, { submitted: intl.formatNumber(Math.min(item.submitted, item.learners)), learners: intl.formatNumber(item.learners) })
                                  : intl.formatMessage(messages.noLearners)}
                              </span>
                              {item.average !== null && <span>{intl.formatMessage(messages.average, { percent: percent(item.average) })}</span>}
                              {item.to_review > 0 && <b>{intl.formatMessage(messages.toReview, { count: item.to_review })}</b>}
                              {item.status === 'past_due' && item.missing > 0 && <b>{intl.formatMessage(messages.missing, { count: item.missing })}</b>}
                            </small>
                          </span>
                          <span className="tas-item__links">
                            {item.review_url && (
                              <Button size="sm" variant="primary" href={item.review_url}>{intl.formatMessage(messages.grade)}</Button>
                            )}
                            <Button size="sm" variant="outline-primary" onClick={() => navigate(`/course/${item.course_id}?show=${encodeURIComponent(item.id)}`)}>
                              {intl.formatMessage(messages.edit)}
                            </Button>
                            <Button size="sm" variant="outline-primary" href={item.url}>{intl.formatMessage(messages.view)}</Button>
                            {item.gradebook_url && (
                              <Button size="sm" variant="outline-primary" href={item.gradebook_url}>{intl.formatMessage(messages.gradebook)}</Button>
                            )}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </>
        )}
      </>
    );
  }

  return (
    <div className="tas-page">
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Container fluid size="xl" className="tas-container">{body}</Container>
    </div>
  );
};

export default TeamAssessmentsPage;
