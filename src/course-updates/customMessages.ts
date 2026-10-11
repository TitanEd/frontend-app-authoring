import { defineMessages } from '@edx/frontend-platform/i18n';

// Messages of the custom course updates page (CustomCourseUpdates).
const messages = defineMessages({
  updatesTabTitle: {
    id: 'course-authoring.course-updates.tab.updates',
    defaultMessage: 'Updates',
    description: 'Tab label for course updates',
  },
  handoutsTabTitle: {
    id: 'course-authoring.course-updates.tab.handouts',
    defaultMessage: 'Handouts',
    description: 'Tab label for course handouts',
  },
  recentUpdates: {
    id: 'course-authoring.custom.course-updates.recent',
    defaultMessage: 'Recent Updates',
    description: 'Heading of the course updates list',
  },
});

export default messages;
