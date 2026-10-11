import moment from 'moment-timezone';

export const convertToLocalTime = (releaseDate: string): string => {
  if (!releaseDate) {
    return 'Invalid date';
  }

  const localDate = moment.utc(releaseDate, 'MMM DD, YYYY at HH:mm UTC', true);

  if (!localDate.isValid()) {
    return 'Invalid date';
  }

  const timezoneName = moment.tz.guess();
  const normalizedTimezone = timezoneName === 'Asia/Calcutta' ? 'Asia/Kolkata' : timezoneName;
  const formattedDate = localDate.local().format('MMM DD, YYYY [at] hh:mm A');
  const timezoneOffset = localDate.local().format('Z');

  return `${formattedDate} (${normalizedTimezone} GMT${timezoneOffset})`;
};

// Custom UI date helpers: dates are shown and picked in the user's local time
// zone and stored as UTC (the stock helpers in src/utils.tsx keep UTC).
const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss\\Z';

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
  return moment(date).utc().format('YYYY-MM-DDTHH:mm:ssZ');
};

export const isValidDate = (date: moment.MomentInput) => moment(date, DATE_TIME_FORMAT, true).isValid();

/** User time zone label, e.g. "Asia/Kolkata GMT+05:30". */
export const getUserTimezoneLabel = (): string => {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return `${userTimezone} GMT${moment.tz(userTimezone).format('Z')}`;
};
