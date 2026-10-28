import { defineMessages } from '@edx/frontend-platform/i18n';

// Messages of the custom introduction video field (CustomIntroductionVideo) and of the
// YouTube link support of the stock field (index.jsx).
const messages = defineMessages({
  linkPlaceholder: {
    id: 'course-authoring.schedule-section.introducing.introduction-video.custom.link-placeholder',
    defaultMessage: 'YouTube link or video ID',
    description: 'Placeholder of the course introduction video field',
  },
  linkHelp: {
    id: 'course-authoring.schedule-section.introducing.introduction-video.custom.link-help',
    defaultMessage:
      'Paste the link of a YouTube video, for example https://www.youtube.com/watch?v=…, or its video ID.',
    description: 'Help text under the course introduction video field',
  },
  linkFound: {
    id: 'course-authoring.schedule-section.introducing.introduction-video.custom.link-found',
    defaultMessage: 'YouTube video ID: {id}',
    description: 'Shown under the introduction video field when a YouTube link was pasted: the video ID taken from it',
  },
  linkInvalid: {
    id: 'course-authoring.schedule-section.introducing.introduction-video.custom.link-invalid',
    defaultMessage: 'This is not a YouTube video link or video ID.',
    description: 'Error under the course introduction video field',
  },
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
