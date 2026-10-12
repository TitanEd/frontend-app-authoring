/**
 * Data layer of the "Create new course" page: turns the form values into the requests
 * that create the course and store every field of the form on it.
 *
 * 1. POST /titaned/api/v1/create-course        creates the course and saves its details
 *                                              (schedule, pacing, about texts, licence, price…)
 * 2. POST /assets/<course id>/                 uploads the card and banner images (the course
 *                                              must exist first, so this cannot be part of step 1)
 * 3. PUT  /api/contentstore/v1/course_details  points the course at the uploaded images
 */
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const COURSE_KEY_PART_PATTERN = /^[a-zA-Z0-9_.-]+$/;
export const COURSE_KEY_MAX_LENGTH = 65;
export const SHORT_DESCRIPTION_MAX_LENGTH = 150;
export const DEFAULT_ENTRANCE_EXAM_SCORE = 50;

export const PACING = { instructor: 'instructor', self: 'self' };
export const PRICING = { free: 'free', paid: 'paid' };
export const CERTIFICATE_BEHAVIOR = {
  earlyNoInfo: 'early_no_info',
  end: 'end',
  endWithDate: 'end_with_date',
};

const studioUrl = (path) => `${getConfig().STUDIO_BASE_URL}${path}`;

export const getInitialValues = (now = new Date()) => ({
  title: '',
  shortDescription: '',
  description: '',
  organization: '',
  courseNumber: '',
  courseRun: '',
  coursePacing: PACING.instructor,
  // Same default as before: 1 January of next year.
  startDate: `${now.getFullYear() + 1}-01-01`,
  startTime: '',
  endDate: '',
  endTime: '',
  enrollmentStartDate: '',
  enrollmentStartTime: '',
  enrollmentEndDate: '',
  enrollmentEndTime: '',
  certificatesDisplayBehavior: CERTIFICATE_BEHAVIOR.end,
  certificateAvailableDate: '',
  effort: '',
  prerequisiteCourse: '',
  entranceExamEnabled: false,
  entranceExamMinimumScorePct: String(DEFAULT_ENTRANCE_EXAM_SCORE),
  language: 'en',
  duration: '',
  pricingModel: PRICING.free,
  price: '',
  license: null,
  introVideo: '',
});

/** `2027-01-31` + `09:30` -> `2027-01-31T09:30:00Z`. Studio keeps course dates in UTC. */
export const toUtcDateTime = (date, time) => (date ? `${date}T${time || '00:00'}:00Z` : null);

/** The course key Studio will give the course, or '' while a part is missing. */
export const buildCourseKey = ({ organization, courseNumber, courseRun }) => {
  const parts = [organization, courseNumber, courseRun].map((part) => (part || '').trim());
  return parts.every(Boolean) ? `course-v1:${parts.join('+')}` : '';
};

/**
 * The YouTube id of what the author typed (an id or any usual YouTube link).
 * Returns '' for an empty value and null when no id can be read from it.
 */
export const parseYoutubeId = (value) => {
  const text = (value || '').trim();
  if (!text) {
    return '';
  }
  const fromUrl = text.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w-]{6,})/i);
  if (fromUrl) {
    return fromUrl[1];
  }
  return /^[\w-]{6,20}$/.test(text) ? text : null;
};

const escapeHtml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * The plain-text description as the HTML of the "Overview" block of the course page
 * (the only long text the public course page shows).
 */
export const descriptionToOverview = (description) =>
  (description || '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('\n');

/** Body of the create-course request. Images are not part of it (see the file comment). */
export const buildCreateCoursePayload = (values) => {
  const selfPaced = values.coursePacing === PACING.self;
  const endWithDate = values.certificatesDisplayBehavior === CERTIFICATE_BEHAVIOR.endWithDate;
  const payload = {
    display_name: values.title.trim(),
    org: values.organization.trim(),
    number: values.courseNumber.trim(),
    run: values.courseRun.trim(),
    self_paced: selfPaced,
    start_date: toUtcDateTime(values.startDate, values.startTime),
    end_date: toUtcDateTime(values.endDate, values.endTime),
    enrollment_start: toUtcDateTime(values.enrollmentStartDate, values.enrollmentStartTime),
    enrollment_end: toUtcDateTime(values.enrollmentEndDate, values.enrollmentEndTime),
    short_description: values.shortDescription.trim(),
    description: values.description.trim(),
    overview: descriptionToOverview(values.description),
    duration: values.duration.trim(),
    effort: values.effort.trim(),
    intro_video: parseYoutubeId(values.introVideo) || null,
    language: values.language || 'en',
    license: values.license || 'all-rights-reserved',
    pre_requisite_courses: values.prerequisiteCourse ? [values.prerequisiteCourse] : [],
    entrance_exam_enabled: values.entranceExamEnabled ? 'true' : 'false',
    entrance_exam_minimum_score_pct: values.entranceExamEnabled
      ? String(values.entranceExamMinimumScorePct || DEFAULT_ENTRANCE_EXAM_SCORE)
      : '',
    price: values.pricingModel === PRICING.paid ? String(values.price).trim() : '',
  };
  // A self-paced course always shows certificates on passing; Studio sets that itself.
  if (!selfPaced) {
    payload.certificates_display_behavior = values.certificatesDisplayBehavior;
    payload.certificate_available_date = endWithDate ? toUtcDateTime(values.certificateAvailableDate) : null;
  }
  return payload;
};

/** Text of a failed request, in the words of the server when it gave some. */
export const getRequestErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim() && !data.trim().startsWith('<')) {
    return data.trim();
  }
  const message = data?.error || data?.message || data?.ErrMsg || data?.detail || data?.developer_message;
  return typeof message === 'string' ? message.trim() : '';
};

export async function fetchCreateCourseOptions() {
  const { data } = await getAuthenticatedHttpClient().get(studioUrl('/titaned/api/v1/menu-config/'));
  return {
    organizations: data?.allowed_organizations_for_courses || [],
    canCreateOrganization: Boolean(data?.can_create_organizations),
  };
}

/** Existing courses of the author, offered as prerequisite. */
export async function fetchPrerequisiteOptions() {
  const { data } = await getAuthenticatedHttpClient().get(
    studioUrl('/api/contentstore/v2/home/courses'),
    { params: { page_size: 100, order: 'display_name' } },
  );
  return (data?.results?.courses || []).map((course) => ({
    id: course.course_key,
    name: course.display_name,
  }));
}

async function uploadCourseImage(courseKey, file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await getAuthenticatedHttpClient().post(studioUrl(`/assets/${courseKey}/`), formData);
  const name = data?.asset?.display_name;
  if (!name) {
    throw new Error('The upload did not return an asset.');
  }
  return name;
}

async function setCourseImages(courseKey, imageNames) {
  const url = studioUrl(`/api/contentstore/v1/course_details/${courseKey}`);
  const { data } = await getAuthenticatedHttpClient().get(url);
  const details = { ...data, ...imageNames };
  // Studio reads this value back as "CertificatesDisplayBehaviors.END_WITH_DATE"; send the plain value.
  const behavior = details.certificates_display_behavior;
  if (typeof behavior === 'string' && behavior.includes('.')) {
    details.certificates_display_behavior = behavior.split('.').pop().toLowerCase();
  }
  await getAuthenticatedHttpClient().put(url, details);
}

/**
 * Creates the course, then stores its images.
 *
 * Rejects when the course itself could not be created. Once it exists, a failing image
 * is reported in `failedImages` instead ('cardImage' / 'bannerImage'), because the form
 * cannot be submitted a second time for the same course.
 */
export async function createCourse(values, { cardImage, bannerImage } = {}) {
  const { data } = await getAuthenticatedHttpClient().post(
    studioUrl('/titaned/api/v1/create-course'),
    buildCreateCoursePayload(values),
  );
  const courseKey = data?.course_key;
  if (!data?.success || !courseKey) {
    const error = new Error(data?.error || '');
    error.response = { data };
    throw error;
  }

  const failedImages = [];
  const imageNames = {};
  const uploads = [
    ['cardImage', 'course_image_name', cardImage],
    ['bannerImage', 'banner_image_name', bannerImage],
  ].filter(([, , file]) => file);

  for (const [field, detailsKey, file] of uploads) {
    try {
      // One after the other: Studio writes both files to the same course.
      // eslint-disable-next-line no-await-in-loop
      imageNames[detailsKey] = await uploadCourseImage(courseKey, file);
    } catch {
      failedImages.push(field);
    }
  }

  if (Object.keys(imageNames).length > 0) {
    try {
      await setCourseImages(courseKey, imageNames);
    } catch {
      uploads.forEach(([field, detailsKey]) => {
        if (imageNames[detailsKey] && !failedImages.includes(field)) {
          failedImages.push(field);
        }
      });
    }
  }

  return { courseKey, failedImages };
}

/**
 * Checks the form. Returns `{ field: { message, values } }` (message descriptors) for
 * every field that needs a correction; an empty object when the form can be sent.
 */
export const validateCourseForm = (values, messages) => {
  const errors = {};
  const fail = (field, message, messageValues) => {
    if (!errors[field]) {
      errors[field] = { message, values: messageValues };
    }
  };

  if (!values.title.trim()) {
    fail('title', messages.titleIsRequired);
  }
  if (!values.shortDescription.trim()) {
    fail('shortDescription', messages.shortDescriptionIsRequired);
  }

  [
    ['organization', messages.organizationIsRequired, messages.organizationInvalid],
    ['courseNumber', messages.courseNumberIsRequired, messages.courseNumberInvalid],
    ['courseRun', messages.courseRunIsRequired, messages.courseRunInvalid],
  ].forEach(([field, required, invalid]) => {
    const value = values[field].trim();
    if (!value) {
      fail(field, required);
    } else if (!COURSE_KEY_PART_PATTERN.test(value)) {
      fail(field, invalid);
    }
  });
  const keyLength = [values.organization, values.courseNumber, values.courseRun]
    .reduce((total, part) => total + part.trim().length, 0);
  if (keyLength > COURSE_KEY_MAX_LENGTH) {
    fail('courseRun', messages.courseKeyTooLong, { max: COURSE_KEY_MAX_LENGTH });
  }

  // Dates. The UTC strings share one format, so they compare as text.
  const start = toUtcDateTime(values.startDate, values.startTime);
  const end = toUtcDateTime(values.endDate, values.endTime);
  const enrollmentStart = toUtcDateTime(values.enrollmentStartDate, values.enrollmentStartTime);
  const enrollmentEnd = toUtcDateTime(values.enrollmentEndDate, values.enrollmentEndTime);

  if (!start) {
    fail('startDate', messages.courseStartDateIsRequired);
  }
  [
    ['endDate', 'endTime'],
    ['enrollmentStartDate', 'enrollmentStartTime'],
    ['enrollmentEndDate', 'enrollmentEndTime'],
  ].forEach(([dateField, timeField]) => {
    if (values[timeField] && !values[dateField]) {
      fail(dateField, messages.timeNeedsDate);
    }
  });
  if (start && end && end < start) {
    fail('endDate', messages.courseEndDateCannotBeEarlierThan);
  }
  if (enrollmentStart && enrollmentEnd && enrollmentStart > enrollmentEnd) {
    fail('enrollmentStartDate', messages.enrollmentStartDateCannotBeLaterThan);
  }
  if (enrollmentStart && start && enrollmentStart > start) {
    fail('enrollmentStartDate', messages.enrollmentStartAfterCourseStart);
  }
  if (enrollmentEnd && end && enrollmentEnd > end) {
    fail('enrollmentEndDate', messages.enrollmentEndDateCannotBeLaterThan);
  }

  if (
    values.coursePacing !== PACING.self
    && values.certificatesDisplayBehavior === CERTIFICATE_BEHAVIOR.endWithDate
  ) {
    const certificateDate = toUtcDateTime(values.certificateAvailableDate);
    if (!certificateDate) {
      fail('certificateAvailableDate', messages.certificateDateRequired);
    } else if (!end) {
      fail('certificateAvailableDate', messages.certificateNeedsEndDate);
    } else if (certificateDate <= end) {
      fail('certificateAvailableDate', messages.certificateDateBeforeEnd);
    }
  }

  if (parseYoutubeId(values.introVideo) === null) {
    fail('introVideo', messages.introVideoInvalid);
  }

  if (values.entranceExamEnabled) {
    const score = Number(values.entranceExamMinimumScorePct);
    if (!Number.isInteger(score) || score < 1 || score > 100) {
      fail('entranceExamMinimumScorePct', messages.entranceExamScoreInvalid);
    }
  }

  if (values.pricingModel === PRICING.paid) {
    const price = String(values.price).trim();
    if (!/^\d+$/.test(price) || Number(price) < 1) {
      fail('price', messages.priceInvalid);
    }
  }

  return errors;
};
