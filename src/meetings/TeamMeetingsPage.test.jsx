import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import TeamMeetingsPage from './TeamMeetingsPage';

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));
jest.mock('@edx/frontend-platform/auth', () => ({ getAuthenticatedHttpClient: jest.fn() }));

const LIST = 'http://lms.test/titaned/api/v2/my-meetings/teaching/';
const OPTIONS = 'http://lms.test/titaned/api/v2/my-meetings/teaching/options/';
const MINUTE = 60 * 1000;
const at = (minutes) => new Date(Date.now() + minutes * MINUTE).toISOString();
const item = (overrides = {}) => ({
  id: 'occ-1',
  meeting_id: 'm-1',
  topic: 'Feedback that works',
  agenda: '',
  course_id: 'course-v1:A+B+C',
  course: 'Leadership',
  start: at(2 * 24 * 60),
  end: at(2 * 24 * 60 + 45),
  duration: 45,
  time_zone: 'UTC',
  host: 'Ada',
  is_recurring: true,
  occurrence_count: 4,
  status: 'upcoming',
  join_opens: at(2 * 24 * 60 - 15),
  join_url: 'http://lms.test/join/m-1/meeting/',
  recording_url: '',
  can_manage: true,
  ...overrides,
});
const options = {
  courses: [{ id: 'course-v1:A+B+C', name: 'Leadership' }],
  time_zones: [{ value: 'UTC', label: 'UTC' }, { value: 'Asia/Kolkata', label: 'Kolkata' }],
  default_time_zone: 'Asia/Kolkata',
  max_duration: 120,
  max_occurrences: 60,
  interval_max: { daily: 99, weekly: 50, monthly: 10 },
  settings: {
    waiting_room: { allowed: true, default: true },
    mute_upon_entry: { allowed: true, default: true },
    auto_recording: { allowed: false, default: false },
    participant_video: { allowed: true, default: true },
  },
};

let client;
const load = (items) => {
  client = {
    get: jest.fn((url) => {
      if (url === OPTIONS) { return Promise.resolve({ data: options }); }
      if (url === LIST) {
        return Promise.resolve({
          data: { items, courses: [{ id: 'course-v1:A+B+C', name: 'Leadership' }], time_zone: 'UTC' },
        });
      }
      return Promise.resolve({
        data: {
          meeting: {
            id: 'm-1',
            course_id: 'course-v1:A+B+C',
            topic: 'Feedback that works',
            agenda: '',
            start: '2030-01-07T10:00',
            time_zone: 'UTC',
            duration: 45,
            recurrence: { type: 'weekly', interval: 1, weekly_days: [2], end_mode: 'count', end_times: 4 },
            settings: {},
          },
        },
      });
    }),
    post: jest.fn().mockResolvedValue({ data: { success: true } }),
    put: jest.fn().mockResolvedValue({ data: { success: true } }),
    delete: jest.fn().mockResolvedValue({}),
  };
  getAuthenticatedHttpClient.mockReturnValue(client);
  return render(
    <IntlProvider locale="en">
      <TeamMeetingsPage />
    </IntlProvider>,
  );
};

describe('TeamMeetingsPage', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('lists the classes of the courses taught', async () => {
    load([item()]);
    expect(await screen.findByRole('heading', { name: 'Feedback that works' })).toBeInTheDocument();
    expect(client.get).toHaveBeenCalledWith(LIST, { params: {} });
    expect(screen.getByText('4 classes in this period')).toBeInTheDocument();
  });

  it('schedules a weekly class', async () => {
    load([]);
    fireEvent.click((await screen.findAllByRole('button', { name: 'Schedule a class' }))[0]);
    fireEvent.change(await screen.findByLabelText('Title'), { target: { value: 'Office hours' } });
    fireEvent.change(screen.getByLabelText('Repeat', { selector: 'select' }), { target: { value: 'weekly' } });
    fireEvent.click(screen.getByRole('button', { name: 'Monday' }));
    fireEvent.click(screen.getByRole('button', { name: 'Wednesday' }));
    expect(screen.getByText(/Every week on Monday and Wednesday, 4 times/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Schedule' }));
    await waitFor(() => expect(client.post).toHaveBeenCalled());
    const [url, body] = client.post.mock.calls[0];
    expect(url).toBe('http://lms.test/titaned/api/v2/meetings/');
    expect(body).toMatchObject({
      course_id: 'course-v1:A+B+C',
      topic: 'Office hours',
      time_zone: 'Asia/Kolkata',
      duration: 60,
      recurrence: { type: 'weekly', interval: 1, weekly_days: [2, 4], end_mode: 'count', end_times: 4 },
      settings: { waiting_room: true, mute_upon_entry: true, participant_video: true },
    });
  });

  it('shows the messages of the server under the fields', async () => {
    load([]);
    client.post.mockRejectedValue({
      response: { data: { message: 'Give the class a title.', errors: { topic: 'Give the class a title.' } } },
    });
    fireEvent.click((await screen.findAllByRole('button', { name: 'Schedule a class' }))[0]);
    fireEvent.change(await screen.findByLabelText('Title'), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: 'Schedule' }));
    expect(await screen.findAllByText('Give the class a title.')).toHaveLength(2);
  });

  it('changes only one class of a series', async () => {
    load([item()]);
    const row = (await screen.findByRole('heading', { name: 'Feedback that works' })).closest('article');
    fireEvent.click(within(row).getByRole('button', { name: 'Edit' }));
    await waitFor(() =>
      expect(client.get).toHaveBeenCalledWith('http://lms.test/titaned/api/v2/meetings/m-1/', {
        params: { occurrence: 'occ-1' },
      })
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(client.put).toHaveBeenCalled());
    expect(client.put.mock.calls[0][1].occurrence_id).toBe('occ-1');
  });

  it('cancels the whole series', async () => {
    load([item()]);
    const row = (await screen.findByRole('heading', { name: 'Feedback that works' })).closest('article');
    fireEvent.click(within(row).getByRole('button', { name: /More actions/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel class' }));
    fireEvent.click(await screen.findByRole('button', { name: /The whole series/ }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel class' }));
    await waitFor(() =>
      expect(client.post).toHaveBeenCalledWith('http://lms.test/titaned/api/v2/meetings/m-1/cancel/', {})
    );
  });
});
