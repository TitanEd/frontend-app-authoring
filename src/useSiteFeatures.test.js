import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { fetchSiteFeatures, forgetSiteFeatures, withSiteFeatures } from './useSiteFeatures';

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));
jest.mock('@edx/frontend-platform/auth', () => ({ getAuthenticatedHttpClient: jest.fn() }));

const items = [
  { label: 'Dashboard', path: '/' },
  { label: 'My Assessments', path: '/assessments', feature: 'assessment_center' },
  { label: 'My Achievements', path: '/achievements', feature: 'gamification' },
];

describe('site features', () => {
  beforeEach(() => forgetSiteFeatures());

  it('keeps the entries of the features that are on', () => {
    const shown = withSiteFeatures(items, { gamification: true, assessment_center: false });
    expect(shown).toEqual([{ label: 'Dashboard', path: '/' }, { label: 'My Achievements', path: '/achievements' }]);
  });

  it('shows nothing of the sold features while their state is unknown', () => {
    expect(withSiteFeatures(items, {})).toEqual([{ label: 'Dashboard', path: '/' }]);
  });

  it('asks the LMS once for the whole page', async () => {
    const get = jest.fn().mockResolvedValue({ data: { gamification: true } });
    getAuthenticatedHttpClient.mockReturnValue({ get });
    expect(await fetchSiteFeatures()).toEqual({ gamification: true });
    expect(await fetchSiteFeatures()).toEqual({ gamification: true });
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith('http://lms.test/titaned/api/v2/features/');
  });

  it('treats an unreachable LMS as "no feature", and asks again next time', async () => {
    const get = jest.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValue({ data: { gamification: true } });
    getAuthenticatedHttpClient.mockReturnValue({ get });
    expect(await fetchSiteFeatures()).toEqual({});
    expect(await fetchSiteFeatures()).toEqual({ gamification: true });
  });
});
