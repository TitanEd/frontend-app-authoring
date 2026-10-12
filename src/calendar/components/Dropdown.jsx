import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import CustomFilterSelect from '../../generic/custom-filter-select/CustomFilterSelect';
import messages from '../data/messages';

// Paragon Dropdown (same as the My Courses filters) for the calendar view and
// event type selectors.
const Dropdown = ({
  id,
  options,
  onChange,
  value,
  className,
}) => {
  const intl = useIntl();
  const selectOptions = options.map((option) => ({
    value: option.value,
    label: option.label || intl.formatMessage(messages[option.messageId]),
  }));

  return (
    <CustomFilterSelect
      id={id}
      className={className}
      options={selectOptions}
      onChange={onChange}
      value={value}
    />
  );
};

Dropdown.propTypes = {
  id: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      messageId: PropTypes.string,
      label: PropTypes.string,
    }),
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  className: PropTypes.string,
};

Dropdown.defaultProps = {
  value: undefined,
  className: '',
};

export default Dropdown;
