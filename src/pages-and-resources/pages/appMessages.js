import { defineMessages } from '@edx/frontend-platform/i18n';

// Names and descriptions of the course apps. The Studio API (course_apps) sends them as the platform's
// untranslated source strings, so the cards take them from here by app id and fall back to the API
// text for an app that is not listed.
const messages = defineMessages({
  'calculator.name': {
    id: 'course-authoring.pages-resources.app.calculator.name',
    defaultMessage: 'Calculator',
  },
  'calculator.description': {
    id: 'course-authoring.pages-resources.app.calculator.description',
    defaultMessage: 'Provide an in-course calculator for simple and complex calculations.',
  },
  'custom_pages.name': {
    id: 'course-authoring.pages-resources.app.custom_pages.name',
    defaultMessage: 'Custom pages',
  },
  'custom_pages.description': {
    id: 'course-authoring.pages-resources.app.custom_pages.description',
    defaultMessage: 'Provide additional course content and resources with custom pages',
  },
  'discussion.name': {
    id: 'course-authoring.pages-resources.app.discussion.name',
    defaultMessage: 'Discussion',
  },
  'discussion.description': {
    id: 'course-authoring.pages-resources.app.discussion.description',
    defaultMessage: 'Encourage participation and engagement in your course with discussions.',
  },
  'edxnotes.name': {
    id: 'course-authoring.pages-resources.app.edxnotes.name',
    defaultMessage: 'Notes',
  },
  'edxnotes.description': {
    id: 'course-authoring.pages-resources.app.edxnotes.description',
    defaultMessage: 'Allow learners to highlight passages and make notes right in the course.',
  },
  'live.name': {
    id: 'course-authoring.pages-resources.app.live.name',
    defaultMessage: 'Live',
  },
  'live.description': {
    id: 'course-authoring.pages-resources.app.live.description',
    defaultMessage: 'Enable in-platform video conferencing by configuring live',
  },
  'progress.name': {
    id: 'course-authoring.pages-resources.app.progress.name',
    defaultMessage: 'Progress',
  },
  'progress.description': {
    id: 'course-authoring.pages-resources.app.progress.description',
    defaultMessage: 'Keep learners engaged and on track throughout the course.',
  },
  'textbooks.name': {
    id: 'course-authoring.pages-resources.app.textbooks.name',
    defaultMessage: 'Textbooks',
  },
  'textbooks.description': {
    id: 'course-authoring.pages-resources.app.textbooks.description',
    defaultMessage: 'Create and manage a library of course readings, textbooks, and chapters.',
  },
  'wiki.name': {
    id: 'course-authoring.pages-resources.app.wiki.name',
    defaultMessage: 'Wiki',
  },
  'wiki.description': {
    id: 'course-authoring.pages-resources.app.wiki.description',
    defaultMessage: 'Enable learners to access, and collaborate on course-related information.',
  },
  'teams.name': {
    id: 'course-authoring.pages-resources.app.teams.name',
    defaultMessage: 'Teams',
  },
  'teams.description': {
    id: 'course-authoring.pages-resources.app.teams.description',
    defaultMessage: 'Leverage teams to allow learners to connect by topic of interest.',
  },
  'dates.name': {
    id: 'course-authoring.pages-resources.app.dates.name',
    defaultMessage: 'Dates',
  },
  'dates.description': {
    id: 'course-authoring.pages-resources.app.dates.description',
    defaultMessage: 'Provide learners a summary of important course dates.',
  },
  'proctoring.name': {
    id: 'course-authoring.pages-resources.app.proctoring.name',
    defaultMessage: 'Proctoring',
  },
  'proctoring.description': {
    id: 'course-authoring.pages-resources.app.proctoring.description',
    defaultMessage: 'Maintain exam integrity by enabling a proctoring solution for your course',
  },
  'ora_settings.name': {
    id: 'course-authoring.pages-resources.app.ora_settings.name',
    defaultMessage: 'Flexible Peer Grading for ORAs',
  },
  'ora_settings.description': {
    id: 'course-authoring.pages-resources.app.ora_settings.description',
    defaultMessage: 'Course level settings for Flexible Peer Grading Open Response Assessments.',
  },
});

export default messages;
