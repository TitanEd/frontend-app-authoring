/*
 * Which of the features sold on top of the base platform this site has
 * (control-hub subscription/features.py, GET {LMS}/titaned/api/v2/features/):
 *
 *   { gamification: true, assessment_center: false, dashboard_builder: true, ... }
 *
 * A menu entry or a control of such a feature is shown only when its feature is on. While the
 * answer is not there yet, and when it cannot be fetched, nothing of these features is shown:
 * the APIs behind them refuse anyway while a feature is off.
 *
 * This file is the same in every TitanEd MFE fork: change one, copy to the others.
 */
import { useEffect, useState } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

let pending = null;

export const fetchSiteFeatures = () => {
  if (!pending) {
    pending = getAuthenticatedHttpClient()
      .get(`${getConfig().LMS_BASE_URL}/titaned/api/v2/features/`)
      .then(({ data }) => data || {})
      .catch(() => { pending = null; return {}; });
  }
  return pending;
};

// For tests.
export const forgetSiteFeatures = () => { pending = null; };

export const useSiteFeatures = () => {
  const [features, setFeatures] = useState({});
  useEffect(() => {
    let mounted = true;
    fetchSiteFeatures().then((data) => { if (mounted) { setFeatures(data); } });
    return () => { mounted = false; };
  }, []);
  return features;
};

// Menu entries that name a `feature` stay only when that feature is on.
export const withSiteFeatures = (items, features) => items
  .filter((item) => !item.feature || Boolean(features[item.feature]))
  .map(({ feature, ...item }) => item);
