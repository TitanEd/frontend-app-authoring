import { defineMessages } from '@edx/frontend-platform/i18n';

// Screen-reader labels shared by several pages.
const messages = defineMessages({
  expandMore: {
    id: 'course-authoring.generic.a11y.expand-more',
    defaultMessage: 'Show options',
    description: 'Alt text of the button that opens a dropdown list',
  },
  expandLess: {
    id: 'course-authoring.generic.a11y.expand-less',
    defaultMessage: 'Hide options',
    description: 'Alt text of the button that closes a dropdown list',
  },
});

export default messages;
