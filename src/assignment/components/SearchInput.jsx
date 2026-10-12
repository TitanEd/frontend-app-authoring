import React from 'react';
import { SearchField } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useAssignmentContext } from '../context/AssignmentContext';
import messages from '../data/messages';

const SearchInput = () => {
  const intl = useIntl();
  const { searchQuery, setSearchQuery } = useAssignmentContext();

  return (
    <div className="search-bar">
      <SearchField
        value={searchQuery}
        onChange={setSearchQuery}
        onSubmit={setSearchQuery}
        onClear={() => setSearchQuery('')}
        placeholder={intl.formatMessage(messages.searchPlaceholder)}
        screenReaderText={{
          label: intl.formatMessage(messages.searchPlaceholder),
          submitButton: intl.formatMessage(messages.searchSubmit),
          clearButton: intl.formatMessage(messages.clearSearch),
        }}
      />
    </div>
  );
};

export default SearchInput;
