import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Form, Icon } from '@openedx/paragon';
import { Check } from '@openedx/paragon/icons';

/**
 * Filter menu built on the Paragon Dropdown, same pattern as the My Courses /
 * Studio home course filters (CoursesFilterMenu). Item hover/active colors come from the
 * dropdown design tokens.
 */
const CustomFilterSelect = ({
  id,
  value,
  onChange,
  options,
  showSearch,
  searchPlaceholder,
  noResultsText,
  className,
}) => {
  const [searchText, setSearchText] = useState('');
  const selected = options.find((option) => option.value === value);
  const visibleOptions = options.filter(
    (option) => option.label.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleToggle = (isOpen) => {
    if (!isOpen) { setSearchText(''); }
  };

  return (
    <Dropdown id={`dropdown-${id}`} className={`custom-filter-select ${className}`} onToggle={handleToggle}>
      <Dropdown.Toggle id={id} variant="tertiary" className="dropdown-toggle-menu-items">
        {selected ? selected.label : (options[0]?.label || '')}
      </Dropdown.Toggle>
      <Dropdown.Menu className="custom-filter-select-menu">
        {showSearch && (
          <div className="custom-filter-select-search">
            <Form.Control
              size="sm"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
          </div>
        )}
        {visibleOptions.length > 0 ?
          visibleOptions.map((option) => (
            <Dropdown.Item key={option.value} onClick={() => onChange(option.value)}>
              {option.label} {option.value === value && <Icon src={Check} className="ml-2" />}
            </Dropdown.Item>
          )) :
          <Dropdown.ItemText>{noResultsText}</Dropdown.ItemText>}
      </Dropdown.Menu>
    </Dropdown>
  );
};

CustomFilterSelect.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  showSearch: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  noResultsText: PropTypes.string,
  className: PropTypes.string,
};

CustomFilterSelect.defaultProps = {
  value: '',
  showSearch: false,
  searchPlaceholder: '',
  noResultsText: '',
  className: '',
};

export default CustomFilterSelect;
