import React from 'react';
import {
  render, screen, waitFor, fireEvent,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import DashboardBoard from './index';

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));
jest.mock('@edx/frontend-platform/auth', () => ({ getAuthenticatedHttpClient: jest.fn() }));

const URL = 'http://lms.test/titaned/api/v2/dashboard/learner/';

const metric = (uid, title, value) => ({
  uid, type: uid, title, description: '', icon: 'book', tone: 'brand', value,
});
const announcement = (uid, title, text) => ({
  uid, type: 'announcement', title, icon: 'book', size: 'small', data: { text },
});

const boardData = (overrides = {}) => ({
  audience: 'learner',
  metrics: [metric('m1', 'Enrolled courses', 3), metric('m2', 'Points', 50)],
  widgets: [announcement('w1', 'News', 'Welcome back'), announcement('w2', 'Tips', 'Study daily')],
  hidden: [],
  order: ['m1', 'm2', 'w1', 'w2'],
  customized: false,
  ...overrides,
});

const client = {};
const renderBoard = () => render(
  <IntlProvider locale="en"><DashboardBoard audience="learner" /></IntlProvider>,
);
const widgetTitles = () => screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);

describe('DashboardBoard', () => {
  beforeEach(() => {
    client.get = jest.fn().mockResolvedValue({ data: boardData() });
    client.put = jest.fn().mockResolvedValue({ data: boardData() });
    client.delete = jest.fn().mockResolvedValue({ data: boardData() });
    getAuthenticatedHttpClient.mockReturnValue(client);
  });

  it('draws the metrics and widgets the server sends, in its order', async () => {
    renderBoard();
    expect(await screen.findByText('Welcome back')).toBeInTheDocument();
    expect(client.get).toHaveBeenCalledWith(URL);
    expect(screen.getByText('Enrolled courses')).toBeInTheDocument();
    expect(widgetTitles()).toEqual(['News', 'Tips']);
    expect(screen.queryByRole('button', { name: /Save my dashboard/ })).not.toBeInTheDocument();
  });

  it('offers to try again when the dashboard cannot be loaded', async () => {
    client.get = jest.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValue({ data: boardData() });
    renderBoard();
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Welcome back')).toBeInTheDocument();
  });

  it('tells how many cards are hidden', async () => {
    client.get = jest.fn().mockResolvedValue({
      data: boardData({
        metrics: [metric('m1', 'Enrolled courses', 3)],
        hidden: [{
          uid: 'm2', kind: 'metric', type: 'm2', title: 'Points', icon: 'book', tone: 'brand',
        }],
        customized: true,
      }),
    });
    renderBoard();
    expect(await screen.findByText('1 card is hidden')).toBeInTheDocument();
    expect(screen.queryByText('Points')).not.toBeInTheDocument();
  });

  it('saves a new order and the hidden cards', async () => {
    renderBoard();
    fireEvent.click(await screen.findByRole('button', { name: 'Customize' }));
    fireEvent.click(screen.getByRole('button', { name: 'Move "Tips" earlier' }));
    expect(widgetTitles()).toEqual(['Tips', 'News']);
    fireEvent.click(screen.getByRole('button', { name: 'Hide "Points"' }));
    expect(screen.getByRole('button', { name: 'Show "Points"' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save my dashboard' }));
    await waitFor(() => expect(client.put).toHaveBeenCalledWith(URL, {
      order: ['m1', 'm2', 'w2', 'w1'],
      hidden: ['m2'],
    }));
    expect(await screen.findByText('Your dashboard is saved.')).toBeInTheDocument();
  });

  it('does not move the first card earlier or the last one later', async () => {
    renderBoard();
    fireEvent.click(await screen.findByRole('button', { name: 'Customize' }));
    expect(screen.getByRole('button', { name: 'Move "News" earlier' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move "Tips" later' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move "News" later' })).toBeEnabled();
  });

  it('cancel leaves everything as it was', async () => {
    renderBoard();
    fireEvent.click(await screen.findByRole('button', { name: 'Customize' }));
    fireEvent.click(screen.getByRole('button', { name: 'Move "Tips" earlier' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(widgetTitles()).toEqual(['News', 'Tips']);
    expect(client.put).not.toHaveBeenCalled();
  });

  it('does not offer the default layout to someone who never changed theirs', async () => {
    renderBoard();
    fireEvent.click(await screen.findByRole('button', { name: 'Customize' }));
    expect(screen.queryByRole('button', { name: 'Back to the default layout' })).not.toBeInTheDocument();
  });

  it('asks the server for the default layout', async () => {
    client.get = jest.fn().mockResolvedValue({ data: boardData({ customized: true }) });
    renderBoard();
    fireEvent.click(await screen.findByRole('button', { name: 'Customize' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to the default layout' }));
    await waitFor(() => expect(client.delete).toHaveBeenCalledWith(URL));
  });

  it('has no Customize button on a site without Dashboard Studio', async () => {
    client.get = jest.fn().mockResolvedValue({ data: boardData({ can_customize: false }) });
    renderBoard();
    expect(await screen.findByText('Welcome back')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Customize' })).not.toBeInTheDocument();
  });

  it('keeps the changes on screen when saving fails', async () => {
    client.put = jest.fn().mockRejectedValue(new Error('nope'));
    renderBoard();
    fireEvent.click(await screen.findByRole('button', { name: 'Customize' }));
    fireEvent.click(screen.getByRole('button', { name: 'Hide "News"' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save my dashboard' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be saved');
    expect(screen.getByRole('button', { name: 'Show "News"' })).toBeInTheDocument();
  });
});
