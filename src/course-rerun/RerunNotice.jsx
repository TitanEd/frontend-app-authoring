import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Alert, Button } from '@openedx/paragon';
import { CheckCircle, Error as ErrorIcon, Info } from '@openedx/paragon/icons';
import { useLocation, useNavigate } from 'react-router-dom';

import customMessages from './customMessages';
import { RERUN_NOTICE_STATE_KEY, RERUN_STATES, fetchRerunState } from './rerunProgress';

const CHECK_EVERY_MS = 10000;
const STOP_CHECKING_AFTER_MS = 15 * 60 * 1000;

const VARIANTS = {
  [RERUN_STATES.inProgress]: {
    variant: 'info', icon: Info, title: customMessages.rerunInProgressTitle, body: customMessages.rerunInProgressBody,
  },
  [RERUN_STATES.ready]: {
    variant: 'success', icon: CheckCircle, title: customMessages.rerunReadyTitle, body: customMessages.rerunReadyBody,
  },
  [RERUN_STATES.failed]: {
    variant: 'danger', icon: ErrorIcon, title: customMessages.rerunFailedTitle, body: customMessages.rerunFailedBody,
  },
};

/**
 * Notice at the top of My Courses after "Create re-run" when the copy was not finished yet
 * (useCreateOrRerunCourse passes it in the route state). While the re-run runs it asks Studio
 * every 10 seconds, then says the course is ready (and refreshes the list) or that it failed.
 */
const RerunNotice = ({ onReady }) => {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const rerun = location.state?.[RERUN_NOTICE_STATE_KEY];
  const [state, setState] = useState(rerun?.state);

  useEffect(() => {
    setState(rerun?.state);
  }, [rerun?.courseKey]);

  useEffect(() => {
    if (!rerun || state !== RERUN_STATES.inProgress) {
      return undefined;
    }
    const started = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - started > STOP_CHECKING_AFTER_MS) {
        clearInterval(timer);
        return;
      }
      fetchRerunState(rerun.courseKey)
        .then((next) => {
          if (next !== RERUN_STATES.inProgress) {
            clearInterval(timer);
            setState(next);
            if (next === RERUN_STATES.ready) {
              onReady();
            }
          }
        })
        .catch(() => {});
    }, CHECK_EVERY_MS);
    return () => clearInterval(timer);
  }, [rerun?.courseKey, state]);

  if (!rerun || !VARIANTS[state]) {
    return null;
  }
  const { variant, icon, title, body } = VARIANTS[state];
  const course = <strong key="course">{rerun.displayName || rerun.courseKey}</strong>;
  // Clear the route state, so the notice does not come back on reload.
  const dismiss = () => navigate(`${location.pathname}${location.search}`, { replace: true, state: null });

  const actions = [
    <Button key="dismiss" variant="tertiary" onClick={dismiss}>
      {intl.formatMessage(customMessages.rerunNoticeDismiss)}
    </Button>,
  ];
  if (state === RERUN_STATES.ready) {
    actions.unshift(
      <Button key="open" onClick={() => navigate(`/course/${rerun.courseKey}`)}>
        {intl.formatMessage(customMessages.rerunOpenOutline)}
      </Button>,
    );
  }

  return (
    <Alert
      className="tels-rerun-notice mb-4"
      variant={variant}
      icon={icon}
      actions={actions}
      role={state === RERUN_STATES.failed ? 'alert' : 'status'}
    >
      <Alert.Heading>{intl.formatMessage(title)}</Alert.Heading>
      <p className="mb-0">{intl.formatMessage(body, { course })}</p>
    </Alert>
  );
};

RerunNotice.propTypes = {
  onReady: PropTypes.func,
};

RerunNotice.defaultProps = {
  onReady: () => {},
};

export default RerunNotice;
