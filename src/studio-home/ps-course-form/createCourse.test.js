import {
  buildCourseKey,
  buildCreateCoursePayload,
  descriptionToOverview,
  getInitialValues,
  parseYoutubeId,
  toUtcDateTime,
  validateCourseForm,
} from './createCourse';
import formMessages from './messages';
import pageMessages from './createCourseMessages';

const messages = { ...formMessages, ...pageMessages };

const filledValues = () => ({
  ...getInitialValues(new Date(2026, 5, 1)),
  title: ' QA Test Course 900 ',
  shortDescription: 'Short description for QA.',
  description: 'First paragraph.\n\nSecond <b>paragraph</b>.',
  organization: 'TitanEd',
  courseNumber: 'QA900',
  courseRun: '2026_test',
  startDate: '2027-02-01',
  startTime: '09:30',
  endDate: '2027-06-30',
  enrollmentStartDate: '2027-01-10',
  enrollmentStartTime: '08:00',
  enrollmentEndDate: '2027-03-01',
  certificatesDisplayBehavior: 'end_with_date',
  certificateAvailableDate: '2027-07-15',
  effort: '4',
  prerequisiteCourse: 'course-v1:TitanEd+CS101+2026',
  entranceExamEnabled: true,
  entranceExamMinimumScorePct: '65',
  language: 'hi',
  duration: '8 weeks',
  pricingModel: 'paid',
  price: '49',
  license: 'creative-commons: ver=4.0 BY NC ND',
  introVideo: 'https://www.youtube.com/watch?v=eIho2S0ZahI',
});

describe('create course data layer', () => {
  it('starts with next year as the course start date', () => {
    expect(getInitialValues(new Date(2026, 5, 1)).startDate).toBe('2027-01-01');
  });

  it('builds UTC date-times and the course key', () => {
    expect(toUtcDateTime('2027-02-01', '09:30')).toBe('2027-02-01T09:30:00Z');
    expect(toUtcDateTime('2027-02-01', '')).toBe('2027-02-01T00:00:00Z');
    expect(toUtcDateTime('', '09:30')).toBeNull();
    expect(buildCourseKey(filledValues())).toBe('course-v1:TitanEd+QA900+2026_test');
    expect(buildCourseKey({ organization: 'TitanEd', courseNumber: '', courseRun: 'x' })).toBe('');
  });

  it('reads the YouTube id from links and ids', () => {
    expect(parseYoutubeId('')).toBe('');
    expect(parseYoutubeId('eIho2S0ZahI')).toBe('eIho2S0ZahI');
    expect(parseYoutubeId('https://youtu.be/eIho2S0ZahI?t=3')).toBe('eIho2S0ZahI');
    expect(parseYoutubeId('https://www.youtube.com/watch?list=x&v=eIho2S0ZahI')).toBe('eIho2S0ZahI');
    expect(parseYoutubeId('youtu.be')).toBeNull();
    expect(parseYoutubeId('not a video')).toBeNull();
  });

  it('turns the description into escaped overview paragraphs', () => {
    expect(descriptionToOverview('First paragraph.\n\nSecond <b>paragraph</b>.\nSame.'))
      .toBe('<p>First paragraph.</p>\n<p>Second &lt;b&gt;paragraph&lt;/b&gt;.<br>Same.</p>');
    expect(descriptionToOverview('')).toBe('');
  });

  it('sends every field of the form', () => {
    expect(buildCreateCoursePayload(filledValues())).toEqual({
      display_name: 'QA Test Course 900',
      org: 'TitanEd',
      number: 'QA900',
      run: '2026_test',
      self_paced: false,
      start_date: '2027-02-01T09:30:00Z',
      end_date: '2027-06-30T00:00:00Z',
      enrollment_start: '2027-01-10T08:00:00Z',
      enrollment_end: '2027-03-01T00:00:00Z',
      short_description: 'Short description for QA.',
      description: 'First paragraph.\n\nSecond <b>paragraph</b>.',
      overview: '<p>First paragraph.</p>\n<p>Second &lt;b&gt;paragraph&lt;/b&gt;.</p>',
      duration: '8 weeks',
      effort: '4',
      intro_video: 'eIho2S0ZahI',
      language: 'hi',
      license: 'creative-commons: ver=4.0 BY NC ND',
      pre_requisite_courses: ['course-v1:TitanEd+CS101+2026'],
      entrance_exam_enabled: 'true',
      entrance_exam_minimum_score_pct: '65',
      price: '49',
      certificates_display_behavior: 'end_with_date',
      certificate_available_date: '2027-07-15T00:00:00Z',
    });
  });

  it('sends neutral values for what the author left out', () => {
    const payload = buildCreateCoursePayload({
      ...getInitialValues(new Date(2026, 5, 1)),
      title: 'T',
      shortDescription: 'S',
      organization: 'O',
      courseNumber: 'N',
      courseRun: 'R',
      coursePacing: 'self',
      price: '49',
    });
    expect(payload).toMatchObject({
      self_paced: true,
      end_date: null,
      intro_video: null,
      effort: '',
      license: 'all-rights-reserved',
      pre_requisite_courses: [],
      entrance_exam_enabled: 'false',
      entrance_exam_minimum_score_pct: '',
      price: '',
    });
    expect(payload).not.toHaveProperty('certificates_display_behavior');
  });

  it('accepts a complete form and names the fields to correct', () => {
    expect(validateCourseForm(filledValues(), messages)).toEqual({});

    const errors = validateCourseForm({
      ...filledValues(),
      title: ' ',
      courseNumber: 'QA 900',
      endDate: '2027-01-01',
      enrollmentStartDate: '2027-02-02',
      certificateAvailableDate: '',
      entranceExamMinimumScorePct: '120',
      price: '4.5',
      introVideo: 'not a video',
    }, messages);
    expect(Object.keys(errors).sort()).toEqual([
      'certificateAvailableDate',
      'courseNumber',
      'endDate',
      'enrollmentEndDate',
      'enrollmentStartDate',
      'entranceExamMinimumScorePct',
      'introVideo',
      'price',
      'title',
    ]);
    expect(errors.courseNumber.message).toBe(messages.courseNumberInvalid);
    expect(errors.endDate.message).toBe(messages.courseEndDateCannotBeEarlierThan);
  });
});
