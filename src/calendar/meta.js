/*
 * Labels and icons of the event types and kinds. Colours are in style.scss
 * (``--tcal-<type>``, from the design tokens). Same file in both forks.
 */
import {
  Assignment, Campaign, Event, EventAvailable, School, Timer, Videocam,
} from '@openedx/paragon/icons';

import messages from './messages';

export const TYPE_META = {
  course: { icon: School, label: messages.typeCourse },
  assignment: { icon: Assignment, label: messages.typeAssignment },
  exam: { icon: Timer, label: messages.typeExam },
  live_class: { icon: Videocam, label: messages.typeLiveClass },
  site_event: { icon: Event, label: messages.typeSiteEvent },
  course_event: { icon: EventAvailable, label: messages.typeCourseEvent },
  update: { icon: Campaign, label: messages.typeUpdate },
};

export const COURSE_EVENT_KINDS = {
  office_hours: messages.kindOfficeHours,
  review: messages.kindReview,
  class: messages.kindClass,
  deadline: messages.kindDeadline,
  other: messages.kindOther,
};

const KIND_LABELS = {
  ...COURSE_EVENT_KINDS,
  quiz: messages.kindQuiz,
  timed_exam: messages.kindTimedExam,
  entrance_exam: messages.kindEntranceExam,
  open_response: messages.kindOpenResponse,
  staff_graded: messages.kindStaffGraded,
  online: messages.kindOnline,
  offline: messages.kindOffline,
};

export const kindLabel = (intl, event) => (KIND_LABELS[event.kind] ? intl.formatMessage(KIND_LABELS[event.kind]) : '');

/** The text of an event in a small space: course dates and updates name their course. */
export const shortTitle = (event) => (
  (event.type === 'course' || event.type === 'update') && event.course ? `${event.title}: ${event.course}` : event.title
);
