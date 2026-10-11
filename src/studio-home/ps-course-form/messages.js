import { defineMessages } from '@edx/frontend-platform/i18n';

// Messages of the TitanEd course creation / course details form (PSCourseForm).
const messages = defineMessages({
  courseEndDateCannotBeEarlierThan: {
    id: 'course-authoring.ps-course-form.course-end-date-cannot-be-earlier-than',
    defaultMessage: 'Course end date cannot be earlier than start date.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  courseStartDateMustBeLaterThan: {
    id: 'course-authoring.ps-course-form.course-start-date-must-be-later-than',
    defaultMessage: 'Course start date must be later than the enrollment start date.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  enrollmentStartDateCannotBeLaterThan: {
    id: 'course-authoring.ps-course-form.enrollment-start-date-cannot-be-later-than',
    defaultMessage: 'Enrollment start date cannot be later than enrollment end date.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  enrollmentEndDateCannotBeEarlierThan: {
    id: 'course-authoring.ps-course-form.enrollment-end-date-cannot-be-earlier-than',
    defaultMessage: 'Enrollment end date cannot be earlier than enrollment start date.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  enrollmentEndDateCannotBeEarlierThan2: {
    id: 'course-authoring.ps-course-form.enrollment-end-date-cannot-be-earlier-than2',
    defaultMessage: 'Enrollment end date cannot be earlier than course start date.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  enrollmentEndDateCannotBeLaterThan: {
    id: 'course-authoring.ps-course-form.enrollment-end-date-cannot-be-later-than',
    defaultMessage: 'Enrollment end date cannot be later than course end date.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  failedToCreateCoursePleaseTryAgain: {
    id: 'course-authoring.ps-course-form.failed-to-create-course-please-try-again',
    defaultMessage: 'Failed to create course. Please try again.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  badRequestPleaseCheckYourInputs: {
    id: 'course-authoring.ps-course-form.bad-request-please-check-your-inputs',
    defaultMessage: 'Bad request. Please check your inputs.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  youDoNotHavePermissionToCreate: {
    id: 'course-authoring.ps-course-form.you-do-not-have-permission-to-create',
    defaultMessage: 'You do not have permission to create courses.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  serverErrorPleaseTryAgainLater: {
    id: 'course-authoring.ps-course-form.server-error-please-try-again-later',
    defaultMessage: 'Server error. Please try again later.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  authenticationFailedPleaseLogInAgain: {
    id: 'course-authoring.ps-course-form.authentication-failed-please-log-in-again',
    defaultMessage: 'Authentication failed. Please log in again.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  invalidCourseDataPleaseCheckYourInputs: {
    id: 'course-authoring.ps-course-form.invalid-course-data-please-check-your-inputs',
    defaultMessage: 'Invalid course data. Please check your inputs.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  networkErrorPleaseCheckYourConnectionAnd: {
    id: 'course-authoring.ps-course-form.network-error-please-check-your-connection-and',
    defaultMessage: 'Network error. Please check your connection and try again.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  selectLanguage: {
    id: 'course-authoring.ps-course-form.select-language',
    defaultMessage: 'Select language',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  loading: {
    id: 'course-authoring.ps-course-form.loading',
    defaultMessage: 'Loading...',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  pleaseUploadAJpegOrPngImage: {
    id: 'course-authoring.ps-course-form.please-upload-ajpeg-or-png-image',
    defaultMessage: 'Please upload a JPEG or PNG image between 300x300 and 1024x1024 pixels, under 5MB.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  general: {
    id: 'course-authoring.ps-course-form.general',
    defaultMessage: 'General',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  schedule: {
    id: 'course-authoring.ps-course-form.schedule',
    defaultMessage: 'Schedule',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  requirements: {
    id: 'course-authoring.ps-course-form.requirements',
    defaultMessage: 'Requirements',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  additional: {
    id: 'course-authoring.ps-course-form.additional',
    defaultMessage: 'Additional',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  pricing: {
    id: 'course-authoring.ps-course-form.pricing',
    defaultMessage: 'Pricing',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  courseContentLicense: {
    id: 'course-authoring.ps-course-form.course-content-license',
    defaultMessage: 'Course content license',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  learningOutcomes: {
    id: 'course-authoring.ps-course-form.learning-outcomes',
    defaultMessage: 'Learning outcomes',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  instructors: {
    id: 'course-authoring.ps-course-form.instructors',
    defaultMessage: 'Instructors',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  titleIsRequired: {
    id: 'course-authoring.ps-course-form.title-is-required',
    defaultMessage: 'Title is required.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  shortDescriptionIsRequired: {
    id: 'course-authoring.ps-course-form.short-description-is-required',
    defaultMessage: 'Short Description is required.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  organizationIsRequired: {
    id: 'course-authoring.ps-course-form.organization-is-required',
    defaultMessage: 'Organization is required.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  courseNumberIsRequired: {
    id: 'course-authoring.ps-course-form.course-number-is-required',
    defaultMessage: 'Course Number is required.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  courseRunIsRequired: {
    id: 'course-authoring.ps-course-form.course-run-is-required',
    defaultMessage: 'Course Run is required.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  courseStartDateIsRequired: {
    id: 'course-authoring.ps-course-form.course-start-date-is-required',
    defaultMessage: 'Course start date is required.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  courseHasBeenCreatedSuccessfully: {
    id: 'course-authoring.ps-course-form.course-has-been-created-successfully',
    defaultMessage: 'Course has been created successfully',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  courseCreationFailed: {
    id: 'course-authoring.ps-course-form.course-creation-failed',
    defaultMessage: 'Course Creation Failed',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  ok: {
    id: 'course-authoring.ps-course-form.ok',
    defaultMessage: 'OK',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  title: {
    id: 'course-authoring.ps-course-form.title',
    defaultMessage: 'Title',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  shortDescription: {
    id: 'course-authoring.ps-course-form.short-description',
    defaultMessage: 'Short Description',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  aShortDescriptionThatWillBeDisplayed: {
    id: 'course-authoring.ps-course-form.a-short-description-that-will-be-displayed',
    defaultMessage: 'A short description that will be displayed on the course card. Limit to 150 characters.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  description: {
    id: 'course-authoring.ps-course-form.description',
    defaultMessage: 'Description',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  courseOverview: {
    id: 'course-authoring.ps-course-form.course-overview',
    defaultMessage: 'Course overview',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  provideADetailedOverviewOfYourCourse: {
    id: 'course-authoring.ps-course-form.provide-adetailed-overview-of-your-course',
    defaultMessage: 'Provide a detailed overview of your course content and objectives.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  organization: {
    id: 'course-authoring.ps-course-form.organization',
    defaultMessage: 'Organization',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  selectAnOrganization: {
    id: 'course-authoring.ps-course-form.select-an-organization',
    defaultMessage: 'Select an organization',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  noOrganizationsAvailable: {
    id: 'course-authoring.ps-course-form.no-organizations-available',
    defaultMessage: 'No organizations available',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  noOrganizationsAvailable2: {
    id: 'course-authoring.ps-course-form.no-organizations-available2',
    defaultMessage: 'No Organizations available',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  theNameOfTheOrganizationSponsoringThe: {
    id: 'course-authoring.ps-course-form.the-name-of-the-organization-sponsoring-the',
    defaultMessage: 'The name of the organization sponsoring the course.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  courseNumber: {
    id: 'course-authoring.ps-course-form.course-number',
    defaultMessage: 'Course Number',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  eGCs101: {
    id: 'course-authoring.ps-course-form.e-gcs101',
    defaultMessage: 'e.g. CS101',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  theUniqueNumberThatIdentifiesYourCourse: {
    id: 'course-authoring.ps-course-form.the-unique-number-that-identifies-your-course',
    defaultMessage: 'The unique number that identifies your course within your organization.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  courseRun: {
    id: 'course-authoring.ps-course-form.course-run',
    defaultMessage: 'Course Run',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  eG2014T1: {
    id: 'course-authoring.ps-course-form.e-g2014-t1',
    defaultMessage: 'e.g. 2014_T1',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  theTermInWhichYourCourseWill: {
    id: 'course-authoring.ps-course-form.the-term-in-which-your-course-will',
    defaultMessage: 'The term in which your course will run.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  coursePacing: {
    id: 'course-authoring.ps-course-form.course-pacing',
    defaultMessage: 'Course Pacing',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  instructorPaced: {
    id: 'course-authoring.ps-course-form.instructor-paced',
    defaultMessage: 'Instructor-paced',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  selfPaced: {
    id: 'course-authoring.ps-course-form.self-paced',
    defaultMessage: 'Self-paced',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  enterTheDateWhenYourCourseWill: {
    id: 'course-authoring.ps-course-form.enter-the-date-when-your-course-will',
    defaultMessage: 'Enter the date when your course will start',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  mmDdYyyy: {
    id: 'course-authoring.ps-course-form.mm-dd-yyyy',
    defaultMessage: 'MM/DD/YYYY',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  courseStartTime: {
    id: 'course-authoring.ps-course-form.course-start-time',
    defaultMessage: 'Course start time',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  courseEndDate: {
    id: 'course-authoring.ps-course-form.course-end-date',
    defaultMessage: 'Course end date',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  enterTheDateWhenYourCourseWill2: {
    id: 'course-authoring.ps-course-form.enter-the-date-when-your-course-will2',
    defaultMessage: 'Enter the date when your course will end',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  courseEndTime: {
    id: 'course-authoring.ps-course-form.course-end-time',
    defaultMessage: 'Course end time',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  enterTheDateWhenEnrollmentWillStart: {
    id: 'course-authoring.ps-course-form.enter-the-date-when-enrollment-will-start',
    defaultMessage: 'Enter the date when enrollment will start',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  enrollmentStartTime: {
    id: 'course-authoring.ps-course-form.enrollment-start-time',
    defaultMessage: 'Enrollment start time',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  enrollmentEndDate: {
    id: 'course-authoring.ps-course-form.enrollment-end-date',
    defaultMessage: 'Enrollment end date',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  enterTheDateWhenEnrollmentWillEnd: {
    id: 'course-authoring.ps-course-form.enter-the-date-when-enrollment-will-end',
    defaultMessage: 'Enter the date when enrollment will end',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  enrollmentEndTime: {
    id: 'course-authoring.ps-course-form.enrollment-end-time',
    defaultMessage: 'Enrollment end time',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  hoursOfEffortPerWeek: {
    id: 'course-authoring.ps-course-form.hours-of-effort-per-week',
    defaultMessage: 'Hours of effort per week',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  timeSpentOnAllCourseWork: {
    id: 'course-authoring.ps-course-form.time-spent-on-all-course-work',
    defaultMessage: 'Time spent on all course work',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  prerequisiteCourse: {
    id: 'course-authoring.ps-course-form.prerequisite-course',
    defaultMessage: 'Prerequisite course',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  none: {
    id: 'course-authoring.ps-course-form.none',
    defaultMessage: 'None',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  courseThatStudentsMustCompleteBeforeBeginning: {
    id: 'course-authoring.ps-course-form.course-that-students-must-complete-before-beginning',
    defaultMessage: 'Course that students must complete before beginning this course',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  entranceExam: {
    id: 'course-authoring.ps-course-form.entrance-exam',
    defaultMessage: 'Entrance exam',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  requireStudentsToPassAnExamBefore: {
    id: 'course-authoring.ps-course-form.require-students-to-pass-an-exam-before',
    defaultMessage: 'Require students to pass an exam before beginning the course.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  gradeRequirements: {
    id: 'course-authoring.ps-course-form.grade-requirements',
    defaultMessage: 'Grade requirements',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  theScoreStudentMustMeetInOrder: {
    id: 'course-authoring.ps-course-form.the-score-student-must-meet-in-order',
    defaultMessage: 'The score student must meet in order to successfully complete the entrance exam.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  language: {
    id: 'course-authoring.ps-course-form.language',
    defaultMessage: 'Language',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  thePrimaryLanguageOfYourCourse: {
    id: 'course-authoring.ps-course-form.the-primary-language-of-your-course',
    defaultMessage: 'The primary language of your course.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  duration: {
    id: 'course-authoring.ps-course-form.duration',
    defaultMessage: 'Duration',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  eG8Weeks: {
    id: 'course-authoring.ps-course-form.e-g8-weeks',
    defaultMessage: 'e.g. 8 weeks',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  theExpectedDurationOfYourCourse: {
    id: 'course-authoring.ps-course-form.the-expected-duration-of-your-course',
    defaultMessage: 'The expected duration of your course.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  pricingModel: {
    id: 'course-authoring.ps-course-form.pricing-model',
    defaultMessage: 'Pricing Model',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  free: {
    id: 'course-authoring.ps-course-form.free',
    defaultMessage: 'Free',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  paid: {
    id: 'course-authoring.ps-course-form.paid',
    defaultMessage: 'Paid',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  chooseWhetherYourCourseWillBeFree: {
    id: 'course-authoring.ps-course-form.choose-whether-your-course-will-be-free',
    defaultMessage: 'Choose whether your course will be free or paid.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  price: {
    id: 'course-authoring.ps-course-form.price',
    defaultMessage: 'Price',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  enterCoursePrice: {
    id: 'course-authoring.ps-course-form.enter-course-price',
    defaultMessage: 'Enter course price',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  setThePriceForYourCourseIn: {
    id: 'course-authoring.ps-course-form.set-the-price-for-your-course-in',
    defaultMessage: 'Set the price for your course in your local currency.',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  licenseDisplay: {
    id: 'course-authoring.ps-course-form.license-display',
    defaultMessage: 'License display',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  theFollowingMessageWillBeDisplayedAt: {
    id: 'course-authoring.ps-course-form.the-following-message-will-be-displayed-at',
    defaultMessage: 'The following message will be displayed at the bottom of the courseware pages within your course:',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  courseCardImage: {
    id: 'course-authoring.ps-course-form.course-card-image',
    defaultMessage: 'Course Card Image',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  courseBannerImage: {
    id: 'course-authoring.ps-course-form.course-banner-image',
    defaultMessage: 'Course Banner Image',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  cancel: {
    id: 'course-authoring.ps-course-form.cancel',
    defaultMessage: 'Cancel',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  creating: {
    id: 'course-authoring.ps-course-form.creating',
    defaultMessage: 'Creating...',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  create: {
    id: 'course-authoring.ps-course-form.create',
    defaultMessage: 'Create',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  uploading: {
    id: 'course-authoring.ps-course-form.uploading',
    defaultMessage: 'Uploading...',
    description: 'Course creation / course details form (PSCourseForm)',
  },
  uploadImage: {
    id: 'course-authoring.ps-course-form.upload-image',
    defaultMessage: 'Upload Image',
    description: 'Course creation / course details form (PSCourseForm)',
  },
});

export default messages;
