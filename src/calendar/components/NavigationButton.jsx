import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../data/messages';

const NavigationButton = ({ type, onClick, className }) => {
  const intl = useIntl();

  return (
    <Button
      size="sm"
      variant="outline-primary"
      onClick={onClick}
      className={`nav-button ${className || ''}`}
    >
      {intl.formatMessage(messages[type])}
    </Button>
  );
};

NavigationButton.propTypes = {
  type: PropTypes.oneOf(['prev', 'next', 'today']).isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

NavigationButton.defaultProps = {
  className: '',
};

export default NavigationButton;
