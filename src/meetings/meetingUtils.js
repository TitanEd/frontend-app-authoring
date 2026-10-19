/*
 * "My Meetings": helpers shared by the learner page (learner dashboard) and the course-team page
 * (Studio). The file is the same in both MFEs: change one, copy to the other.
 *
 * Data: GET {LMS}/titaned/api/v2/my-meetings/ and …/my-meetings/teaching/ (control-hub
 * zoom_integration/my_meetings.py): one item per class (occurrence) with ISO UTC `start`/`end`.
 */

export const DAY = 24 * 60 * 60 * 1000;
export const PAGE_SIZE = 20;

// Zoom numbers the days of the week 1 (Sunday) to 7 (Saturday). 1 November 2026 is a Sunday:
// new Date(2026, 10, zoomDay) gives a date with that weekday, to name it in the page language.
export const ZOOM_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];
export const weekdayDate = (zoomDay) => new Date(2026, 10, zoomDay, 12);

// Parts of a date in a time zone ('' = the browser's), as numbers.
const partsIn = (date, timeZone) => {
  const format = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone || undefined,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const parts = {};
  format.formatToParts(date).forEach(({ type, value }) => {
    parts[type] = Number(value);
  });
  return parts;
};

// The long name of a time zone in the page language ("India Standard Time").
export const zoneNameOf = (locale, timeZone, date = new Date()) => {
  try {
    const parts = new Intl.DateTimeFormat(locale, { timeZone: timeZone || undefined, timeZoneName: 'long' })
      .formatToParts(date);
    return (parts.find((part) => part.type === 'timeZoneName') || {}).value || timeZone || '';
  } catch {
    return timeZone || '';
  }
};

// A sortable day key (YYYYMMDD) of a date in a time zone.
export const dayKey = (date, timeZone) => {
  const { year, month, day } = partsIn(date, timeZone);
  return year * 10000 + month * 100 + day;
};

const keyToUtcNoon = (key) => Date.UTC(Math.floor(key / 10000), (Math.floor(key / 100) % 100) - 1, key % 100, 12);

// Whole days from today to the date, in the time zone (0 = today).
export const daysAway = (date, now, timeZone) => {
  const difference = keyToUtcNoon(dayKey(date, timeZone)) - keyToUtcNoon(dayKey(now, timeZone));
  return Math.round(difference / DAY);
};

// Is the class in the period? ('' any, today, week = Monday to Sunday, month, custom = [from, to] dates).
export const inPeriod = (start, period, now, timeZone, from = '', to = '') => {
  if (!period) { return true; }
  const key = dayKey(start, timeZone);
  const today = dayKey(now, timeZone);
  if (period === 'today') { return key === today; }
  if (period === 'week') {
    const weekday = new Date(keyToUtcNoon(today)).getUTCDay(); // 0 = Sunday
    const monday = keyToUtcNoon(today) - ((weekday + 6) % 7) * DAY;
    const value = keyToUtcNoon(key);
    return value >= monday && value < monday + 7 * DAY;
  }
  if (period === 'month') { return Math.floor(key / 100) === Math.floor(today / 100); }
  if (period === 'custom') {
    const asKey = (text) => (text ? Number(text.replaceAll('-', '')) : null);
    const low = asKey(from);
    const high = asKey(to);
    return (!low || key >= low) && (!high || key <= high);
  }
  return true;
};

// The tab a class belongs to: live, upcoming or past (ended, and cancelled classes of the past).
export const tabOf = (item, now) => {
  if (item.status === 'live') { return 'live'; }
  if (item.status === 'upcoming') { return 'upcoming'; }
  if (item.status === 'cancelled' && item.startDate > now) { return 'upcoming'; }
  return 'past';
};

// Items of the API with Date objects; `now` decides whether the join button is open.
export function prepare(items, now) {
  return items.map((item) => {
    const startDate = new Date(item.start);
    const endDate = new Date(item.end);
    const opens = new Date(item.join_opens);
    let { status } = item;
    // The list may be minutes old: move a class on when its time comes.
    if (status === 'upcoming' && now >= startDate) { status = 'live'; }
    if ((status === 'upcoming' || status === 'live') && now >= endDate && item.status !== 'live') { status = 'ended'; }
    const canJoin = status === 'live' || (status === 'upcoming' && now >= opens);
    return {
      ...item,
      startDate,
      endDate,
      opensDate: opens,
      status,
      canJoin,
    };
  });
}

export const matchesText = (item, text) => {
  if (!text) { return true; }
  return `${item.topic} ${item.course} ${item.host} ${item.agenda}`.toLowerCase().includes(text);
};

// The page of a grouped list: PAGE_SIZE items, a group that does not fit goes on on the next page.
export const paginateGroups = (groups, page) => {
  let skip = (page - 1) * PAGE_SIZE;
  let room = PAGE_SIZE;
  return groups.map((group) => {
    const list = group.list.slice(skip, skip + room);
    skip = Math.max(0, skip - group.list.length);
    room -= list.length;
    return { ...group, total: group.list.length, list };
  }).filter((group) => group.list.length > 0);
};

// Classes grouped by day (key YYYYMMDD in the time zone); `descending` for the past.
export const groupByDay = (items, timeZone, descending = false) => {
  const byDay = new Map();
  [...items]
    .sort((a, b) => (descending ? b.startDate - a.startDate : a.startDate - b.startDate))
    .forEach((item) => {
      const key = dayKey(item.startDate, timeZone);
      if (!byDay.has(key)) { byDay.set(key, []); }
      byDay.get(key).push(item);
    });
  return [...byDay.entries()].map(([key, list]) => ({ key, date: list[0].startDate, list }));
};

// ---- calendar file (.ics) of one class ----

const icsDate = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
function icsText(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}
// Lines of an .ics file are at most 75 octets; longer ones go on after a space.
const fold = (line) => {
  const out = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  out.push(rest);
  return out.join('\r\n');
};

export const icsFor = (item, { joinLabel = 'Join', courseLabel = 'Course' } = {}) => {
  const description = [
    item.course ? `${courseLabel}: ${item.course}` : '',
    item.agenda || '',
    `${joinLabel}: ${item.join_url}`,
  ].filter(Boolean).join('\n');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TELS//My Meetings//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${item.id}@tels-meetings`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(item.startDate)}`,
    `DTEND:${icsDate(item.endDate)}`,
    `SUMMARY:${icsText(item.topic)}`,
    `DESCRIPTION:${icsText(description)}`,
    `URL:${item.join_url}`,
    `LOCATION:${icsText(item.join_url)}`,
    item.status === 'cancelled' ? 'STATUS:CANCELLED' : 'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsText(item.topic)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].map(fold).join('\r\n');
};

export const downloadIcs = (item, labels) => {
  const blob = new Blob([icsFor(item, labels)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${
    (item.topic || 'meeting').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 60) || 'meeting'
  }.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// ---- the date range the page asks the API for ----

// '' (the default window of the API) or { start, end } ISO strings for a custom range.
export const rangeParams = (period, from, to) => {
  if (period !== 'custom' || (!from && !to)) { return {}; }
  const params = {};
  if (from) { params.start = new Date(`${from}T00:00:00`).toISOString(); }
  if (to) { params.end = new Date(new Date(`${to}T00:00:00`).getTime() + DAY).toISOString(); }
  return params;
};
