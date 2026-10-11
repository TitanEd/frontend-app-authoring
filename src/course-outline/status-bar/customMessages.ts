import { defineMessages } from '@edx/frontend-platform/i18n';

// Messages of the custom status bar (CustomStatusBar).
const messages = defineMessages({
  highlightEmailsTitle: {
    id: 'course-authoring.course-outline.status-bar.highlight-emails',
    defaultMessage: 'Course highlight emails',
  },
  highlightEmailsLink: {
    id: 'course-authoring.course-outline.status-bar.highlight-emails.link',
    defaultMessage: 'Learn more',
  },
  exportTags: {
    id: 'course-authoring.custom.status-bar.export-tags',
    defaultMessage: 'Export Tags',
    description: 'Status bar item and link that exports the course tags',
  },
});

export default messages;
