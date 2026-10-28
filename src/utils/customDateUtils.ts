import moment from 'moment-timezone';

// Custom UI date helpers: dates are shown and picked in the computer's time zone
// and stored as UTC, so Studio and the LMS keep working with UTC values
// (the stock helpers in src/utils.tsx show the UTC time itself).
const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss\\Z';

// Studio's text form of a date, e.g. "Jan 01, 2026 at 00:30 UTC".
const STUDIO_DATE_LABEL_FORMAT = 'MMM DD, YYYY [at] HH:mm [UTC]';

/** The computer's time zone name; the old "Asia/Calcutta" name becomes "Asia/Kolkata". */
export const getUserTimezone = (): string => {
  const timezone = moment.tz.guess() || 'UTC';
  return timezone === 'Asia/Calcutta' ? 'Asia/Kolkata' : timezone;
};

/** User time zone label, e.g. "Asia/Kolkata GMT+05:30" (offset at the given moment, else now). */
export const getUserTimezoneLabel = (at?: moment.MomentInput): string => {
  const timezone = getUserTimezone();
  return `${timezone} GMT${moment(at || undefined).local().format('Z')}`;
};

/** Studio's "Jan 01, 2026 at 00:30 UTC" in local time: "Jan 01, 2026 at 06:00 AM (Asia/Kolkata GMT+05:30)". */
export const convertToLocalTime = (releaseDate: string): string => {
  if (!releaseDate) {
    return 'Invalid date';
  }

  const localDate = moment.utc(releaseDate, STUDIO_DATE_LABEL_FORMAT, true);

  if (!localDate.isValid()) {
    return 'Invalid date';
  }

  const formattedDate = localDate.local().format('MMM DD, YYYY [at] hh:mm A');
  return `${formattedDate} (${getUserTimezoneLabel(localDate)})`;
};

/** Like convertToLocalTime, but gives back any text it cannot read unchanged. */
export const localizeStudioDate = (text?: string | null): string => {
  if (!text) {
    return text || '';
  }
  const local = convertToLocalTime(text);
  return local === 'Invalid date' ? text : local;
};

/** UTC string (YYYY-MM-DDTHH:MM:SSZ) to a local Date for react-datepicker. */
export const convertToDateFromString = (dateStr?: string | null): Date | undefined => {
  if (!dateStr) {
    return undefined;
  }
  return moment(dateStr).local().toDate();
};

/** Local Date from react-datepicker to a UTC string (YYYY-MM-DDTHH:MM:SSZ). */
export const convertToStringFromDate = (date: moment.MomentInput): string => {
  if (!date) {
    return '';
  }
  return moment(date).utc().format(DATE_TIME_FORMAT);
};

/** A real date with a year of at most four digits (half-typed years are ignored). */
export const isValidDate = (date: moment.MomentInput) => {
  const value = moment(date);
  return value.isValid() && value.year() <= 9999;
};

/**
 * A local date (YYYY-MM-DD) and time (HH:mm, '' = 00:00) as a UTC string,
 * e.g. 2027-01-31 + 09:30 in Asia/Kolkata -> 2027-01-31T04:00:00Z.
 */
export const localDateTimeToUtc = (date?: string, time?: string): string | null => {
  if (!date) {
    return null;
  }
  const local = moment(`${date}T${time || '00:00'}`, 'YYYY-MM-DDTHH:mm', true);
  return local.isValid() ? local.utc().format(DATE_TIME_FORMAT) : null;
};
