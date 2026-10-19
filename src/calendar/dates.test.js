import {
  addDays, canJoin, dayKey, eventPayload, eventsByDay, filterEvents, firstDayOfWeek, monthWeeks, prepare,
  startOfWeek, step, upcoming, visibleRange,
} from './dates';

// Same file in both forks (src/calendar/). Run with TZ=GMT, as the other tests of the forks.
const event = (fields) => prepare({
  id: fields.id || fields.title,
  type: 'assignment',
  title: 'Event',
  course_id: 'course-v1:A+B+C',
  course: 'Course',
  all_day: false,
  end: null,
  ...fields,
});

describe('calendar dates', () => {
  test('weeks start on the given day', () => {
    const wednesday = new Date(2026, 9, 14);
    expect(dayKey(startOfWeek(wednesday, 1))).toBe('2026-10-12');
    expect(dayKey(startOfWeek(wednesday, 0))).toBe('2026-10-11');
    expect(dayKey(startOfWeek(wednesday, 6))).toBe('2026-10-10');
    expect([0, 1, 6]).toContain(firstDayOfWeek('en-US'));
    expect(firstDayOfWeek('not a locale ##')).toBe(1);
  });

  test('the month grid has six full weeks around the month', () => {
    const weeks = monthWeeks(new Date(2026, 9, 18), 1);
    expect(weeks).toHaveLength(6);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(dayKey(weeks[0][0])).toBe('2026-09-28');
    expect(dayKey(weeks[5][6])).toBe('2026-11-08');
  });

  test('visible ranges and steps of every view', () => {
    const day = new Date(2026, 9, 18);
    const month = visibleRange('month', day, 1);
    expect([dayKey(month.start), dayKey(month.end)]).toEqual(['2026-09-28', '2026-11-09']);
    const week = visibleRange('week', day, 1);
    expect([dayKey(week.start), dayKey(week.end)]).toEqual(['2026-10-12', '2026-10-19']);
    expect(dayKey(visibleRange('day', day).end)).toBe('2026-10-19');
    expect(dayKey(visibleRange('agenda', day).end)).toBe('2026-11-17');
    expect(dayKey(step('month', new Date(2026, 0, 31), 1))).toBe('2026-02-01');
    expect(dayKey(step('week', day, -1))).toBe('2026-10-11');
    expect(dayKey(step('day', day, 1))).toBe('2026-10-19');
  });

  test('events fall on their days; long and all-day events on each day', () => {
    const events = [
      event({ title: 'Due', start: '2026-10-14T23:59:00Z' }),
      event({
        title: 'Fair', type: 'site_event', start: '2026-10-15T09:00:00Z', end: '2026-10-17T12:00:00Z',
      }),
      event({
        title: 'Holiday', type: 'course_event', all_day: true, start: '2026-10-16', end: '2026-10-16',
      }),
      event({ title: 'Ends at midnight', start: '2026-10-18T10:00:00Z', end: '2026-10-19T00:00:00Z' }),
    ];
    const byDay = eventsByDay(events, new Date(2026, 9, 12), new Date(2026, 9, 19));
    expect(byDay.get('2026-10-14').map((item) => item.title)).toEqual(['Due']);
    expect(byDay.get('2026-10-15').map((item) => item.title)).toEqual(['Fair']);
    // All-day events first.
    expect(byDay.get('2026-10-16').map((item) => item.title)).toEqual(['Holiday', 'Fair']);
    expect(byDay.get('2026-10-17').map((item) => item.title)).toEqual(['Fair']);
    expect(byDay.get('2026-10-18').map((item) => item.title)).toEqual(['Ends at midnight']);
    expect(byDay.has('2026-10-19')).toBe(false);
  });

  test('filters by course, type and text', () => {
    const events = [
      event({ title: 'Quiz 1', start: '2026-10-14T10:00:00Z' }),
      event({
        title: 'Lab', type: 'live_class', course_id: 'course-v1:X+Y+Z', course: 'Physics', start: '2026-10-14T10:00:00Z',
      }),
    ];
    expect(filterEvents(events, { course: 'course-v1:X+Y+Z' }).map((item) => item.title)).toEqual(['Lab']);
    expect(filterEvents(events, { types: new Set(['assignment']) }).map((item) => item.title)).toEqual(['Quiz 1']);
    expect(filterEvents(events, { query: 'physics' }).map((item) => item.title)).toEqual(['Lab']);
    expect(filterEvents(events, { query: 'nothing' })).toEqual([]);
    expect(filterEvents(events)).toHaveLength(2);
  });

  test('the next seven days leave out what is over', () => {
    const now = new Date('2026-10-14T12:00:00Z');
    const events = [
      event({ title: 'Earlier today', start: '2026-10-14T08:00:00Z' }),
      event({ title: 'Running', start: '2026-10-14T11:00:00Z', end: '2026-10-14T13:00:00Z' }),
      event({ title: 'Later today', start: '2026-10-14T18:00:00Z' }),
      event({ title: 'In six days', start: '2026-10-20T08:00:00Z' }),
      event({ title: 'In eight days', start: '2026-10-22T08:00:00Z' }),
      event({
        title: 'Today all day', all_day: true, start: '2026-10-14', end: '2026-10-14',
      }),
    ];
    expect(upcoming(events, now).map((item) => item.title)).toEqual(['Today all day', 'Running', 'Later today', 'In six days']);
  });

  test('a live class opens 15 minutes before it starts', () => {
    const live = event({ type: 'live_class', start: '2026-10-14T10:00:00Z', end: '2026-10-14T11:00:00Z' });
    expect(canJoin(live, new Date('2026-10-14T09:40:00Z'))).toBe(false);
    expect(canJoin(live, new Date('2026-10-14T09:46:00Z'))).toBe(true);
    expect(canJoin(live, new Date('2026-10-14T11:00:00Z'))).toBe(false);
  });

  test('the form becomes the API body', () => {
    const base = {
      course: 'course-v1:A+B+C', title: 'Office hours', kind: 'office_hours', location: '', url: '', description: '',
    };
    const timed = eventPayload({
      ...base, allDay: false, startDate: '2026-10-20', startTime: '15:00', endDate: '2026-10-20', endTime: '16:00', repeat: '2',
    });
    expect(timed.start).toBe(new Date(2026, 9, 20, 15, 0).toISOString());
    expect(timed.end).toBe(new Date(2026, 9, 20, 16, 0).toISOString());
    expect(timed.repeat_weeks).toBe(2);
    const allDay = eventPayload({
      ...base, allDay: true, startDate: '2026-10-20', endDate: '', repeat: 0,
    });
    expect([allDay.start, allDay.end, allDay.repeat_weeks]).toEqual(['2026-10-20', '2026-10-20', undefined]);
    expect(dayKey(addDays(new Date(2026, 2, 28), 2))).toBe('2026-03-30');
  });
});
