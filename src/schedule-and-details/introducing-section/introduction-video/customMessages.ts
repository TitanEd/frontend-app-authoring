import { defineMessages } from '@edx/frontend-platform/i18n';

// Messages of the custom introduction video field (CustomIntroductionVideo).
const messages = defineMessages({
  courseIntroductionVideoDelete: {
    id: 'course-authoring.schedule-section.introducing.introduction-video.custom.delete',
    defaultMessage: 'Delete',
    description: 'Button that removes the course introduction video',
  },
  courseIntroductionVideoPlaceholder: {
    id: 'course-authoring.schedule-section.introducing.introduction-video.custom.placeholder',
    defaultMessage: 'Video ID',
    description: 'Placeholder of the course introduction video field (YouTube ID or video URL)',
  },
  videoNotSupported: {
    id: 'course-authoring.schedule-section.introducing.introduction-video.custom.not-supported',
    defaultMessage: 'Your browser does not support the video tag.',
    description: 'Fallback text shown when the browser cannot play the introduction video',
  },
  loading: {
    id: 'course-authoring.schedule-section.introducing.introduction-video.custom.loading',
    defaultMessage: 'Loading...',
    description: 'Shown while the AI assistant generates the introduction video',
  },
});

export default messages;
