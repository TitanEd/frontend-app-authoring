/**
 * Paragon components whose built-in English labels are not translatable by themselves
 * (`SearchField` screen-reader texts, `Pagination` button labels). These wrappers pass
 * translated labels; every other prop goes through unchanged, and a label given by the
 * caller wins.
 */
import React from 'react';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import {
  Pagination as ParagonPagination,
  SearchField as ParagonSearchField,
} from '@openedx/paragon';

const messages = defineMessages({
  searchLabel: {
    id: 'course-authoring.generic.search-field.label',
    defaultMessage: 'search',
    description: 'Screen-reader label of a search field',
  },
  searchClear: {
    id: 'course-authoring.generic.search-field.clear',
    defaultMessage: 'clear search',
    description: 'Screen-reader text of the button that clears a search field',
  },
  searchSubmit: {
    id: 'course-authoring.generic.search-field.submit',
    defaultMessage: 'submit search',
    description: 'Screen-reader text of the button that submits a search field',
  },
  paginationLabel: {
    id: 'course-authoring.generic.pagination.label',
    defaultMessage: 'pagination navigation',
    description: 'Screen-reader label of the page navigation under a list',
  },
  paginationPrevious: {
    id: 'course-authoring.generic.pagination.previous',
    defaultMessage: 'Previous',
    description: 'Button that goes to the previous page of a list',
  },
  paginationNext: {
    id: 'course-authoring.generic.pagination.next',
    defaultMessage: 'Next',
    description: 'Button that goes to the next page of a list',
  },
  paginationPage: {
    id: 'course-authoring.generic.pagination.page',
    defaultMessage: 'Page',
    description: 'Word before a page number in the page navigation, e.g. "Page 2"',
  },
  paginationCurrentPage: {
    id: 'course-authoring.generic.pagination.current-page',
    defaultMessage: 'Current Page',
    description: 'Screen-reader text that marks the current page in the page navigation',
  },
  paginationPageOfCount: {
    id: 'course-authoring.generic.pagination.of',
    defaultMessage: 'of',
    description: 'Word between the current page and the number of pages, e.g. "1 of 5"',
  },
});

const useSearchFieldLabels = () => {
  const intl = useIntl();
  return {
    label: intl.formatMessage(messages.searchLabel),
    clearButton: intl.formatMessage(messages.searchClear),
    submitButton: intl.formatMessage(messages.searchSubmit),
  };
};

const TranslatedSearchField = (props: React.ComponentProps<typeof ParagonSearchField>) => (
  <ParagonSearchField screenReaderText={useSearchFieldLabels()} {...props} />
);

const TranslatedSearchFieldAdvanced = (
  props: React.ComponentProps<typeof ParagonSearchField.Advanced>,
) => (
  <ParagonSearchField.Advanced screenReaderText={useSearchFieldLabels()} {...props} />
);

export const SearchField = Object.assign(TranslatedSearchField, {
  Advanced: TranslatedSearchFieldAdvanced,
  Label: ParagonSearchField.Label,
  Input: ParagonSearchField.Input,
  ClearButton: ParagonSearchField.ClearButton,
  SubmitButton: ParagonSearchField.SubmitButton,
});

type PaginationProps = Omit<React.ComponentProps<typeof ParagonPagination>, 'paginationLabel'> & {
  paginationLabel?: string;
};

export const Pagination = (props: PaginationProps) => {
  const intl = useIntl();
  return (
    <ParagonPagination
      paginationLabel={intl.formatMessage(messages.paginationLabel)}
      buttonLabels={{
        previous: intl.formatMessage(messages.paginationPrevious),
        next: intl.formatMessage(messages.paginationNext),
        page: intl.formatMessage(messages.paginationPage),
        currentPage: intl.formatMessage(messages.paginationCurrentPage),
        pageOfCount: intl.formatMessage(messages.paginationPageOfCount),
      }}
      {...props}
    />
  );
};
