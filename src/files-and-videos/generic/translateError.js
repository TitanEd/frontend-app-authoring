import { defineMessages } from '@edx/frontend-platform/i18n';

// The data layer (files-page/data/thunks.js, videos-page/data/thunks.js) reports what went wrong as
// English sentences. They are recognised here and shown in the language of the page; a sentence
// that is not listed is shown as it is.
const messages = defineMessages({
  loadAllFiles: { id: 'course-authoring.files-and-videos.error.loadAllFiles', defaultMessage: 'Failed to load all files.' },
  loadRemainingFiles: { id: 'course-authoring.files-and-videos.error.loadRemainingFiles', defaultMessage: 'Failed to load remaining files.' },
  loadVideos: { id: 'course-authoring.files-and-videos.error.loadVideos', defaultMessage: 'Failed to load videos.' },
  downloadZip: { id: 'course-authoring.files-and-videos.error.downloadZip', defaultMessage: 'Failed to download zip file of videos.' },
  updateOrderTranscripts: { id: 'course-authoring.files-and-videos.error.updateOrderTranscripts', defaultMessage: 'Failed to update order transcripts settings.' },
  cancelledUpload: { id: 'course-authoring.files-and-videos.error.cancelledUpload', defaultMessage: 'Cancelled upload for {name}.' },
  lockFile: { id: 'course-authoring.files-and-videos.error.lockFile', defaultMessage: 'Failed to lock file id {name}.' },
  unlockFile: { id: 'course-authoring.files-and-videos.error.unlockFile', defaultMessage: 'Failed to unlock file id {name}.' },
  addThumbnail: { id: 'course-authoring.files-and-videos.error.addThumbnail', defaultMessage: 'Failed to add thumbnail for video id {name}.' },
  deleteTranscript: { id: 'course-authoring.files-and-videos.error.deleteTranscript', defaultMessage: 'Failed to delete {name} transcript.' },
  deleteFile: { id: 'course-authoring.files-and-videos.error.deleteFile', defaultMessage: 'Failed to delete file id {name}.' },
  usageMetrics: { id: 'course-authoring.files-and-videos.error.usageMetrics', defaultMessage: 'Failed to get usage metrics for {name}.' },
  updateCredentials: { id: 'course-authoring.files-and-videos.error.updateCredentials', defaultMessage: 'Failed to update {name} credentials.' },
  updateTranscriptSettings: { id: 'course-authoring.files-and-videos.error.updateTranscriptSettings', defaultMessage: 'Failed to update {name} transcripts settings.' },
  replaceTranscript: { id: 'course-authoring.files-and-videos.error.replaceTranscript', defaultMessage: 'Failed to replace {name} with {other}.' },
  download: { id: 'course-authoring.files-and-videos.error.download', defaultMessage: 'Failed to download {name}.' },
  upload: { id: 'course-authoring.files-and-videos.error.upload', defaultMessage: 'Failed to upload {name}.' },
  validate: { id: 'course-authoring.files-and-videos.error.validate', defaultMessage: 'Failed to validate {name}.' },
  add: { id: 'course-authoring.files-and-videos.error.add', defaultMessage: 'Failed to add {name}.' },
});

// Most specific first: "Failed to add thumbnail for…" before "Failed to add…".
const PATTERNS = [
  [/^Failed to load all files\.$/, messages.loadAllFiles],
  [/^Failed to load remaining files\.$/, messages.loadRemainingFiles],
  [/^Failed to load videos\.?$/, messages.loadVideos],
  [/^Failed to download zip file of videos\.$/, messages.downloadZip],
  [/^Failed to update order transcripts settings\.$/, messages.updateOrderTranscripts],
  [/^Cancelled upload for (.+)\.$/, messages.cancelledUpload],
  [/^Failed to lock file id (.+)\.$/, messages.lockFile],
  [/^Failed to unlock file id (.+)\.$/, messages.unlockFile],
  [/^Failed to add thumbnail for video id (.+)\.$/, messages.addThumbnail],
  [/^Failed to delete (.+) transcript\.$/, messages.deleteTranscript],
  [/^Failed to delete file id (.+)\.$/, messages.deleteFile],
  [/^Failed to get usage metrics for (.+)\.$/, messages.usageMetrics],
  [/^Failed to update (.+) credentials\.$/, messages.updateCredentials],
  [/^Failed to update (.+) transcripts settings\.$/, messages.updateTranscriptSettings],
  [/^Failed to replace (.+) with (.+)\.$/, messages.replaceTranscript],
  [/^Failed to download (.+)\.$/, messages.download],
  [/^Failed to upload (.+)\.$/, messages.upload],
  [/^Failed to validate (.+)\.$/, messages.validate],
  [/^Failed to add (.+)\.$/, messages.add],
];

/**
 * The error sentence in the language of the page.
 */
const translateError = (intl, message) => {
  if (typeof message !== 'string') { return message; }
  for (let i = 0; i < PATTERNS.length; i++) {
    const [pattern, descriptor] = PATTERNS[i];
    const match = message.match(pattern);
    if (match) { return intl.formatMessage(descriptor, { name: match[1], other: match[2] }); }
  }
  return message;
};

export default translateError;
