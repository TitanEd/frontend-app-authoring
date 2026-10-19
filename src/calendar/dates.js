/*
 * Date logic of the calendar (no React): visible ranges of the views, the month grid, where
 * events fall, filters and the "next 7 days" list. Everything is in the person's own time
 * zone; all-day events carry plain dates ("YYYY-MM-DD", inclusive end) and are never shifted.
 *
 * The same file is in the learner-dashboard and authoring forks (src/calendar/).
 */

export const VIEWS = ['month', 'week', 'day', 'agenda'];
export const AGENDA_DAYS = 30;
export const UPCOMING_DAYS = 7;
export const JOIN_EARLY_MINUTES = 15;
export const TYPES = ['course', 'assignment', 'exam', 'live_class', 'site_event', 'course_event', 'update'];

const pad = (number) => String(number).padStart(2, '0');

export const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
// Calendar days, safe across daylight-saving changes (always local midnight).
export const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
export const sameDay = (a, b) => a.getFullYear() === b.getFullYear()
  && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const dayKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const parseDay = (text) => {
  const [year, month, day] = text.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
};
// "YYYY-MM-DD" and "HH:MM" of a moment, for <input type="date"> and <input type="time">.
export const dateInput = (date) => dayKey(date);
export const timeInput = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

/** First day of the week for a locale (0 = Sunday … 6 = Saturday); Monday when unknown. */
export const firstDayOfWeek = (locale) => {
  try {
    const info = new Intl.Locale(locale);
    const week = typeof info.getWeekInfo === 'function' ? info.getWeekInfo() : info.weekInfo;
    if (week && week.firstDay) { return week.firstDay % 7; }
  } catch {
    // An unknown locale: keep the default.
  }
  return 1;
};

export const startOfWeek = (date, weekStart = 1) => {
  const day = startOfDay(date);
  return addDays(day, -((day.getDay() - weekStart + 7) % 7));
};

/** ``{start, end}`` (end excluded) of what a view shows around ``date``. */
export const visibleRange = (view, date, weekStart = 1) => {
  if (view === 'month') {
    const start = startOfWeek(new Date(date.getFullYear(), date.getMonth(), 1), weekStart);
    return { start, end: addDays(start, 42) };
  }
  if (view === 'week') {
    const start = startOfWeek(date, weekStart);
    return { start, end: addDays(start, 7) };
  }
  const start = startOfDay(date);
  return { start, end: addDays(start, view === 'day' ? 1 : AGENDA_DAYS) };
};

/** The date shown after "next" (direction 1) or "previous" (-1). */
export const step = (view, date, direction) => {
  if (view === 'month') { return new Date(date.getFullYear(), date.getMonth() + direction, 1); }
  if (view === 'week') { return addDays(date, 7 * direction); }
  if (view === 'day') { return addDays(date, direction); }
  return addDays(date, AGENDA_DAYS * direction);
};

/** Six weeks of seven days, as the month view draws them. */
export const monthWeeks = (date, weekStart = 1) => {
  const { start } = visibleRange('month', date, weekStart);
  return Array.from({ length: 6 }, (_week, week) => Array.from(
    { length: 7 },
    (_day, day) => addDays(start, week * 7 + day),
  ));
};

/** An event of the API with real dates: ``startDate``, ``endDate`` (or null) and ``lastDay``. */
export const prepare = (event) => {
  if (event.all_day) {
    const startDate = parseDay(event.start);
    const lastDay = parseDay(event.end || event.start);
    return {
      ...event, startDate, endDate: addDays(lastDay, 1), lastDay: lastDay < startDate ? startDate : lastDay,
    };
  }
  const startDate = new Date(event.start);
  const endDate = event.end ? new Date(event.end) : null;
  // An event that ends at midnight does not reach into the next day.
  const lastDay = endDate && endDate > startDate ? startOfDay(new Date(endDate.getTime() - 1)) : startOfDay(startDate);
  return {
    ...event, startDate, endDate, lastDay,
  };
};

export const isMultiDay = (event) => !sameDay(event.startDate, event.lastDay);

export const compareEvents = (a, b) => {
  if (a.all_day !== b.all_day) { return a.all_day ? -1 : 1; }
  return (a.startDate - b.startDate) || a.title.localeCompare(b.title);
};

/** ``Map(dayKey -> [events])`` of the days from ``start`` to ``end`` (excluded); long events on every day. */
export const eventsByDay = (events, start, end) => {
  const days = new Map();
  events.forEach((event) => {
    let day = startOfDay(event.startDate);
    if (day < start) { day = start; }
    while (day <= event.lastDay && day < end) {
      const key = dayKey(day);
      if (!days.has(key)) { days.set(key, []); }
      days.get(key).push(event);
      day = addDays(day, 1);
    }
  });
  days.forEach((list) => list.sort(compareEvents));
  return days;
};

/** The events that match the course, the shown types and the search text. */
export const filterEvents = (events, { course = '', types = null, query = '' } = {}) => {
  const text = query.trim().toLowerCase();
  return events.filter((event) => (!course || event.course_id === course)
    && (!types || types.has(event.type))
    && (!text || [event.title, event.course, event.section, event.location]
      .filter(Boolean).join(' ').toLowerCase().includes(text)));
};

/** What is still to come from now to the end of the 7th day. */
export const upcoming = (events, now, days = UPCOMING_DAYS) => {
  const until = addDays(startOfDay(now), days);
  return events
    .filter((event) => (event.endDate && !event.all_day ? event.endDate : event.startDate) >= now
      || (event.all_day && event.lastDay >= startOfDay(now)))
    .filter((event) => event.startDate < until)
    .sort(compareEvents);
};

/** A live class may be joined from 15 minutes before its start until its end. */
export const canJoin = (event, now) => {
  const opens = new Date(event.startDate.getTime() - JOIN_EARLY_MINUTES * 60000);
  const closes = event.endDate || new Date(event.startDate.getTime() + 60 * 60000);
  return now >= opens && now < closes;
};

/** The body of a course event for the API, from the form fields. */
export const eventPayload = (form) => {
  const payload = {
    course_id: form.course,
    title: form.title,
    kind: form.kind,
    all_day: form.allDay,
    location: form.location,
    url: form.url,
    description: form.description,
  };
  if (form.allDay) {
    payload.start = form.startDate;
    payload.end = form.endDate || form.startDate;
  } else {
    payload.start = new Date(`${form.startDate}T${form.startTime || '00:00'}`).toISOString();
    payload.end = new Date(`${form.endDate || form.startDate}T${form.endTime || form.startTime || '00:00'}`).toISOString();
  }
  if (form.repeat) { payload.repeat_weeks = Number(form.repeat); }
  return payload;
};
