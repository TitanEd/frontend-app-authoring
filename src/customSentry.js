/* eslint-disable no-console */
import * as Sentry from '@sentry/react';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

let initialized = false;

/**
 * Starts Sentry with the settings returned by the TitanEd mfe_context API.
 * Called once by the custom UI (CustomAppRoutes).
 */
const initCustomSentry = async () => {
  if (initialized) {
    return;
  }
  initialized = true;
  try {
    const { data } = await getAuthenticatedHttpClient().get(`${getConfig().LMS_BASE_URL}/titaned/api/v1/mfe_context/`);
    if (!data?.sentry?.dsn) {
      return;
    }
    Sentry.init({
      dsn: data.sentry.dsn,
      environment: data.sentry.environment,
      tracesSampleRate: data.sentry.traces_sample_rate,
      sendDefaultPii: data.sentry.send_default_pii,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  } catch (error) {
    console.error('Sentry configuration could not be loaded:', error);
  }
};

export default initCustomSentry;
