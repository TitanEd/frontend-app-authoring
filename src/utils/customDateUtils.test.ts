import moment from 'moment-timezone';

import {
  convertToDateFromString,
  convertToLocalTime,
  convertToStringFromDate,
  getUserTimezoneLabel,
  isValidDate,
  localDateTimeToUtc,
  localizeStudioDate,
} from './customDateUtils';

// Expectations are computed for the time zone the tests run in, so the suite
// passes in UTC (the default test run) and in any other zone (TZ=Asia/Kolkata …).
const offset = (iso: string) => moment(iso).utcOffset();

describe('customDateUtils', () => {
  it('shows a stored UTC value as the same moment in local time', () => {
    const date = convertToDateFromString('2026-01-01T00:00:00Z') as Date;
    expect(date.getTime()).toBe(Date.UTC(2026, 0, 1, 0, 0));
    expect(convertToDateFromString('')).toBeUndefined();
  });

  it('stores a picked local date as UTC in the stock format', () => {
    const local = new Date(2026, 0, 1, 9, 30);
    const expected = moment(local).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
    expect(convertToStringFromDate(local)).toBe(expected);
    expect(convertToStringFromDate(local)).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:00Z$/);
    expect(convertToStringFromDate(null)).toBe('');
  });

  it('gives back the value it was given (round trip)', () => {
    const value = '2026-03-29T01:30:00Z';
    expect(convertToStringFromDate(convertToDateFromString(value))).toBe(value);
  });

  it('turns a local date and time from the course creation form into UTC', () => {
    const minutes = offset('2027-01-31T09:30');
    const expected = moment.utc('2027-01-31T09:30').subtract(minutes, 'minutes').format('YYYY-MM-DDTHH:mm:ss[Z]');
    expect(localDateTimeToUtc('2027-01-31', '09:30')).toBe(expected);
    expect(localDateTimeToUtc('2027-01-31', '')).toBe(
      moment('2027-01-31T00:00').utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
    );
    expect(localDateTimeToUtc('', '09:30')).toBeNull();
    expect(localDateTimeToUtc('2027-01-31', '9h')).toBeNull();
  });

  it('accepts real dates only', () => {
    expect(isValidDate(new Date(2026, 0, 1))).toBe(true);
    expect(isValidDate(new Date(12026, 0, 1))).toBe(false);
    expect(isValidDate(new Date('x'))).toBe(false);
  });

  it('names the time zone and its offset', () => {
    expect(getUserTimezoneLabel()).toMatch(/^\S+ GMT[+-]\d\d:\d\d$/);
    expect(getUserTimezoneLabel()).not.toContain('Asia/Calcutta');
  });

  it('shows Studio date texts in local time and leaves other text alone', () => {
    const local = moment.utc('2026-01-01T00:30').local();
    expect(convertToLocalTime('Jan 01, 2026 at 00:30 UTC')).toBe(
      `${local.format('MMM DD, YYYY [at] hh:mm A')} (${getUserTimezoneLabel(local)})`,
    );
    expect(localizeStudioDate('Jan 01, 2026 at 00:30 UTC')).toContain(local.format('hh:mm A'));
    expect(localizeStudioDate('soon')).toBe('soon');
    expect(localizeStudioDate('')).toBe('');
  });
});
