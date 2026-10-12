import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Icon,
  Row,
  Stack,
  StatefulButton,
} from '@openedx/paragon';
import {
  Error as ErrorIcon,
  Photo,
  WarningFilled,
} from '@openedx/paragon/icons';

import { videoTranscriptLanguages } from '../../editors/data/constants/video';
import { LICENSE_TYPE } from '../../schedule-and-details/license-section/constants';
import { useLicenseDetails } from '../../schedule-and-details/license-section/hooks';
import LicenseSelector from '../../schedule-and-details/license-section/license-selector';
import LicenseCommonsOptions from '../../schedule-and-details/license-section/license-commons-options';
import LicenseIcons from '../../schedule-and-details/license-section/license-icons';
import licenseMessages from '../../schedule-and-details/license-section/messages';
import certificateMessages from '../../schedule-and-details/schedule-section/certificate-display-row/messages';
import { formatImageValidationError, imageValidationMessages, validateImageFile } from '../../utils/imageValidation';
import {
  CERTIFICATE_BEHAVIOR,
  PACING,
  PRICING,
  SHORT_DESCRIPTION_MAX_LENGTH,
  buildCourseKey,
  createCourse,
  fetchCreateCourseOptions,
  fetchPrerequisiteOptions,
  getInitialValues,
  getRequestErrorMessage,
  parseYoutubeId,
  toUtcDateTime,
  validateCourseForm,
} from './createCourse';
import formMessages from './messages';
import pageMessages from './createCourseMessages';
import './CustomCreateNewCourseForm.scss';

const messages = { ...formMessages, ...pageMessages };

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const IMAGE_FIELDS = ['cardImage', 'bannerImage'];
const fieldId = (field) => `create-course-${field}`;

/** A labelled form field with its help text and its validation message. */
const Field = ({
  field,
  label,
  required,
  help,
  error,
  className,
  children,
}) => (
  <Form.Group controlId={fieldId(field)} isInvalid={Boolean(error)} className={className}>
    <Form.Label>
      {label}
      {required && <span className="tels-create-course__required" aria-hidden="true">*</span>}
    </Form.Label>
    {children}
    {error && <Form.Control.Feedback type="invalid" hasIcon={false}>{error}</Form.Control.Feedback>}
    {help && <Form.Text>{help}</Form.Text>}
  </Form.Group>
);

Field.propTypes = {
  field: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  required: PropTypes.bool,
  help: PropTypes.node,
  error: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Field.defaultProps = {
  required: false,
  help: null,
  error: null,
  className: 'mb-0',
};

/** One titled group of fields. */
const FormCard = ({ title, help, children }) => (
  <Card className="tels-create-course__card">
    <Card.Section>
      <h3 className="tels-create-course__card-title">{title}</h3>
      {help && <p className="tels-create-course__card-help">{help}</p>}
      <Stack gap={4} className="tels-create-course__fields">{children}</Stack>
    </Card.Section>
  </Card>
);

FormCard.propTypes = {
  title: PropTypes.node.isRequired,
  help: PropTypes.node,
  children: PropTypes.node.isRequired,
};

FormCard.defaultProps = {
  help: null,
};

const CustomCreateNewCourseForm = ({ handleOnClickCancel }) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const [values, setValues] = useState(getInitialValues);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [created, setCreated] = useState(null);
  const [images, setImages] = useState({ cardImage: null, bannerImage: null });
  const [imageErrors, setImageErrors] = useState({});
  const [organizations, setOrganizations] = useState([]);
  // Until the server says otherwise the organization can be typed, so the form is never stuck.
  const [canTypeOrganization, setCanTypeOrganization] = useState(true);
  const [prerequisites, setPrerequisites] = useState(null);
  const alertRef = useRef(null);
  const imagesRef = useRef(images);
  imagesRef.current = images;

  useEffect(() => {
    let isActive = true;
    fetchCreateCourseOptions()
      .then((options) => {
        if (isActive) {
          setOrganizations(options.organizations);
          setCanTypeOrganization(options.canCreateOrganization || options.organizations.length === 0);
        }
      })
      .catch(() => {});
    fetchPrerequisiteOptions()
      .then((courses) => isActive && setPrerequisites(courses))
      .catch(() => isActive && setPrerequisites([]));
    return () => {
      isActive = false;
      IMAGE_FIELDS.forEach((field) => {
        if (imagesRef.current[field]) {
          URL.revokeObjectURL(imagesRef.current[field].preview);
        }
      });
    };
  }, []);

  const setValue = useCallback((field, value) => {
    setValues((previous) => (previous[field] === value ? previous : { ...previous, [field]: value }));
  }, []);
  const touch = (field) => setTouched((previous) => (previous[field] ? previous : { ...previous, [field]: true }));

  /** Props of a text-like control bound to a form value. */
  const bind = (field) => ({
    name: field,
    value: values[field],
    onChange: (event) => setValue(field, event.target.value),
    onBlur: () => touch(field),
  });

  const {
    licenseURL,
    licenseType,
    licenseDetails,
    handleToggleCheckbox,
    handleChangeLicenseType,
  } = useLicenseDetails(values.license, (value) => setValue('license', value));

  const allErrors = useMemo(() => validateCourseForm(values, messages), [values]);
  const errorOf = (field) => {
    const error = allErrors[field];
    return error && (submitAttempted || touched[field]) ? intl.formatMessage(error.message, error.values) : null;
  };
  const invalidCount = Object.keys(allErrors).length;

  const languageOptions = useMemo(
    () => Object.entries(videoTranscriptLanguages).filter(([code]) => code !== 'placeholder'),
    [],
  );

  const courseKey = buildCourseKey(values);
  const courseUrl = courseKey ? `${getConfig().LMS_BASE_URL}/courses/${courseKey}/about` : '';
  const isSelfPaced = values.coursePacing === PACING.self;
  const isPaid = values.pricingModel === PRICING.paid;
  const videoId = parseYoutubeId(values.introVideo);
  const startDateTime = toUtcDateTime(values.startDate, values.startTime);
  const isLocked = isSubmitting || Boolean(created);

  const handleImageChange = async (field, event) => {
    const file = event.target.files?.[0];
    // Lets the author pick the same file again after removing it.
    // eslint-disable-next-line no-param-reassign
    event.target.value = '';
    if (!file) {
      return;
    }
    let message = '';
    try {
      const result = await validateImageFile(file, ALLOWED_IMAGE_TYPES);
      if (!result.isValid) {
        message = formatImageValidationError(intl, result.error);
      }
    } catch {
      message = intl.formatMessage(imageValidationMessages.failed);
    }
    setImageErrors((previous) => ({ ...previous, [field]: message }));
    if (message) {
      return;
    }
    setImages((previous) => {
      if (previous[field]) {
        URL.revokeObjectURL(previous[field].preview);
      }
      return { ...previous, [field]: { file, preview: URL.createObjectURL(file) } };
    });
  };

  const handleImageRemove = (field) => {
    setImageErrors((previous) => ({ ...previous, [field]: '' }));
    setImages((previous) => {
      if (previous[field]) {
        URL.revokeObjectURL(previous[field].preview);
      }
      return { ...previous, [field]: null };
    });
  };

  const showAlert = () =>
    window.requestAnimationFrame(
      () => alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLocked) {
      return;
    }
    setSubmitAttempted(true);
    setSubmitError('');

    const firstInvalid = Object.keys(allErrors)[0];
    if (firstInvalid) {
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createCourse(values, {
        cardImage: images.cardImage?.file,
        bannerImage: images.bannerImage?.file,
      });
      if (result.failedImages.length === 0) {
        navigate(`/course/${result.courseKey}`);
        return;
      }
      setCreated(result);
      showAlert();
    } catch (error) {
      let message = getRequestErrorMessage(error);
      if (!message) {
        const status = error?.response?.status;
        if (status === 401) {
          message = intl.formatMessage(messages.authenticationFailedPleaseLogInAgain);
        } else if (status === 403) {
          message = intl.formatMessage(messages.youDoNotHavePermissionToCreate);
        } else if (status >= 500) {
          message = intl.formatMessage(messages.serverErrorPleaseTryAgainLater);
        } else if (!error?.response) {
          message = intl.formatMessage(messages.networkErrorPleaseCheckYourConnectionAnd);
        } else {
          message = intl.formatMessage(messages.failedToCreateCoursePleaseTryAgain);
        }
      }
      setSubmitError(message);
      showAlert();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (handleOnClickCancel) {
      handleOnClickCancel();
    } else {
      navigate('/my-courses');
    }
  };

  const renderDateTime = (dateField, timeField, dateLabel, timeLabel, options = {}) => (
    <Row className="tels-create-course__row">
      <Col xs={12} sm={7}>
        <Field
          field={dateField}
          label={dateLabel}
          required={options.required}
          help={options.help}
          error={errorOf(dateField)}
        >
          <Form.Control type="date" max="9999-12-31" {...bind(dateField)} />
        </Field>
      </Col>
      <Col xs={12} sm={5}>
        <Field field={timeField} label={timeLabel} help={intl.formatMessage(messages.timeHelp)}>
          <Form.Control type="time" {...bind(timeField)} />
        </Field>
      </Col>
    </Row>
  );

  const renderImageField = (field, label, help, previewAlt) => {
    const image = images[field];
    const error = imageErrors[field];
    const inputId = fieldId(field);
    return (
      <div className="tels-create-course__image-field">
        <label className="pgn__form-label" htmlFor={inputId}>{label}</label>
        <div className={`tels-create-course__image-box tels-create-course__image-box--${field}`}>
          {image ?
            <img src={image.preview} alt={previewAlt} /> :
            <Icon src={Photo} className="tels-create-course__image-placeholder" />}
        </div>
        <Stack direction="horizontal" gap={2} className="tels-create-course__image-actions">
          <Button
            variant="outline-primary"
            size="sm"
            disabled={isLocked}
            onClick={() => document.getElementById(inputId)?.click()}
          >
            {intl.formatMessage(image ? messages.imageReplace : messages.imageDrop)}
          </Button>
          {image && (
            <Button variant="tertiary" size="sm" disabled={isLocked} onClick={() => handleImageRemove(field)}>
              {intl.formatMessage(messages.imageRemove)}
            </Button>
          )}
        </Stack>
        <input
          id={inputId}
          type="file"
          className="sr-only"
          tabIndex={-1}
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          aria-describedby={`${inputId}-help`}
          onChange={(event) => handleImageChange(field, event)}
        />
        {error && <div className="pgn__form-text pgn__form-text-invalid" role="alert">{error}</div>}
        <div className="pgn__form-text" id={`${inputId}-help`}>{help}</div>
      </div>
    );
  };

  const certificateOptions = [
    [CERTIFICATE_BEHAVIOR.earlyNoInfo, certificateMessages.certificateBehaviorDropdownOption1],
    [CERTIFICATE_BEHAVIOR.end, certificateMessages.certificateBehaviorDropdownOption2],
    [CERTIFICATE_BEHAVIOR.endWithDate, certificateMessages.certificateBehaviorDropdownOption3],
  ];

  return (
    <div className="tels-create-course">
      <header className="tels-create-course__header">
        <h2 className="tels-create-course__title">{intl.formatMessage(messages.pageTitle)}</h2>
        <p className="tels-create-course__lead">{intl.formatMessage(messages.pageHelp)}</p>
      </header>

      <div ref={alertRef} className="tels-create-course__alerts" aria-live="polite">
        {submitError && (
          <Alert variant="danger" icon={ErrorIcon} dismissible onClose={() => setSubmitError('')}>
            <Alert.Heading>{intl.formatMessage(messages.errorTitle)}</Alert.Heading>
            <p className="tels-create-course__alert-text">{submitError}</p>
            <p className="mb-0">{intl.formatMessage(messages.errorHint)}</p>
          </Alert>
        )}
        {created && (
          <Alert
            variant="warning"
            icon={WarningFilled}
            actions={[
              <Button key="settings" onClick={() => navigate(`/course/${created.courseKey}/settings/details`)}>
                {intl.formatMessage(messages.openSettings)}
              </Button>,
              <Button key="outline" variant="outline-primary" onClick={() => navigate(`/course/${created.courseKey}`)}>
                {intl.formatMessage(messages.openCourse)}
              </Button>,
            ]}
          >
            <Alert.Heading>{intl.formatMessage(messages.createdWithIssuesTitle)}</Alert.Heading>
            {created.failedImages.includes('cardImage') && (
              <p className="mb-1">{intl.formatMessage(messages.createdWithIssuesCard)}</p>
            )}
            {created.failedImages.includes('bannerImage') && (
              <p className="mb-1">{intl.formatMessage(messages.createdWithIssuesBanner)}</p>
            )}
            <p className="mb-0">
              {intl.formatMessage(messages.createdWithIssuesHint, { courseKey: created.courseKey })}
            </p>
          </Alert>
        )}
      </div>

      <Form noValidate onSubmit={handleSubmit} className="tels-create-course__form">
        <div className="tels-create-course__layout">
          <fieldset className="tels-create-course__main" disabled={isLocked}>
            <p className="tels-create-course__legend">
              {intl.formatMessage(messages.requiredLegend, {
                asterisk: <span className="tels-create-course__required" key="asterisk">*</span>,
              })}
            </p>

            <FormCard
              title={intl.formatMessage(messages.basicsTitle)}
              help={intl.formatMessage(messages.basicsHelp)}
            >
              <Field
                field="title"
                label={intl.formatMessage(messages.title)}
                required
                help={intl.formatMessage(messages.titleHelp)}
                error={errorOf('title')}
              >
                <Form.Control
                  type="text"
                  maxLength={255}
                  placeholder={intl.formatMessage(messages.titlePlaceholder)}
                  {...bind('title')}
                />
              </Field>

              <Field
                field="shortDescription"
                label={intl.formatMessage(messages.shortDescription)}
                required
                help={
                  <span className="tels-create-course__split-help">
                    <span>{intl.formatMessage(messages.aShortDescriptionThatWillBeDisplayed)}</span>
                    <span>
                      {intl.formatMessage(messages.charactersLeft, {
                        count: SHORT_DESCRIPTION_MAX_LENGTH - values.shortDescription.length,
                      })}
                    </span>
                  </span>
                }
                error={errorOf('shortDescription')}
              >
                <Form.Control
                  as="textarea"
                  rows={2}
                  maxLength={SHORT_DESCRIPTION_MAX_LENGTH}
                  {...bind('shortDescription')}
                />
              </Field>

              <Field
                field="description"
                label={intl.formatMessage(messages.description)}
                help={intl.formatMessage(messages.descriptionHelp)}
              >
                <Form.Control as="textarea" rows={5} {...bind('description')} />
              </Field>

              <Row className="tels-create-course__row">
                <Col xs={12} md={4}>
                  <Field
                    field="organization"
                    label={intl.formatMessage(messages.organization)}
                    required
                    help={intl.formatMessage(
                      canTypeOrganization
                        ? messages.organizationHelpNew
                        : messages.theNameOfTheOrganizationSponsoringThe,
                    )}
                    error={errorOf('organization')}
                  >
                    {canTypeOrganization ?
                      (
                        <Form.Control
                          type="text"
                          list="create-course-organizations"
                          autoComplete="off"
                          {...bind('organization')}
                        />
                      ) :
                      (
                        <Form.Control as="select" {...bind('organization')}>
                          <option value="">{intl.formatMessage(messages.selectAnOrganization)}</option>
                          {organizations.map((organization) => (
                            <option key={organization} value={organization}>{organization}</option>
                          ))}
                        </Form.Control>
                      )}
                  </Field>
                  <datalist id="create-course-organizations">
                    {organizations.map((organization) => (
                      // eslint-disable-next-line jsx-a11y/control-has-associated-label
                      <option key={organization} value={organization} />
                    ))}
                  </datalist>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Field
                    field="courseNumber"
                    label={intl.formatMessage(messages.courseNumber)}
                    required
                    help={intl.formatMessage(messages.courseNumberHelp)}
                    error={errorOf('courseNumber')}
                  >
                    <Form.Control
                      type="text"
                      placeholder={intl.formatMessage(messages.eGCs101)}
                      {...bind('courseNumber')}
                    />
                  </Field>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Field
                    field="courseRun"
                    label={intl.formatMessage(messages.courseRun)}
                    required
                    help={intl.formatMessage(messages.courseRunHelp)}
                    error={errorOf('courseRun')}
                  >
                    <Form.Control
                      type="text"
                      placeholder={intl.formatMessage(messages.eG2014T1)}
                      {...bind('courseRun')}
                    />
                  </Field>
                </Col>
              </Row>

              <Form.Group className="mb-0">
                <Form.Label id="create-course-pacing-label">{intl.formatMessage(messages.coursePacing)}</Form.Label>
                <Form.RadioSet
                  name="coursePacing"
                  aria-labelledby="create-course-pacing-label"
                  value={values.coursePacing}
                  onChange={(event) => setValue('coursePacing', event.target.value)}
                  className="tels-create-course__choices"
                >
                  <Form.Radio
                    value={PACING.instructor}
                    description={intl.formatMessage(messages.instructorPacedHelp)}
                  >
                    {intl.formatMessage(messages.instructorPaced)}
                  </Form.Radio>
                  <Form.Radio value={PACING.self} description={intl.formatMessage(messages.selfPacedHelp)}>
                    {intl.formatMessage(messages.selfPaced)}
                  </Form.Radio>
                </Form.RadioSet>
              </Form.Group>
            </FormCard>

            <FormCard
              title={intl.formatMessage(messages.schedule)}
              help={intl.formatMessage(messages.scheduleHelp)}
            >
              {renderDateTime(
                'startDate',
                'startTime',
                intl.formatMessage(messages.courseStartDate),
                intl.formatMessage(messages.courseStartTime),
                { required: true, help: intl.formatMessage(messages.enterTheDateWhenYourCourseWill) },
              )}
              {renderDateTime(
                'endDate',
                'endTime',
                intl.formatMessage(messages.courseEndDate),
                intl.formatMessage(messages.courseEndTime),
                { help: intl.formatMessage(messages.enterTheDateWhenYourCourseWill2) },
              )}
              {renderDateTime(
                'enrollmentStartDate',
                'enrollmentStartTime',
                intl.formatMessage(messages.enrollmentStartDate),
                intl.formatMessage(messages.enrollmentStartTime),
                { help: intl.formatMessage(messages.enterTheDateWhenEnrollmentWillStart) },
              )}
              {renderDateTime(
                'enrollmentEndDate',
                'enrollmentEndTime',
                intl.formatMessage(messages.enrollmentEndDate),
                intl.formatMessage(messages.enrollmentEndTime),
                { help: intl.formatMessage(messages.enterTheDateWhenEnrollmentWillEnd) },
              )}
              {isSelfPaced ?
                (
                  <p className="tels-create-course__note">
                    {intl.formatMessage(messages.certificateSelfPaced)}
                  </p>
                ) :
                (
                  <Row className="tels-create-course__row">
                    <Col xs={12} sm={7}>
                      <Field
                        field="certificatesDisplayBehavior"
                        label={intl.formatMessage(certificateMessages.certificateBehaviorLabel)}
                        help={intl.formatMessage(certificateMessages.certificateDisplayBehaviorToggleParagraph)}
                      >
                        <Form.Control as="select" {...bind('certificatesDisplayBehavior')}>
                          {certificateOptions.map(([value, label]) => (
                            <option key={value} value={value}>{intl.formatMessage(label)}</option>
                          ))}
                        </Form.Control>
                      </Field>
                    </Col>
                    {values.certificatesDisplayBehavior === CERTIFICATE_BEHAVIOR.endWithDate && (
                      <Col xs={12} sm={5}>
                        <Field
                          field="certificateAvailableDate"
                          label={intl.formatMessage(certificateMessages.certificateAvailableDateLabel)}
                          required
                          error={errorOf('certificateAvailableDate')}
                        >
                          <Form.Control type="date" max="9999-12-31" {...bind('certificateAvailableDate')} />
                        </Field>
                      </Col>
                    )}
                  </Row>
                )}
            </FormCard>

            <FormCard
              title={intl.formatMessage(messages.presentationTitle)}
              help={intl.formatMessage(messages.presentationHelp)}
            >
              <Row className="tels-create-course__row">
                <Col xs={12} sm={6}>
                  {renderImageField(
                    'cardImage',
                    intl.formatMessage(messages.courseCardImage),
                    intl.formatMessage(messages.cardImageHelp),
                    intl.formatMessage(messages.cardImagePreviewAlt),
                  )}
                </Col>
                <Col xs={12} sm={6}>
                  {renderImageField(
                    'bannerImage',
                    intl.formatMessage(messages.courseBannerImage),
                    intl.formatMessage(messages.bannerImageHelp),
                    intl.formatMessage(messages.bannerImagePreviewAlt),
                  )}
                </Col>
              </Row>
              <Field
                field="introVideo"
                label={intl.formatMessage(messages.introVideo)}
                help={videoId
                  ? intl.formatMessage(messages.introVideoDetected, { videoId })
                  : intl.formatMessage(messages.introVideoHelp)}
                error={errorOf('introVideo')}
              >
                <Form.Control
                  type="text"
                  placeholder={intl.formatMessage(messages.introVideoPlaceholder)}
                  {...bind('introVideo')}
                />
              </Field>
            </FormCard>

            <FormCard
              title={intl.formatMessage(messages.detailsTitle)}
              help={intl.formatMessage(messages.detailsHelp)}
            >
              <Row className="tels-create-course__row">
                <Col xs={12} md={4}>
                  <Field
                    field="language"
                    label={intl.formatMessage(messages.language)}
                    help={intl.formatMessage(messages.thePrimaryLanguageOfYourCourse)}
                  >
                    <Form.Control as="select" {...bind('language')}>
                      {languageOptions.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                    </Form.Control>
                  </Field>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Field
                    field="duration"
                    label={intl.formatMessage(messages.duration)}
                    help={intl.formatMessage(messages.theExpectedDurationOfYourCourse)}
                  >
                    <Form.Control
                      type="text"
                      placeholder={intl.formatMessage(messages.eG8Weeks)}
                      {...bind('duration')}
                    />
                  </Field>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Field
                    field="effort"
                    label={intl.formatMessage(messages.hoursOfEffortPerWeek)}
                    help={intl.formatMessage(messages.timeSpentOnAllCourseWork)}
                  >
                    <Form.Control
                      type="text"
                      placeholder={intl.formatMessage(messages.effortPlaceholder)}
                      {...bind('effort')}
                    />
                  </Field>
                </Col>
              </Row>
            </FormCard>

            <FormCard
              title={intl.formatMessage(messages.requirements)}
              help={intl.formatMessage(messages.requirementsHelp)}
            >
              <Field
                field="prerequisiteCourse"
                label={intl.formatMessage(messages.prerequisiteCourse)}
                help={intl.formatMessage(messages.courseThatStudentsMustCompleteBeforeBeginning)}
              >
                <Form.Control as="select" {...bind('prerequisiteCourse')}>
                  <option value="">
                    {intl.formatMessage(prerequisites === null ? messages.prerequisiteLoading : messages.none)}
                  </option>
                  {(prerequisites || []).map((course) => (
                    <option key={course.id} value={course.id}>{`${course.name} (${course.id})`}</option>
                  ))}
                </Form.Control>
              </Field>

              <div>
                <Form.Checkbox
                  checked={values.entranceExamEnabled}
                  onChange={(event) => setValue('entranceExamEnabled', event.target.checked)}
                  description={intl.formatMessage(messages.requireStudentsToPassAnExamBefore)}
                >
                  {intl.formatMessage(messages.entranceExam)}
                </Form.Checkbox>
                {values.entranceExamEnabled && (
                  <Row className="tels-create-course__row tels-create-course__nested">
                    <Col xs={12} sm={6}>
                      <Field
                        field="entranceExamMinimumScorePct"
                        label={intl.formatMessage(messages.minimumScore)}
                        required
                        help={intl.formatMessage(messages.theScoreStudentMustMeetInOrder)}
                        error={errorOf('entranceExamMinimumScorePct')}
                      >
                        <Form.Control
                          type="number"
                          min={1}
                          max={100}
                          step={1}
                          {...bind('entranceExamMinimumScorePct')}
                        />
                      </Field>
                    </Col>
                  </Row>
                )}
              </div>
            </FormCard>

            <FormCard
              title={intl.formatMessage(messages.pricing)}
              help={intl.formatMessage(messages.pricingHelp)}
            >
              <Form.Group className="mb-0">
                <Form.Label id="create-course-pricing-label">{intl.formatMessage(messages.pricingModel)}</Form.Label>
                <Form.RadioSet
                  name="pricingModel"
                  aria-labelledby="create-course-pricing-label"
                  value={values.pricingModel}
                  onChange={(event) => setValue('pricingModel', event.target.value)}
                  className="tels-create-course__choices"
                >
                  <Form.Radio value={PRICING.free} description={intl.formatMessage(messages.freeHelp)}>
                    {intl.formatMessage(messages.free)}
                  </Form.Radio>
                  <Form.Radio value={PRICING.paid} description={intl.formatMessage(messages.paidHelp)}>
                    {intl.formatMessage(messages.paid)}
                  </Form.Radio>
                </Form.RadioSet>
              </Form.Group>
              {isPaid && (
                <Row className="tels-create-course__row">
                  <Col xs={12} sm={6}>
                    <Field
                      field="price"
                      label={intl.formatMessage(messages.price)}
                      required
                      help={intl.formatMessage(messages.priceHelp)}
                      error={errorOf('price')}
                    >
                      <Form.Control
                        type="number"
                        min={1}
                        step={1}
                        inputMode="numeric"
                        placeholder={intl.formatMessage(messages.enterCoursePrice)}
                        {...bind('price')}
                      />
                    </Field>
                  </Col>
                </Row>
              )}
            </FormCard>

            <FormCard
              title={intl.formatMessage(messages.courseContentLicense)}
              help={intl.formatMessage(messages.licenseHelp)}
            >
              <div className="tels-create-course__license">
                <LicenseSelector licenseType={licenseType} onChangeLicenseType={handleChangeLicenseType} />
                {licenseType === LICENSE_TYPE.creativeCommons && (
                  <LicenseCommonsOptions licenseDetails={licenseDetails} onToggleCheckbox={handleToggleCheckbox} />
                )}
                <p className="tels-create-course__note">
                  {intl.formatMessage(licenseMessages.licenseDescription)}
                </p>
                <LicenseIcons licenseType={licenseType} licenseDetails={licenseDetails} licenseURL={licenseURL} />
              </div>
            </FormCard>
          </fieldset>

          <aside className="tels-create-course__aside">
            <Card className="tels-create-course__card">
              <Card.Section>
                <h3 className="tels-create-course__card-title">{intl.formatMessage(messages.previewTitle)}</h3>
                <p className="tels-create-course__card-help">{intl.formatMessage(messages.previewHelp)}</p>
                <div className="tels-create-course__preview">
                  <div className="tels-create-course__preview-image">
                    {images.cardImage ?
                      <img src={images.cardImage.preview} alt="" /> :
                      <Icon src={Photo} className="tels-create-course__image-placeholder" />}
                  </div>
                  <div className="tels-create-course__preview-body">
                    {(values.organization || values.courseNumber) && (
                      <p className="tels-create-course__preview-org">
                        {[values.organization, values.courseNumber].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p
                      className={`tels-create-course__preview-title${
                        values.title ? '' : ' tels-create-course__preview--empty'
                      }`}
                    >
                      {values.title || intl.formatMessage(messages.previewTitlePlaceholder)}
                    </p>
                    <p
                      className={`tels-create-course__preview-text${
                        values.shortDescription ? '' : ' tels-create-course__preview--empty'
                      }`}
                    >
                      {values.shortDescription || intl.formatMessage(messages.previewDescriptionPlaceholder)}
                    </p>
                    <div className="tels-create-course__preview-meta">
                      <Badge variant="light">
                        {intl.formatMessage(isSelfPaced ? messages.selfPaced : messages.instructorPaced)}
                      </Badge>
                      {startDateTime && !isSelfPaced && (
                        <Badge variant="light">
                          {intl.formatMessage(messages.previewStarts, {
                            date: intl.formatDate(startDateTime, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              timeZone: 'UTC',
                            }),
                          })}
                        </Badge>
                      )}
                      <Badge variant={isPaid && values.price ? 'info' : 'success'}>
                        {isPaid && values.price
                          ? intl.formatMessage(messages.previewPrice, { price: values.price })
                          : intl.formatMessage(messages.free)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card.Section>
            </Card>

            <Card className="tels-create-course__card">
              <Card.Section>
                <h3 className="tels-create-course__card-title">{intl.formatMessage(messages.courseIdTitle)}</h3>
                <p className="tels-create-course__card-help">{intl.formatMessage(messages.courseIdHelp)}</p>
                {courseKey ?
                  (
                    <dl className="tels-create-course__ids">
                      <dt>{intl.formatMessage(messages.courseIdLabel)}</dt>
                      <dd>{courseKey}</dd>
                      <dt>{intl.formatMessage(messages.courseUrlLabel)}</dt>
                      <dd>{courseUrl}</dd>
                    </dl>
                  ) :
                  <p className="tels-create-course__note">{intl.formatMessage(messages.courseIdEmpty)}</p>}
              </Card.Section>
            </Card>

            <Card className="tels-create-course__card">
              <Card.Section>
                <h3 className="tels-create-course__card-title">{intl.formatMessage(messages.tipsTitle)}</h3>
                <ul className="tels-create-course__tips">
                  <li>{intl.formatMessage(messages.tip1)}</li>
                  <li>{intl.formatMessage(messages.tip2)}</li>
                  <li>{intl.formatMessage(messages.tip3)}</li>
                  <li>{intl.formatMessage(messages.tip4)}</li>
                </ul>
              </Card.Section>
            </Card>
          </aside>
        </div>

        <div className="tels-create-course__actions">
          <p className="tels-create-course__actions-status" role="status">
            {submitAttempted && invalidCount > 0 && !created
              ? intl.formatMessage(messages.fixErrors, { count: invalidCount })
              : courseKey}
          </p>
          <Button variant="tertiary" onClick={handleCancel} disabled={isSubmitting}>
            {intl.formatMessage(messages.cancel)}
          </Button>
          <StatefulButton
            type="submit"
            variant="primary"
            state={isSubmitting ? 'pending' : 'default'}
            labels={{
              default: intl.formatMessage(messages.createCourse),
              pending: intl.formatMessage(messages.creatingCourse),
            }}
            disabledStates={['pending']}
            disabled={Boolean(created)}
          />
        </div>
      </Form>
    </div>
  );
};

CustomCreateNewCourseForm.propTypes = {
  handleOnClickCancel: PropTypes.func,
};

CustomCreateNewCourseForm.defaultProps = {
  handleOnClickCancel: null,
};

export default CustomCreateNewCourseForm;
