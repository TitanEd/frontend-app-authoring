import { defineMessages } from '@edx/frontend-platform/i18n';

// Messages of the TitanEd course re-run page (CustomCourseRerun).
const messages = defineMessages({
  originalCourse: {
    id: 'course-authoring.course-rerun.custom.original-course',
    defaultMessage: 'Original course: {course}',
    description: 'Line under the title of the course re-run page that names the course being re-run',
  },
  rerunInProgressTitle: {
    id: 'course-authoring.course-rerun.custom.notice.in-progress.title',
    defaultMessage: 'Your course re-run is being created',
    description: 'Title of the notice on My Courses after a course re-run was started and is still being copied',
  },
  rerunInProgressBody: {
    id: 'course-authoring.course-rerun.custom.notice.in-progress.body',
    defaultMessage: '{course} is being copied. A large course can take a few minutes. You can keep working; this notice will tell you when it is ready.',
    description: 'Text of the notice on My Courses while a course re-run is being copied; {course} is the new course name',
  },
  rerunReadyTitle: {
    id: 'course-authoring.course-rerun.custom.notice.ready.title',
    defaultMessage: 'Your course re-run is ready',
    description: 'Title of the notice on My Courses when the course re-run has finished',
  },
  rerunReadyBody: {
    id: 'course-authoring.course-rerun.custom.notice.ready.body',
    defaultMessage: '{course} has been created.',
    description: 'Text of the notice on My Courses when the course re-run has finished; {course} is the new course name',
  },
  rerunOpenOutline: {
    id: 'course-authoring.course-rerun.custom.notice.open-outline',
    defaultMessage: 'Open course outline',
    description: 'Button of the notice on My Courses that opens the outline of the new course re-run',
  },
  rerunFailedTitle: {
    id: 'course-authoring.course-rerun.custom.notice.failed.title',
    defaultMessage: 'The course re-run could not be created',
    description: 'Title of the notice on My Courses when the course re-run failed',
  },
  rerunFailedBody: {
    id: 'course-authoring.course-rerun.custom.notice.failed.body',
    defaultMessage: 'Copying {course} failed. Please try the re-run again, or contact support if it keeps failing.',
    description: 'Text of the notice on My Courses when the course re-run failed; {course} is the new course name',
  },
  rerunNoticeDismiss: {
    id: 'course-authoring.course-rerun.custom.notice.dismiss',
    defaultMessage: 'Dismiss',
    description: 'Button that closes the course re-run notice on My Courses',
  },
});

export default messages;
