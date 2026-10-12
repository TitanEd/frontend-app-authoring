import { defineMessages } from '@edx/frontend-platform/i18n';

// Messages of the custom collection page (CustomLibraryCollectionPage).
const messages = defineMessages({
  searchPlaceholder: {
    id: 'course-authoring.library-authoring.search.placeholder.text',
    defaultMessage: 'Search Collection',
    description: 'Search placeholder text in collections page.',
  },
  allCollections: {
    id: 'course-authoring.custom.all-collections',
    defaultMessage: 'All Collections',
    description: 'Breadcrumb of the library collections page',
  },
});

export default messages;
