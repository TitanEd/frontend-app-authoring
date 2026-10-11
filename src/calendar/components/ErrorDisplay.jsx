import React from 'react';
import { Alert } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useCalendarContext } from '../context/CalendarContext';
import messages from '../data/messages';

const ErrorDisplay = () => {
  const intl = useIntl();
  const { error, clearError } = useCalendarContext();

  if (!error) { return null; }

  // The context stores the message id of the error.
  const message = Object.values(messages).find((m) => m.id === error) || messages.errorNavigation;

  return (
    <Alert variant="danger" className="error-container" dismissible onClose={clearError}>
      {intl.formatMessage(message)}
    </Alert>
  );
};

export default ErrorDisplay;
