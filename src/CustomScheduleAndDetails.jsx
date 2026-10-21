/*
 * Course → Schedule & Details, in the look of the "Create new course" form.
 *
 * Every field is one of the stock sections of src/schedule-and-details (basic, credit, pacing,
 * schedule, details, introducing, learning outcomes, instructors, requirements, licence), so
 * nothing the stock page can do is lost: permissions, validation, image uploads, the entrance
 * exam and prerequisites all work as upstream. This file adds the layout (cards, a section
 * bar, a save bar that stays in view), one save request with clear feedback, and the Pricing
 * card, which only exists on a site that has the Ecommerce feature.
 *
 * Rendered through the plugin slot `schedule_and_details_plugin_slot` (env.config.jsx); the
 * stock page around it loads the course details and settings into the store.
 */
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  Button, Form, Hyperlink, StatefulButton,
} from '@openedx/paragon';
import {
  CheckCircle as CheckCircleIcon, ErrorOutline as ErrorOutlineIcon, Launch,
} from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';

import AlertMessage from './generic/alert-message';
import InternetConnectionAlert from './generic/internet-connection-alert';
import PermissionDeniedAlert from './generic/PermissionDeniedAlert';
import { RequestStatus } from './data/constants';
import { STATEFUL_BUTTON_STATES } from './constants';
import { useScrollToHashElement } from './hooks';
import { useCourseUserPermissions } from './authz/hooks';
import { getScheduleAndDetailsPermissions } from './authz/permissionHelpers';
import {
  getCourseDetails, getCourseSettings, getLoadingDetailsStatus, getLoadingSettingsStatus, getSavingStatus,
} from './schedule-and-details/data/selectors';
import { updateCourseDetailsQuery } from './schedule-and-details/data/thunks';
import { useSaveValuesPrompt } from './schedule-and-details/hooks';
import BasicSection from './schedule-and-details/basic-section';
import CreditSection from './schedule-and-details/credit-section';
import DetailsSection from './schedule-and-details/details-section';
import IntroducingSection from './schedule-and-details/introducing-section';
import PacingSection from './schedule-and-details/pacing-section';
import ScheduleSection from './schedule-and-details/schedule-section';
import LearningOutcomesSection from './schedule-and-details/learning-outcomes-section';
import InstructorsSection from './schedule-and-details/instructors-section';
import RequirementsSection from './schedule-and-details/requirements-section';
import LicenseSection from './schedule-and-details/license-section';
import ScheduleSidebar from './schedule-and-details/schedule-sidebar';
import stockMessages from './schedule-and-details/messages';
import messages from './schedule-and-details/customDetailsMessages';
import { useSiteFeatures } from './useSiteFeatures';
import './CustomScheduleAndDetails.scss';

const priceUrl = (courseId) => `${getConfig().LMS_BASE_URL}/titaned/api/v2/course-price/${courseId}/`;
const validPrice = (value) => /^\d+$/.test(String(value).trim()) && Number(value) >= 1;

// A cleared date goes to Studio as null. The stock page sends '' (the certificate behaviour
// dropdown clears its date that way), and Studio's course details API in Verawood parses every
// date before saving and refuses '' ("Datetime has wrong format").
const DATE_FIELDS = ['startDate', 'endDate', 'enrollmentStart', 'enrollmentEnd', 'certificateAvailableDate'];
const saveCourseDetails = (courseId, details) =>
  updateCourseDetailsQuery(courseId, {
    ...details,
    ...Object.fromEntries(DATE_FIELDS.filter((name) => details[name] === '').map((name) => [name, null])),
  });

/** One card of the page; `id` is what the section bar jumps to. */
const DetailsCard = ({ id, children }) => (
  <div className="tels-course-details__card" id={id}>{children}</div>
);

DetailsCard.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

/**
 * The Pricing card: free or paid, and the price. The price lives in the LMS (the course's
 * honor mode), not in the course details, so it has its own request.
 */
const PricingCard = ({
  info, paid, value, onPaidChange, onChange, isEditable, showError,
}) => {
  const intl = useIntl();
  return (
    <section className="section-container tels-course-details__pricing">
      <header className="section-sub-header">
        <h2 className="lead">{intl.formatMessage(messages.pricingTitle)}</h2>
        <span className="small text-gray-700">{intl.formatMessage(messages.pricingHelp)}</span>
      </header>
      {info === false && <p className="text-danger mb-0">{intl.formatMessage(messages.priceLoadFailed)}</p>}
      {info && (
        <>
          <Form.Group className="mb-0">
            <Form.Label id="tels-details-pricing-label">{intl.formatMessage(messages.pricingModel)}</Form.Label>
            <Form.RadioSet
              name="tels-details-pricing"
              aria-labelledby="tels-details-pricing-label"
              value={paid ? 'paid' : 'free'}
              onChange={(event) => onPaidChange(event.target.value === 'paid')}
            >
              <Form.Radio value="free" disabled={!isEditable} description={intl.formatMessage(messages.pricingFreeHelp)}>
                {intl.formatMessage(messages.pricingFree)}
              </Form.Radio>
              <Form.Radio value="paid" disabled={!isEditable} description={intl.formatMessage(messages.pricingPaidHelp)}>
                {intl.formatMessage(messages.pricingPaid)}
              </Form.Radio>
            </Form.RadioSet>
          </Form.Group>
          {paid && (
            <Form.Group className="mb-0 mt-3 tels-course-details__price" isInvalid={showError && !validPrice(value)}>
              <Form.Label>
                {intl.formatMessage(messages.price, { currency: `${(info.currency || '').toUpperCase()} ${info.symbol || ''}`.trim() })}
              </Form.Label>
              <Form.Control
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={value}
                disabled={!isEditable}
                onChange={(event) => onChange(event.target.value)}
              />
              {showError && !validPrice(value)
                ? <Form.Control.Feedback type="invalid" hasIcon={false}>{intl.formatMessage(messages.priceInvalid)}</Form.Control.Feedback>
                : <Form.Text>{intl.formatMessage(messages.priceHelp)}</Form.Text>}
            </Form.Group>
          )}
          {paid && !info.selling && (
            <p className="tels-course-details__note mt-3 mb-0">{intl.formatMessage(messages.priceNotSelling)}</p>
          )}
        </>
      )}
    </section>
  );
};

PricingCard.propTypes = {
  info: PropTypes.oneOfType([PropTypes.bool, PropTypes.shape({
    price: PropTypes.number, currency: PropTypes.string, symbol: PropTypes.string, selling: PropTypes.bool,
  })]),
  paid: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  onPaidChange: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  isEditable: PropTypes.bool.isRequired,
  showError: PropTypes.bool.isRequired,
};

PricingCard.defaultProps = {
  info: null,
};

const CustomScheduleAndDetails = ({ courseId }) => {
  const intl = useIntl();
  const courseSettings = useSelector(getCourseSettings);
  const courseDetails = useSelector(getCourseDetails);
  const savingStatus = useSelector(getSavingStatus);
  const loadingDetailsStatus = useSelector(getLoadingDetailsStatus);
  const loadingSettingsStatus = useSelector(getLoadingSettingsStatus);
  const siteFeatures = useSiteFeatures();

  const {
    isLoading: isLoadingUserPermissions,
    canViewScheduleAndDetails,
    canEditSchedule,
    canEditDetails,
  } = useCourseUserPermissions(courseId, getScheduleAndDetailsPermissions(courseId));

  const isLoading = loadingDetailsStatus === RequestStatus.IN_PROGRESS
    || loadingSettingsStatus === RequestStatus.IN_PROGRESS
    || isLoadingUserPermissions;

  const {
    platformName,
    isCreditCourse,
    upgradeDeadline,
    languageOptions,
    marketingEnabled,
    licensingEnabled,
    aboutPageEditable,
    courseDisplayName,
    sidebarHtmlEnabled,
    lmsLinkForAboutPage,
    enrollmentEndEditable,
    isEntranceExamsEnabled,
    creditEligibilityEnabled,
    shortDescriptionEditable,
    enableExtendedCourseDetails,
    isPrerequisiteCoursesEnabled,
    mfeProctoredExamSettingsUrl,
    possiblePreRequisiteCourses,
    canShowCertificateAvailableDateField,
  } = courseSettings || {};

  const {
    errorFields,
    editedValues,
    isQueryPending,
    showModifiedAlert,
    showSuccessfulAlert,
    showFailedAlert,
    handleResetValues,
    handleValuesChange,
    handleUpdateValues,
    handleQueryProcessing,
    handleInternetConnectionFailed,
  } = useSaveValuesPrompt(
    courseId,
    saveCourseDetails,
    canShowCertificateAvailableDateField,
    courseDetails,
  );

  useScrollToHashElement({ isLoading });

  // ---- price (Ecommerce feature only) ----
  const showPricing = Boolean(siteFeatures.ecommerce);
  const [priceInfo, setPriceInfo] = useState(null); // null: loading, false: failed
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('');
  const [priceStatus, setPriceStatus] = useState('idle'); // idle | saving | failed
  const [triedToSave, setTriedToSave] = useState(false);

  useEffect(() => {
    if (!showPricing) { return undefined; }
    let mounted = true;
    getAuthenticatedHttpClient().get(priceUrl(courseId))
      .then(({ data }) => {
        if (mounted) {
          setPriceInfo(data);
          setIsPaid(Boolean(data.price));
          setPrice(data.price ? String(data.price) : '');
        }
      })
      .catch(() => { if (mounted) { setPriceInfo(false); } });
    return () => { mounted = false; };
  }, [courseId, showPricing]);

  const savedPrice = priceInfo && priceInfo.price ? String(priceInfo.price) : '';
  // What would be stored: nothing for a free course.
  const wantedPrice = isPaid ? String(price).trim() : '';
  const priceDirty = showPricing && Boolean(priceInfo) && (isPaid !== Boolean(savedPrice) || wantedPrice !== savedPrice);
  const priceInvalid = priceDirty && isPaid && !validPrice(price);

  const hasErrors = Object.keys(errorFields || {}).length > 0 || priceInvalid;
  const canEdit = canEditSchedule || canEditDetails;
  const isSaving = isQueryPending || priceStatus === 'saving';
  const isDirty = showModifiedAlert || priceDirty;

  // One click, one request per thing that changed. (The page used to wait for a component to
  // mount before it sent anything, sent it twice, and showed no result.)
  const handleSave = useCallback(() => {
    setTriedToSave(true);
    if (hasErrors) { return; }
    if (showModifiedAlert) {
      handleUpdateValues();
      handleQueryProcessing();
    }
    if (priceDirty) {
      setPriceStatus('saving');
      getAuthenticatedHttpClient().put(priceUrl(courseId), { price: wantedPrice || 0 })
        .then(({ data }) => {
          setPriceInfo(data);
          setIsPaid(Boolean(data.price));
          setPrice(data.price ? String(data.price) : '');
          setPriceStatus('idle');
          setTriedToSave(false);
        })
        .catch(() => setPriceStatus('failed'));
    }
  }, [hasErrors, showModifiedAlert, priceDirty, wantedPrice, courseId, handleUpdateValues, handleQueryProcessing]);

  const handleCancel = useCallback(() => {
    handleResetValues();
    setIsPaid(Boolean(savedPrice));
    setPrice(savedPrice);
    setPriceStatus('idle');
    setTriedToSave(false);
  }, [handleResetValues, savedPrice]);

  // The result is shown at the top of the page: bring it into view.
  useEffect(() => {
    if (showSuccessfulAlert || showFailedAlert || priceStatus === 'failed') {
      const top = document.querySelector('.tels-course-details__alerts');
      if (top) { top.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }
  }, [showSuccessfulAlert, showFailedAlert, priceStatus]);

  // Leaving with unsaved changes asks first.
  useEffect(() => {
    if (!isDirty) { return undefined; }
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; }; // eslint-disable-line no-param-reassign
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const showCreditSection = Boolean(creditEligibilityEnabled && isCreditCourse);
  const showRequirementsSection = Boolean(aboutPageEditable || isPrerequisiteCoursesEnabled || isEntranceExamsEnabled);

  const sections = useMemo(() => [
    ['details-basics', messages.navBasics, true],
    ['details-credit', messages.navCredit, showCreditSection],
    ['details-pacing', messages.navPacing, true],
    ['details-schedule', messages.navSchedule, true],
    ['details-language', messages.navDetails, Boolean(aboutPageEditable)],
    ['details-introducing', messages.navIntroducing, true],
    ['details-outcomes', messages.navOutcomes, Boolean(enableExtendedCourseDetails)],
    ['details-instructors', messages.navInstructors, Boolean(enableExtendedCourseDetails)],
    ['details-requirements', messages.navRequirements, showRequirementsSection],
    ['details-pricing', messages.navPricing, showPricing],
    ['details-license', messages.navLicense, Boolean(licensingEnabled)],
  ].filter(([, , shown]) => shown), [
    showCreditSection, aboutPageEditable, enableExtendedCourseDetails, showRequirementsSection, showPricing,
    licensingEnabled,
  ]);

  if (isLoading || !courseSettings || !courseDetails) {
    return null;
  }
  if (!canViewScheduleAndDetails) {
    return <PermissionDeniedAlert />;
  }

  const {
    org,
    courseId: courseNumber,
    run,
    title,
    effort,
    endDate,
    license,
    language,
    subtitle,
    duration,
    selfPaced,
    startDate,
    introVideo,
    description,
    learningInfo,
    enrollmentEnd,
    instructorInfo,
    enrollmentStart,
    shortDescription,
    preRequisiteCourses,
    entranceExamEnabled,
    courseImageAssetPath,
    bannerImageAssetPath,
    certificateAvailableDate,
    entranceExamMinimumScorePct,
    certificatesDisplayBehavior,
    videoThumbnailImageAssetPath,
  } = editedValues;
  // The two editors keep their own text: giving them the edited value again on every key
  // press would move the cursor (as upstream).
  const { overview: initialOverview, aboutSidebarHtml: initialAboutSidebarHtml } = courseDetails;

  let status = intl.formatMessage(messages.unsaved);
  if (isSaving) { status = intl.formatMessage(messages.saving); }
  if (triedToSave && hasErrors) { status = intl.formatMessage(messages.fixErrors); }

  return (
    <div className="tels-course-details">
      <header className="tels-course-details__header">
        <div>
          <h2 className="tels-course-details__title">{intl.formatMessage(stockMessages.headingTitle)}</h2>
          <p className="tels-course-details__lead">{intl.formatMessage(messages.lead)}</p>
        </div>
        {lmsLinkForAboutPage && (
          <Button as={Hyperlink} destination={lmsLinkForAboutPage} target="_blank" variant="outline-primary" iconAfter={Launch} showLaunchIcon={false}>
            {intl.formatMessage(messages.viewAbout)}
          </Button>
        )}
      </header>

      <div className="tels-course-details__alerts">
        <AlertMessage
          show={showSuccessfulAlert && !isSaving && priceStatus !== 'failed'}
          variant="success"
          icon={CheckCircleIcon}
          title={intl.formatMessage(stockMessages.alertSuccess)}
          role="status"
        />
        <AlertMessage
          show={showFailedAlert}
          variant="danger"
          icon={ErrorOutlineIcon}
          title={intl.formatMessage(stockMessages.alertFail)}
          role="alert"
        />
        <AlertMessage
          show={priceStatus === 'failed'}
          variant="danger"
          icon={ErrorOutlineIcon}
          title={intl.formatMessage(messages.priceSaveFailed)}
          role="alert"
        />
      </div>

      <nav className="tels-course-details__nav" aria-label={intl.formatMessage(messages.navLabel)}>
        {sections.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="tels-course-details__nav-link">{intl.formatMessage(label)}</a>
        ))}
      </nav>

      <div className="tels-course-details__layout">
        <div className="tels-course-details__main">
          <DetailsCard id="details-basics">
            <BasicSection
              org={org}
              courseNumber={courseNumber}
              run={run}
              lmsLinkForAboutPage={lmsLinkForAboutPage}
              marketingEnabled={marketingEnabled}
              courseDisplayName={courseDisplayName}
              platformName={platformName}
            />
          </DetailsCard>
          {showCreditSection && (
            <DetailsCard id="details-credit">
              <CreditSection creditRequirements={courseSettings?.creditRequirements} />
            </DetailsCard>
          )}
          <DetailsCard id="details-pacing">
            <PacingSection
              selfPaced={selfPaced}
              startDate={startDate}
              isEditable={canEditDetails}
              onChange={handleValuesChange}
            />
          </DetailsCard>
          <DetailsCard id="details-schedule">
            <ScheduleSection
              endDate={endDate}
              startDate={startDate}
              errorFields={errorFields}
              platformName={platformName}
              enrollmentEnd={enrollmentEnd}
              enrollmentStart={enrollmentStart}
              upgradeDeadline={upgradeDeadline}
              enrollmentEndEditable={enrollmentEndEditable}
              certificateAvailableDate={certificateAvailableDate}
              certificatesDisplayBehavior={certificatesDisplayBehavior}
              canShowCertificateAvailableDateField={canShowCertificateAvailableDateField}
              isEditable={canEditSchedule}
              onChange={handleValuesChange}
            />
          </DetailsCard>
          {aboutPageEditable && (
            <DetailsCard id="details-language">
              <DetailsSection
                language={language}
                languageOptions={languageOptions}
                isEditable={canEditDetails}
                onChange={handleValuesChange}
              />
            </DetailsCard>
          )}
          <DetailsCard id="details-introducing">
            <IntroducingSection
              title={title}
              overview={initialOverview}
              duration={duration}
              subtitle={subtitle}
              introVideo={introVideo}
              description={description}
              aboutSidebarHtml={initialAboutSidebarHtml}
              shortDescription={shortDescription}
              aboutPageEditable={aboutPageEditable}
              sidebarHtmlEnabled={sidebarHtmlEnabled}
              lmsLinkForAboutPage={lmsLinkForAboutPage}
              courseImageAssetPath={courseImageAssetPath}
              bannerImageAssetPath={bannerImageAssetPath}
              shortDescriptionEditable={shortDescriptionEditable}
              enableExtendedCourseDetails={enableExtendedCourseDetails}
              videoThumbnailImageAssetPath={videoThumbnailImageAssetPath}
              isEditable={canEditDetails}
              onChange={handleValuesChange}
            />
          </DetailsCard>
          {enableExtendedCourseDetails && (
            <>
              <DetailsCard id="details-outcomes">
                <LearningOutcomesSection
                  learningInfo={learningInfo}
                  isEditable={canEditDetails}
                  onChange={handleValuesChange}
                />
              </DetailsCard>
              <DetailsCard id="details-instructors">
                <InstructorsSection
                  instructors={instructorInfo?.instructors}
                  isEditable={canEditDetails}
                  onChange={handleValuesChange}
                />
              </DetailsCard>
            </>
          )}
          {showRequirementsSection && (
            <DetailsCard id="details-requirements">
              <RequirementsSection
                effort={effort}
                errorFields={errorFields}
                aboutPageEditable={aboutPageEditable}
                entranceExamEnabled={entranceExamEnabled}
                preRequisiteCourses={preRequisiteCourses}
                isEntranceExamsEnabled={isEntranceExamsEnabled}
                possiblePreRequisiteCourses={possiblePreRequisiteCourses}
                entranceExamMinimumScorePct={entranceExamMinimumScorePct}
                isPrerequisiteCoursesEnabled={isPrerequisiteCoursesEnabled}
                isEditable={canEditDetails}
                onChange={handleValuesChange}
              />
            </DetailsCard>
          )}
          {showPricing && (
            <DetailsCard id="details-pricing">
              <PricingCard
                info={priceInfo}
                paid={isPaid}
                value={price}
                onPaidChange={setIsPaid}
                onChange={setPrice}
                isEditable={Boolean(canEditDetails)}
                showError={triedToSave}
              />
            </DetailsCard>
          )}
          {licensingEnabled && (
            <DetailsCard id="details-license">
              <LicenseSection
                license={license}
                isEditable={canEditDetails}
                onChange={handleValuesChange}
              />
            </DetailsCard>
          )}
        </div>
        <aside className="tels-course-details__aside">
          <ScheduleSidebar courseId={courseId} proctoredExamSettingsUrl={mfeProctoredExamSettingsUrl} />
        </aside>
      </div>

      {isDirty && (
        <div className="tels-course-details__actions" role="region" aria-label={intl.formatMessage(stockMessages.alertWarning)}>
          <p className={`tels-course-details__status${triedToSave && hasErrors ? ' is-error' : ''}`} role="status">{status}</p>
          <Button variant="tertiary" onClick={handleCancel} disabled={isSaving}>
            {intl.formatMessage(stockMessages.buttonCancelText)}
          </Button>
          <StatefulButton
            onClick={handleSave}
            disabled={!canEdit}
            state={isSaving ? STATEFUL_BUTTON_STATES.pending : STATEFUL_BUTTON_STATES.default}
            labels={{
              default: intl.formatMessage(stockMessages.buttonSaveText),
              pending: intl.formatMessage(stockMessages.buttonSavingText),
            }}
            disabledStates={[STATEFUL_BUTTON_STATES.pending]}
          />
        </div>
      )}

      <div className="alert-toast">
        <InternetConnectionAlert
          isFailed={savingStatus === RequestStatus.FAILED}
          isQueryPending={isQueryPending}
          onInternetConnectionFailed={handleInternetConnectionFailed}
        />
      </div>
    </div>
  );
};

CustomScheduleAndDetails.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CustomScheduleAndDetails;
