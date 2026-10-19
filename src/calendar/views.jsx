/*
 * The four views of the calendar (month, week, day, agenda), the event chip and row, the
 * loading skeleton and the date formats. Same file in both forks.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';

import {
  addDays, dayKey, isMultiDay, monthWeeks, sameDay, startOfDay,
} from './dates';
import messages from './messages';
import { TYPE_META, kindLabel, shortTitle } from './meta';

export const eventShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  startDate: PropTypes.instanceOf(Date).isRequired,
  all_day: PropTypes.bool,
  course: PropTypes.string,
  section: PropTypes.string,
  hidden: PropTypes.bool,
  status: PropTypes.string,
  registered: PropTypes.bool,
});

const formatRange = (locale, options, start, end) => {
  try {
    const format = new Intl.DateTimeFormat(locale, options);
    if (typeof format.formatRange === 'function') { return format.formatRange(start, end); }
    return `${format.format(start)} – ${format.format(end)}`;
  } catch {
    return `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`;
  }
};

/** Date and time texts in the person's language. */
export const useFormats = () => {
  const intl = useIntl();
  const time = (date) => intl.formatTime(date, { hour: 'numeric', minute: '2-digit' });
  const shortDate = (date) => intl.formatDate(date, { month: 'short', day: 'numeric' });
  const longDate = (date) => intl.formatDate(date, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const dayRange = (start, end) => formatRange(intl.locale, { month: 'long', day: 'numeric', year: 'numeric' }, start, end);
  const isDue = (event) => !event.endDate && (event.type === 'assignment' || event.type === 'exam');

  const whenShort = (event) => {
    if (event.all_day) { return intl.formatMessage(messages.allDay); }
    if (!event.endDate) {
      return isDue(event) ? intl.formatMessage(messages.dueAt, { time: time(event.startDate) }) : time(event.startDate);
    }
    if (isMultiDay(event)) {
      return `${shortDate(event.startDate)} ${time(event.startDate)} – ${shortDate(event.endDate)} ${time(event.endDate)}`;
    }
    return `${time(event.startDate)} – ${time(event.endDate)}`;
  };
  const whenLong = (event) => {
    if (event.all_day) {
      if (sameDay(event.startDate, event.lastDay)) { return longDate(event.startDate); }
      return dayRange(event.startDate, event.lastDay);
    }
    if (!event.endDate) {
      const at = `${longDate(event.startDate)}, ${time(event.startDate)}`;
      return isDue(event) ? intl.formatMessage(messages.dueAt, { time: at }) : at;
    }
    if (isMultiDay(event)) {
      return `${longDate(event.startDate)}, ${time(event.startDate)} – ${longDate(event.endDate)}, ${time(event.endDate)}`;
    }
    return `${longDate(event.startDate)}, ${time(event.startDate)} – ${time(event.endDate)}`;
  };
  const relativeDay = (day, today) => {
    if (sameDay(day, today)) { return intl.formatMessage(messages.today); }
    if (sameDay(day, addDays(today, 1))) { return intl.formatMessage(messages.tomorrow); }
    return null;
  };
  return {
    intl, time, shortDate, longDate, dayRange, whenShort, whenLong, relativeDay,
  };
};

const typeLabel = (intl, event) => intl.formatMessage((TYPE_META[event.type] || TYPE_META.course_event).label);

/** A small button for one event in a month cell. */
export const EventChip = ({ event, onOpen, day }) => {
  const { intl, whenShort } = useFormats();
  const continues = !event.all_day && !sameDay(event.startDate, day);
  const label = `${typeLabel(intl, event)}: ${shortTitle(event)}, ${whenShort(event)}`;
  return (
    <button
      type="button"
      className={`tcal-chip tcal-type--${event.type} ${event.all_day || continues ? 'tcal-chip--block' : ''}`}
      onClick={() => onOpen(event)}
      aria-label={label}
      title={label}
    >
      {!event.all_day && !continues && (
        <span className="tcal-chip__time">{intl.formatTime(event.startDate, { hour: 'numeric', minute: '2-digit' })}</span>
      )}
      <span className="tcal-chip__title">{shortTitle(event)}</span>
    </button>
  );
};

EventChip.propTypes = {
  event: eventShape.isRequired,
  onOpen: PropTypes.func.isRequired,
  day: PropTypes.instanceOf(Date).isRequired,
};

/** One event as a row (week, day, agenda views and the "next 7 days" list). */
export const EventRow = ({
  event, onOpen, compact, withDate,
}) => {
  const { intl, whenShort, shortDate } = useFormats();
  const meta = TYPE_META[event.type] || TYPE_META.course_event;
  const where = [event.course, event.section].filter(Boolean).join(' · ');
  const kind = kindLabel(intl, event);
  return (
    <button
      type="button"
      className={`tcal-row tcal-type--${event.type} ${compact ? 'tcal-row--compact' : ''}`}
      onClick={() => onOpen(event)}
    >
      <span className="tcal-row__icon" aria-hidden="true"><Icon src={meta.icon} size="sm" /></span>
      <span className="tcal-row__main">
        <span className="tcal-row__when">
          {withDate && !isMultiDay(event) ? `${shortDate(event.startDate)} · ` : ''}
          {whenShort(event)}
        </span>
        <strong className="tcal-row__title">{shortTitle(event)}</strong>
        {!compact && where && event.type !== 'course' && event.type !== 'update' && (
          <span className="tcal-row__where">{where}</span>
        )}
        {!compact && (
          <span className="tcal-row__tags">
            <span className="tcal-tag tcal-tag--type">{intl.formatMessage(meta.label)}</span>
            {kind && <span className="tcal-tag">{kind}</span>}
            {event.hidden && <span className="tcal-tag tcal-tag--warn">{intl.formatMessage(messages.statusStaffOnly)}</span>}
            {event.status === 'ongoing' && <span className="tcal-tag tcal-tag--live">{intl.formatMessage(messages.statusLive)}</span>}
            {event.registered && <span className="tcal-tag">{intl.formatMessage(messages.statusRegistered)}</span>}
          </span>
        )}
      </span>
    </button>
  );
};

EventRow.propTypes = {
  event: eventShape.isRequired,
  onOpen: PropTypes.func.isRequired,
  compact: PropTypes.bool,
  withDate: PropTypes.bool,
};

EventRow.defaultProps = { compact: false, withDate: false };

const weekdayNames = (intl, week, style) => week.map((day) => intl.formatDate(day, { weekday: style }));

export const MonthView = ({
  date, weekStart, byDay, today, onOpenEvent, onOpenDay, maxPerDay,
}) => {
  const { intl, longDate } = useFormats();
  const weeks = monthWeeks(date, weekStart);
  const long = weekdayNames(intl, weeks[0], 'long');
  return (
    <table className="tcal-month">
      <thead>
        <tr>
          {weekdayNames(intl, weeks[0], 'short').map((name, index) => (
            <th key={long[index]} scope="col" abbr={long[index]}>{name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week) => (
          <tr key={dayKey(week[0])}>
            {week.map((day) => {
              const events = byDay.get(dayKey(day)) || [];
              const hidden = events.length - maxPerDay;
              const outside = day.getMonth() !== date.getMonth();
              const isToday = sameDay(day, today);
              return (
                <td
                  key={dayKey(day)}
                  className={`tcal-cell ${outside ? 'is-outside' : ''} ${isToday ? 'is-today' : ''} ${day < today ? 'is-past' : ''}`}
                  aria-current={isToday ? 'date' : undefined}
                >
                  <button
                    type="button"
                    className="tcal-cell__day"
                    onClick={() => onOpenDay(day)}
                    aria-label={`${intl.formatMessage(messages.openDay, { date: longDate(day) })}, ${intl.formatMessage(messages.dayEvents, { count: events.length })}`}
                  >
                    {intl.formatNumber(day.getDate())}
                  </button>
                  <div className="tcal-cell__events">
                    {events.slice(0, hidden > 0 ? maxPerDay - 1 : maxPerDay).map((event) => (
                      <EventChip key={event.id} event={event} day={day} onOpen={onOpenEvent} />
                    ))}
                    {hidden > 0 && (
                      <button type="button" className="tcal-more" onClick={() => onOpenDay(day)}>
                        {intl.formatMessage(messages.more, { count: hidden + 1 })}
                      </button>
                    )}
                  </div>
                  {events.length > 0 && (
                    <span className="tcal-dots" aria-hidden="true">
                      {events.slice(0, 4).map((event) => <span key={event.id} className={`tcal-dot tcal-type--${event.type}`} />)}
                    </span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

MonthView.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  weekStart: PropTypes.number.isRequired,
  byDay: PropTypes.instanceOf(Map).isRequired,
  today: PropTypes.instanceOf(Date).isRequired,
  onOpenEvent: PropTypes.func.isRequired,
  onOpenDay: PropTypes.func.isRequired,
  maxPerDay: PropTypes.number,
};

MonthView.defaultProps = { maxPerDay: 3 };

export const WeekView = ({
  start, byDay, today, onOpenEvent, onOpenDay,
}) => {
  const { intl, longDate } = useFormats();
  const days = Array.from({ length: 7 }, (_day, index) => addDays(start, index));
  return (
    <div className="tcal-week">
      {days.map((day) => {
        const events = byDay.get(dayKey(day)) || [];
        const isToday = sameDay(day, today);
        return (
          <section key={dayKey(day)} className={`tcal-week__day ${isToday ? 'is-today' : ''}`} aria-label={longDate(day)}>
            <h3>
              <button type="button" onClick={() => onOpenDay(day)} aria-current={isToday ? 'date' : undefined}>
                <span>{intl.formatDate(day, { weekday: 'short' })}</span>
                <strong>{intl.formatNumber(day.getDate())}</strong>
              </button>
            </h3>
            {events.length ? (
              <ul className="tcal-list">
                {events.map((event) => <li key={event.id}><EventRow event={event} onOpen={onOpenEvent} compact /></li>)}
              </ul>
            ) : <p className="tcal-week__none">{intl.formatMessage(messages.dayEmpty)}</p>}
          </section>
        );
      })}
    </div>
  );
};

WeekView.propTypes = {
  start: PropTypes.instanceOf(Date).isRequired,
  byDay: PropTypes.instanceOf(Map).isRequired,
  today: PropTypes.instanceOf(Date).isRequired,
  onOpenEvent: PropTypes.func.isRequired,
  onOpenDay: PropTypes.func.isRequired,
};

/** Days with their events, one after the other (day and agenda views). */
export const AgendaView = ({
  start, days, byDay, today, onOpenEvent, showEmptyDays,
}) => {
  const { intl, longDate, relativeDay } = useFormats();
  const list = Array.from({ length: days }, (_day, index) => addDays(start, index))
    .filter((day) => showEmptyDays || (byDay.get(dayKey(day)) || []).length);
  return (
    <div className="tcal-agenda">
      {list.map((day) => {
        const events = byDay.get(dayKey(day)) || [];
        const relative = relativeDay(day, today);
        return (
          <section key={dayKey(day)} className={`tcal-agenda__day ${sameDay(day, today) ? 'is-today' : ''}`}>
            <h3>
              <span className="tcal-agenda__num">{intl.formatNumber(day.getDate())}</span>
              <span>
                {relative && <strong>{relative}</strong>}
                <span>{longDate(day)}</span>
              </span>
            </h3>
            {events.length ? (
              <ul className="tcal-list">
                {events.map((event) => <li key={event.id}><EventRow event={event} onOpen={onOpenEvent} /></li>)}
              </ul>
            ) : <p className="tcal-week__none">{intl.formatMessage(messages.dayEmpty)}</p>}
          </section>
        );
      })}
    </div>
  );
};

AgendaView.propTypes = {
  start: PropTypes.instanceOf(Date).isRequired,
  days: PropTypes.number.isRequired,
  byDay: PropTypes.instanceOf(Map).isRequired,
  today: PropTypes.instanceOf(Date).isRequired,
  onOpenEvent: PropTypes.func.isRequired,
  showEmptyDays: PropTypes.bool,
};

AgendaView.defaultProps = { showEmptyDays: false };

/** Grey blocks in the shape of the view while it loads. */
export const Skeleton = ({ view, label }) => (
  <div className={`tcal-skeleton tcal-skeleton--${view}`} role="status" aria-live="polite">
    <span className="sr-only">{label}</span>
    {Array.from({ length: view === 'month' ? 35 : 6 }, (_item, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <span key={index} className="tcal-skeleton__block" aria-hidden="true" />
    ))}
  </div>
);

Skeleton.propTypes = { view: PropTypes.string.isRequired, label: PropTypes.string.isRequired };

/** The small month of the side panel: pick a date, see which days have events. */
export const MiniMonth = ({
  month, weekStart, selected, today, busyDays, onPick, onMonth,
}) => {
  const { intl, longDate } = useFormats();
  const weeks = monthWeeks(month, weekStart);
  return (
    <div className="tcal-mini">
      <div className="tcal-mini__head">
        <button type="button" className="tcal-icon-btn tcal-flip" onClick={() => onMonth(-1)} aria-label={intl.formatMessage(messages.miniPrevious)}>
          <span aria-hidden="true">‹</span>
        </button>
        <strong aria-live="polite">{intl.formatDate(month, { month: 'long', year: 'numeric' })}</strong>
        <button type="button" className="tcal-icon-btn tcal-flip" onClick={() => onMonth(1)} aria-label={intl.formatMessage(messages.miniNext)}>
          <span aria-hidden="true">›</span>
        </button>
      </div>
      <table className="tcal-mini__grid" aria-label={intl.formatMessage(messages.miniLabel)}>
        <thead>
          <tr>{weeks[0].map((day) => <th key={dayKey(day)} scope="col" abbr={intl.formatDate(day, { weekday: 'long' })}>{intl.formatDate(day, { weekday: 'narrow' })}</th>)}</tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={dayKey(week[0])}>
              {week.map((day) => (
                <td key={dayKey(day)}>
                  <button
                    type="button"
                    className={[
                      'tcal-mini__day',
                      day.getMonth() !== month.getMonth() ? 'is-outside' : '',
                      sameDay(day, today) ? 'is-today' : '',
                      sameDay(day, selected) ? 'is-selected' : '',
                      busyDays.has(dayKey(day)) ? 'is-busy' : '',
                    ].join(' ')}
                    aria-label={longDate(day)}
                    aria-pressed={sameDay(day, selected)}
                    onClick={() => onPick(startOfDay(day))}
                  >
                    {intl.formatNumber(day.getDate())}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

MiniMonth.propTypes = {
  month: PropTypes.instanceOf(Date).isRequired,
  weekStart: PropTypes.number.isRequired,
  selected: PropTypes.instanceOf(Date).isRequired,
  today: PropTypes.instanceOf(Date).isRequired,
  busyDays: PropTypes.instanceOf(Set).isRequired,
  onPick: PropTypes.func.isRequired,
  onMonth: PropTypes.func.isRequired,
};
