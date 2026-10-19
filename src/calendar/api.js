/*
 * Calls to the calendar API of the LMS (control-hub course_calendar). Same file in both forks.
 */
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { dayKey } from './dates';

const base = () => `${getConfig().LMS_BASE_URL}/titaned/api/v2/calendar`;
const client = () => getAuthenticatedHttpClient();

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

// One more try after a short pause: a request can fail while the session token is renewed or
// the server restarts; a bad request (4xx other than 401) is not retried.
export const fetchEvents = async (audience, start, end, retries = 1) => {
  try {
    const response = await client().get(`${base()}/`, {
      params: { audience, start: start.toISOString(), end: end.toISOString() },
    });
    return response.data;
  } catch (error) {
    const code = error?.response?.status;
    if (retries > 0 && (!code || code === 401 || code >= 500)) {
      await sleep(1500);
      return fetchEvents(audience, start, end, retries - 1);
    }
    throw error;
  }
};

export const downloadIcs = async (audience, start, end, { course, types, query }) => {
  const params = {
    audience, start: start.toISOString(), end: end.toISOString(),
  };
  if (course) { params.course = course; }
  if (types) { params.types = types.join(','); }
  if (query) { params.q = query; }
  const response = await client().get(`${base()}/export.ics`, { params, responseType: 'blob' });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `calendar-${dayKey(start)}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export const getFeed = () => client().get(`${base()}/feed/`).then((response) => response.data.url);
export const createFeed = () => client().post(`${base()}/feed/`).then((response) => response.data.url);
export const deleteFeed = () => client().delete(`${base()}/feed/`);

export const saveEvent = (payload, pk) => (pk
  ? client().put(`${base()}/course-events/${pk}/`, payload)
  : client().post(`${base()}/course-events/`, payload)).then((response) => response.data.events);

export const deleteEvent = (pk, series) => client()
  .delete(`${base()}/course-events/${pk}/`, { params: series ? { series: 1 } : {} });
