import { defineMessages } from '@edx/frontend-platform/i18n';

// Messages of the "Create new course" page (CustomCreateNewCourseForm).
// Texts shared with the course details form are reused from ./messages.
const messages = defineMessages({
  pageTitle: {
    id: 'course-authoring.create-course.page.title',
    defaultMessage: 'Create a new course',
    description: 'Title of the create course page',
  },
  pageHelp: {
    id: 'course-authoring.create-course.page.help',
    defaultMessage:
      'Fill in the basics now. Everything except the course ID can be changed later in the course settings.',
    description: 'One-line help under the page title',
  },
  requiredLegend: {
    id: 'course-authoring.create-course.required.legend',
    defaultMessage: 'Fields marked with {asterisk} are required.',
    description: 'Explains the asterisk next to required fields',
  },
  basicsTitle: {
    id: 'course-authoring.create-course.card.basics.title',
    defaultMessage: 'Basics',
    description: 'Card title',
  },
  basicsHelp: {
    id: 'course-authoring.create-course.card.basics.help',
    defaultMessage: 'What the course is called and how it is identified.',
    description: 'Card subtitle',
  },
  scheduleHelp: {
    id: 'course-authoring.create-course.card.schedule.help',
    defaultMessage: 'When the course runs and when learners can enrol. All dates and times are in UTC.',
    description: 'Card subtitle',
  },
  presentationTitle: {
    id: 'course-authoring.create-course.card.presentation.title',
    defaultMessage: 'Presentation',
    description: 'Card title',
  },
  presentationHelp: {
    id: 'course-authoring.create-course.card.presentation.help',
    defaultMessage: 'Images and video that present the course in the catalogue and on its page.',
    description: 'Card subtitle',
  },
  detailsTitle: {
    id: 'course-authoring.create-course.card.details.title',
    defaultMessage: 'Course details',
    description: 'Card title',
  },
  detailsHelp: {
    id: 'course-authoring.create-course.card.details.help',
    defaultMessage: 'Extra information shown on the course page.',
    description: 'Card subtitle',
  },
  requirementsHelp: {
    id: 'course-authoring.create-course.card.requirements.help',
    defaultMessage: 'What learners need before they can start.',
    description: 'Card subtitle',
  },
  pricingHelp: {
    id: 'course-authoring.create-course.card.pricing.help',
    defaultMessage: 'Whether learners pay to enrol.',
    description: 'Card subtitle',
  },
  licenseHelp: {
    id: 'course-authoring.create-course.card.license.help',
    defaultMessage: 'How others may reuse the content of this course.',
    description: 'Card subtitle',
  },
  titlePlaceholder: {
    id: 'course-authoring.create-course.field.title.placeholder',
    defaultMessage: 'e.g. Introduction to Data Science',
    description: 'Placeholder of the course title field',
  },
  titleHelp: {
    id: 'course-authoring.create-course.field.title.help',
    defaultMessage: 'The name learners see in the catalogue and on their dashboard.',
    description: 'Help text of the course title field',
  },
  charactersLeft: {
    id: 'course-authoring.create-course.field.characters-left',
    defaultMessage: '{count, plural, one {# character left} other {# characters left}}',
    description: 'Remaining characters of a limited text field',
  },
  descriptionHelp: {
    id: 'course-authoring.create-course.field.description.help',
    defaultMessage: 'Shown in the Overview section of the course page. You can format it later in Schedule & details.',
    description: 'Help text of the description field',
  },
  organizationHelpNew: {
    id: 'course-authoring.create-course.field.organization.help-new',
    defaultMessage: 'Choose an organization from the list or type a new one. No spaces or special characters.',
    description: 'Help text of the organization field when new organizations are allowed',
  },
  courseNumberHelp: {
    id: 'course-authoring.create-course.field.number.help',
    defaultMessage: 'Identifies the course within the organization. Cannot be changed later.',
    description: 'Help text of the course number field',
  },
  courseRunHelp: {
    id: 'course-authoring.create-course.field.run.help',
    defaultMessage: 'The term in which the course runs. Cannot be changed later.',
    description: 'Help text of the course run field',
  },
  organizationInvalid: {
    id: 'course-authoring.create-course.field.organization.invalid',
    defaultMessage: 'Organization can only contain letters, numbers, dots, underscores and hyphens.',
    description: 'Validation error',
  },
  courseNumberInvalid: {
    id: 'course-authoring.create-course.field.number.invalid',
    defaultMessage: 'Course number can only contain letters, numbers, dots, underscores and hyphens.',
    description: 'Validation error',
  },
  courseRunInvalid: {
    id: 'course-authoring.create-course.field.run.invalid',
    defaultMessage: 'Course run can only contain letters, numbers, dots, underscores and hyphens.',
    description: 'Validation error',
  },
  courseKeyTooLong: {
    id: 'course-authoring.create-course.field.key.too-long',
    defaultMessage: 'Organization, course number and course run together can have at most {max} characters.',
    description: 'Validation error',
  },
  instructorPacedHelp: {
    id: 'course-authoring.create-course.field.pacing.instructor.help',
    defaultMessage: 'Learners follow the schedule and due dates you set.',
    description: 'Help text of the instructor-paced option',
  },
  selfPacedHelp: {
    id: 'course-authoring.create-course.field.pacing.self.help',
    defaultMessage: 'Learners work through the course at their own speed.',
    description: 'Help text of the self-paced option',
  },
  courseStartDate: {
    id: 'course-authoring.create-course.field.start-date.label',
    defaultMessage: 'Course start date',
    description: 'Field label',
  },
  enrollmentStartDate: {
    id: 'course-authoring.create-course.field.enrollment-start-date.label',
    defaultMessage: 'Enrollment start date',
    description: 'Field label',
  },
  timeHelp: {
    id: 'course-authoring.create-course.field.time.help',
    defaultMessage: 'Optional. 00:00 UTC when left empty.',
    description: 'Help text of a time field',
  },
  enrollmentStartAfterCourseStart: {
    id: 'course-authoring.create-course.field.enrollment-start.after-start',
    defaultMessage: 'Enrollment start date cannot be later than the course start date.',
    description: 'Validation error',
  },
  timeNeedsDate: {
    id: 'course-authoring.create-course.field.time.needs-date',
    defaultMessage: 'Choose a date for this time.',
    description: 'Validation error: a time was given without its date',
  },
  certificateDateRequired: {
    id: 'course-authoring.create-course.field.certificate-date.required',
    defaultMessage: 'Choose the date from which certificates are available.',
    description: 'Validation error',
  },
  certificateDateBeforeEnd: {
    id: 'course-authoring.create-course.field.certificate-date.before-end',
    defaultMessage: 'The certificate date must be later than the course end date.',
    description: 'Validation error',
  },
  certificateNeedsEndDate: {
    id: 'course-authoring.create-course.field.certificate-date.needs-end',
    defaultMessage: 'Set a course end date to make certificates available after it.',
    description: 'Validation error',
  },
  certificateSelfPaced: {
    id: 'course-authoring.create-course.field.certificate.self-paced',
    defaultMessage: 'Self-paced courses make certificates available as soon as a learner passes.',
    description: 'Note shown instead of the certificate settings for self-paced courses',
  },
  imageDrop: {
    id: 'course-authoring.create-course.field.image.choose',
    defaultMessage: 'Choose image',
    description: 'Button that opens the file picker of an image field',
  },
  imageReplace: {
    id: 'course-authoring.create-course.field.image.replace',
    defaultMessage: 'Replace',
    description: 'Button that replaces the chosen image',
  },
  imageRemove: {
    id: 'course-authoring.create-course.field.image.remove',
    defaultMessage: 'Remove',
    description: 'Button that removes the chosen image',
  },
  cardImageHelp: {
    id: 'course-authoring.create-course.field.card-image.help',
    defaultMessage: 'Shown on the course card in the catalogue. JPEG or PNG, 300×300 to 1024×1024 pixels, under 5 MB.',
    description: 'Help text of the card image field',
  },
  bannerImageHelp: {
    id: 'course-authoring.create-course.field.banner-image.help',
    defaultMessage: 'Shown at the top of the course page. JPEG or PNG, 300×300 to 1024×1024 pixels, under 5 MB.',
    description: 'Help text of the banner image field',
  },
  cardImagePreviewAlt: {
    id: 'course-authoring.create-course.field.card-image.alt',
    defaultMessage: 'Preview of the course card image',
    description: 'Alternative text of the image preview',
  },
  bannerImagePreviewAlt: {
    id: 'course-authoring.create-course.field.banner-image.alt',
    defaultMessage: 'Preview of the course banner image',
    description: 'Alternative text of the image preview',
  },
  introVideo: {
    id: 'course-authoring.create-course.field.intro-video.label',
    defaultMessage: 'Introduction video',
    description: 'Field label',
  },
  introVideoPlaceholder: {
    id: 'course-authoring.create-course.field.intro-video.placeholder',
    defaultMessage: 'YouTube link or video ID',
    description: 'Placeholder of the introduction video field',
  },
  introVideoHelp: {
    id: 'course-authoring.create-course.field.intro-video.help',
    defaultMessage: 'A YouTube video shown on the course page.',
    description: 'Help text of the introduction video field',
  },
  introVideoDetected: {
    id: 'course-authoring.create-course.field.intro-video.detected',
    defaultMessage: 'YouTube video ID: {videoId}',
    description: 'Shows the video id read from the typed link',
  },
  introVideoInvalid: {
    id: 'course-authoring.create-course.field.intro-video.invalid',
    defaultMessage: 'Enter a YouTube link or video ID.',
    description: 'Validation error',
  },
  effortPlaceholder: {
    id: 'course-authoring.create-course.field.effort.placeholder',
    defaultMessage: 'e.g. 4',
    description: 'Placeholder of the weekly effort field',
  },
  prerequisiteLoading: {
    id: 'course-authoring.create-course.field.prerequisite.loading',
    defaultMessage: 'Loading courses…',
    description: 'Shown while the list of courses loads',
  },
  entranceExamScoreInvalid: {
    id: 'course-authoring.create-course.field.entrance-exam-score.invalid',
    defaultMessage: 'Enter a score between 1 and 100.',
    description: 'Validation error',
  },
  minimumScore: {
    id: 'course-authoring.create-course.field.entrance-exam-score.label',
    defaultMessage: 'Minimum passing score (%)',
    description: 'Field label',
  },
  priceInvalid: {
    id: 'course-authoring.create-course.field.price.invalid',
    defaultMessage: 'Enter the price as a whole number greater than 0.',
    description: 'Validation error',
  },
  priceHelp: {
    id: 'course-authoring.create-course.field.price.help',
    defaultMessage:
      'Whole number in the currency of the site. Learners are charged only when paid courses are enabled for the site.',
    description: 'Help text of the price field',
  },
  freeHelp: {
    id: 'course-authoring.create-course.field.pricing.free.help',
    defaultMessage: 'Anyone who can enrol takes the course at no cost.',
    description: 'Help text of the free option',
  },
  paidHelp: {
    id: 'course-authoring.create-course.field.pricing.paid.help',
    defaultMessage: 'Learners pay the price below to enrol.',
    description: 'Help text of the paid option',
  },
  createCourse: {
    id: 'course-authoring.create-course.action.create',
    defaultMessage: 'Create course',
    description: 'Primary button of the create course page',
  },
  creatingCourse: {
    id: 'course-authoring.create-course.action.creating',
    defaultMessage: 'Creating course…',
    description: 'Primary button while the course is being created',
  },
  fixErrors: {
    id: 'course-authoring.create-course.action.fix-errors',
    defaultMessage: '{count, plural, one {# field needs your attention} other {# fields need your attention}}',
    description: 'Shown next to the buttons when the form has errors',
  },
  errorTitle: {
    id: 'course-authoring.create-course.error.title',
    defaultMessage: 'The course could not be created',
    description: 'Title of the error message',
  },
  errorHint: {
    id: 'course-authoring.create-course.error.hint',
    defaultMessage: 'Your entries are kept. Correct them and try again.',
    description: 'Shown under the error message',
  },
  createdWithIssuesTitle: {
    id: 'course-authoring.create-course.created-with-issues.title',
    defaultMessage: 'The course was created, but not everything was saved',
    description: 'Title of the warning shown when images could not be saved',
  },
  createdWithIssuesCard: {
    id: 'course-authoring.create-course.created-with-issues.card-image',
    defaultMessage: 'The course card image could not be uploaded.',
    description: 'Warning',
  },
  createdWithIssuesBanner: {
    id: 'course-authoring.create-course.created-with-issues.banner-image',
    defaultMessage: 'The course banner image could not be uploaded.',
    description: 'Warning',
  },
  createdWithIssuesHint: {
    id: 'course-authoring.create-course.created-with-issues.hint',
    defaultMessage: '{courseKey} exists now. Add the missing images in Schedule & details.',
    description: 'Shown under the warning',
  },
  openCourse: {
    id: 'course-authoring.create-course.action.open-course',
    defaultMessage: 'Open course outline',
    description: 'Button that opens the created course',
  },
  openSettings: {
    id: 'course-authoring.create-course.action.open-settings',
    defaultMessage: 'Open Schedule & details',
    description: 'Button that opens the settings of the created course',
  },
  previewTitle: {
    id: 'course-authoring.create-course.preview.title',
    defaultMessage: 'Preview',
    description: 'Title of the preview panel',
  },
  previewHelp: {
    id: 'course-authoring.create-course.preview.help',
    defaultMessage: 'How the course card looks in the catalogue.',
    description: 'Subtitle of the preview panel',
  },
  previewTitlePlaceholder: {
    id: 'course-authoring.create-course.preview.title-placeholder',
    defaultMessage: 'Your course title',
    description: 'Placeholder in the card preview',
  },
  previewDescriptionPlaceholder: {
    id: 'course-authoring.create-course.preview.description-placeholder',
    defaultMessage: 'The short description appears here.',
    description: 'Placeholder in the card preview',
  },
  previewStarts: {
    id: 'course-authoring.create-course.preview.starts',
    defaultMessage: 'Starts {date}',
    description: 'Start date in the card preview',
  },
  previewPrice: {
    id: 'course-authoring.create-course.preview.price',
    defaultMessage: 'Paid: {price}',
    description: 'Price in the card preview',
  },
  courseIdTitle: {
    id: 'course-authoring.create-course.course-id.title',
    defaultMessage: 'Course ID and address',
    description: 'Title of the course id panel',
  },
  courseIdHelp: {
    id: 'course-authoring.create-course.course-id.help',
    defaultMessage:
      'Built from organization, course number and course run. It cannot be changed after the course is created.',
    description: 'Help text of the course id panel',
  },
  courseIdLabel: {
    id: 'course-authoring.create-course.course-id.label',
    defaultMessage: 'Course ID',
    description: 'Label of the course id',
  },
  courseUrlLabel: {
    id: 'course-authoring.create-course.course-id.url-label',
    defaultMessage: 'Course page',
    description: 'Label of the course address',
  },
  courseIdEmpty: {
    id: 'course-authoring.create-course.course-id.empty',
    defaultMessage: 'Fill in organization, course number and course run to see the ID.',
    description: 'Shown while the course id cannot be built',
  },
  tipsTitle: {
    id: 'course-authoring.create-course.tips.title',
    defaultMessage: 'Tips',
    description: 'Title of the tips panel',
  },
  tip1: {
    id: 'course-authoring.create-course.tips.one',
    defaultMessage: 'Pick a course number and run you can reuse: CS101 with runs 2026_T1, 2026_T2…',
    description: 'Tip',
  },
  tip2: {
    id: 'course-authoring.create-course.tips.two',
    defaultMessage:
      'Learners can enrol from the enrollment start date and open the content from the course start date.',
    description: 'Tip',
  },
  tip3: {
    id: 'course-authoring.create-course.tips.three',
    defaultMessage: 'The course stays hidden from learners until its start date, so you can build the content first.',
    description: 'Tip',
  },
  tip4: {
    id: 'course-authoring.create-course.tips.four',
    defaultMessage: 'Course content, grading and the team are set up after creation, from the course outline.',
    description: 'Tip',
  },
});

export default messages;
