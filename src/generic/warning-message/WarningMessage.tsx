import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Card, Icon } from '@openedx/paragon';
import { WarningFilled } from '@openedx/paragon/icons';
import './WarningMessage.scss';

interface WarningMessageProps {
  message: React.ReactNode;
}

const WarningMessage: React.FC<WarningMessageProps> = ({ message }) => (
  <Card className="warning-message-card p-0">
    <div className="warning-message-content d-flex align-items-center">
      <span className="warning-message-icon d-flex align-items-center justify-content-center mr-3">
        <Icon src={WarningFilled} size="md" />
      </span>
      <div>
        <span className="warning-message-heading font-weight-bold d-block mb-0">
          <FormattedMessage
            id="course-authoring.custom.warning-message.heading"
            defaultMessage="Warning"
            description="Heading of the warning message card"
          />
        </span>
        <span className="warning-message-text">{message}</span>
      </div>
    </div>
  </Card>
);

export default WarningMessage;
