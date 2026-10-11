import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import CustomFilterSelect from '../../generic/custom-filter-select/CustomFilterSelect';
import messages from '../data/messages';

const CustomFilterDropdown = ({
  id,
  value,
  onChange,
  options,
  allLabelMessage,
  showSearch,
}) => {
  const intl = useIntl();
  const selectOptions = options.map((option) => {
    const optionValue = typeof option === 'object' && option.string ? option.string : option;
    return {
      value: optionValue,
      label: optionValue === 'all' ? intl.formatMessage(allLabelMessage) : optionValue,
    };
  });

  return (
    <CustomFilterSelect
      id={id}
      value={value}
      onChange={onChange}
      options={selectOptions}
      showSearch={showSearch}
      searchPlaceholder={intl.formatMessage(messages.filterSearchPlaceholder)}
      noResultsText={intl.formatMessage(messages.filterNoResults)}
    />
  );
};

CustomFilterDropdown.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ string: PropTypes.string })]),
  ),
  allLabelMessage: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired,
  showSearch: PropTypes.bool,
};

CustomFilterDropdown.defaultProps = {
  value: '',
  options: [],
  showSearch: true,
};

export default CustomFilterDropdown;
