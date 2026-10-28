/*
 * Course → Schedule & Details, in the look of the "Create new course" form.
 *
 * Every field is one of the stock sections of src/schedule-and-details (basic, credit, pacing,
 * schedule, details, introducing, learning outcomes, instructors, requirements, licence), so
 * nothing the stock page can do is lost: permissions, validation, image uploads, the entrance
 * exam and prerequisites all work as upstream. This file adds the layout (cards, a section
 * bar, the save prompt of the other settings pages), one save request with clear feedback, and the Pricing
 * card, which only exists on a site that has the Ecommerce feature.
 *
 * Rendered through the plugin slot `schedule_and_details_plugin_slot` (env.config.jsx); the
 * stock page around it loads the course details and settings into the store.
 */
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  Button, Form, Hyperlink, StatefulButton,
} from '@openedx/paragon';
import {
  CheckCircle as CheckCircleIcon, ErrorOutline as ErrorOutlineIcon, Launch, Warning as WarningIcon,
} from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';

import AlertMessage from './generic/alert-message';
import InternetConnectionAlert from './generic/internet-connection-alert';
import PermissionDeniedAlert from './generic/PermissionDeniedAlert';
import { RequestStatus } from './data/constants';
import { STATEFUL_BUTTON_STATES } from './constants';
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
import { isValidIntroVideo } from './schedule-and-details/introducing-section/introduction-video/youtube';
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

// The page scrolls inside the shell's content column (.main-content). An #anchor jump or
// scrollIntoView() would also scroll <html>, whose `overflow: hidden` only hides its scroll bar:
// the header went off the top and a blank strip showed at the bottom. Only the column scrolls.
const scrollBehavior = () => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

const scrollColumnTo = (element, offset = 0, behavior = scrollBehavior()) => {
  const column = element.closest('.main-content');
  if (!column) {
    element.scrollIntoView({ behavior, block: 'start' });
    return;
  }
  const top = element.getBoundingClientRect().top - column.getBoundingClientRect().top + column.scrollTop - offset;
  column.scrollTo({ top: Math.max(0, top), behavior });
};

// Space kept between the pinned section bar and a card it jumps to.
const JUMP_GAP = 16;

// The section named in the address (…/details#details-schedule) until the page has jumped to it.
// Kept outside the component: the stock page drops the hash through the router, which mounts
// this page again.
const pendingSection = { id: '' };

/** One card of the page; `id` is what the section bar jumps to. */
const DetailsCard = ({ id, children }) => (
  <div className="tels-course-details__card" id={id} tabIndex={-1}>{children}</div>
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

  const introVideoInvalid = !isValidIntroVideo(editedValues?.introVideo);
  const hasErrors = Object.keys(errorFields || {}).length > 0 || priceInvalid || introVideoInvalid;
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
      if (top) { scrollColumnTo(top, JUMP_GAP); }
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

  // ---- section bar: pinned above the cards, marks the section in view ----
  const isReady = !isLoading && Boolean(courseSettings && courseDetails) && Boolean(canViewScheduleAndDetails);
  const navRef = useRef(null);
  const [activeSection, setActiveSection] = useState(null);
  // After a click the clicked section stays marked until the author scrolls: the last cards
  // can be too short to reach the top of the column.
  const clickedSection = useRef(null);

  // The bar covers the top of the column only while it is pinned (not on phones).
  const navOffset = () => {
    const nav = navRef.current;
    return (nav && window.getComputedStyle(nav).position === 'sticky' ? nav.offsetHeight : 0) + JUMP_GAP;
  };

  const jumpTo = useCallback((id) => {
    const card = document.getElementById(id);
    if (!card) { return; }
    clickedSection.current = id;
    setActiveSection(id);
    scrollColumnTo(card, navOffset());
    card.focus({ preventScroll: true });
    window.history.replaceState(window.history.state, '', `#${id}`);
  }, []);

  // A link to a section opens at that section. The stock page around this one scrolls to the
  // hash too (scrollIntoView, then drops the hash) right after this page mounts: the jump comes
  // after the stock one. Images and editors above the section load later and push it down, so
  // it is kept in place while the page grows, until the author scrolls or for a few seconds.
  useState(() => {
    if (window.location.hash.length > 1) { pendingSection.id = window.location.hash.substring(1); }
  });
  useEffect(() => {
    const { id } = pendingSection;
    if (!isReady || !id || !sections.some(([sectionId]) => sectionId === id)) { return undefined; }
    const root = navRef.current && navRef.current.closest('.tels-course-details');
    const keepInPlace = new ResizeObserver(() => {
      const card = document.getElementById(id);
      if (card && clickedSection.current === id) { scrollColumnTo(card, navOffset(), 'auto'); }
    });
    const start = window.setTimeout(() => {
      pendingSection.id = '';
      jumpTo(id);
      if (root) { keepInPlace.observe(root); }
    }, 0);
    const stop = window.setTimeout(() => keepInPlace.disconnect(), 5000);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(stop);
      keepInPlace.disconnect();
    };
  }, [isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const nav = navRef.current;
    const column = nav && nav.closest('.main-content');
    if (!isReady || !column) { return undefined; }
    const root = nav.closest('.tels-course-details');
    let frame = 0;
    const update = () => {
      frame = 0;
      if (clickedSection.current) { return; }
      const line = column.getBoundingClientRect().top + navOffset() + 1;
      let current = sections[0][0];
      sections.forEach(([id]) => {
        const card = document.getElementById(id);
        if (card && card.getBoundingClientRect().top <= line) { current = id; }
      });
      setActiveSection(current);
    };
    const onScroll = () => { if (!frame) { frame = window.requestAnimationFrame(update); } };
    const release = () => { clickedSection.current = null; };
    // The sticky case card sits under the bar, whatever height the bar wraps to.
    const resize = new ResizeObserver(() => root.style.setProperty('--tels-cd-nav-height', `${nav.offsetHeight}px`));
    resize.observe(nav);
    column.addEventListener('scroll', onScroll, { passive: true });
    ['wheel', 'touchstart', 'keydown'].forEach((name) => column.addEventListener(name, release, { passive: true }));
    update();
    return () => {
      resize.disconnect();
      column.removeEventListener('scroll', onScroll);
      ['wheel', 'touchstart', 'keydown'].forEach((name) => column.removeEventListener(name, release));
      if (frame) { window.cancelAnimationFrame(frame); }
    };
  }, [isReady, sections]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const showErrors = triedToSave && hasErrors;

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

      <nav className="tels-course-details__nav" ref={navRef} aria-label={intl.formatMessage(messages.navLabel)}>
        {sections.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            // `nav-link`: the theme leaves these out of its link colour rule.
            className={`nav-link tels-course-details__nav-link${activeSection === id ? ' is-active' : ''}`}
            aria-current={activeSection === id ? 'location' : undefined}
            onClick={(event) => { event.preventDefault(); jumpTo(id); }}
          >
            {intl.formatMessage(label)}
          </a>
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

      {/* The same save prompt as the Grading and Advanced settings pages. */}
      <div className="alert-toast">
        <InternetConnectionAlert
          isFailed={savingStatus === RequestStatus.FAILED}
          isQueryPending={isQueryPending}
          onInternetConnectionFailed={handleInternetConnectionFailed}
        />
        <AlertMessage
          show={isDirty}
          aria-hidden={!isDirty}
          aria-labelledby={intl.formatMessage(stockMessages.alertWarningAriaLabelledby)}
          aria-describedby={intl.formatMessage(stockMessages.alertWarningAriaDescribedby)}
          role="dialog"
          actions={[
            !isSaving && (
              <Button key="cancel-button" variant="tertiary" onClick={handleCancel}>
                {intl.formatMessage(stockMessages.buttonCancelText)}
              </Button>
            ),
            <StatefulButton
              key="save-button"
              onClick={handleSave}
              disabled={!canEdit}
              state={isSaving ? STATEFUL_BUTTON_STATES.pending : STATEFUL_BUTTON_STATES.default}
              labels={{
                default: intl.formatMessage(stockMessages.buttonSaveText),
                pending: intl.formatMessage(stockMessages.buttonSavingText),
              }}
              disabledStates={[STATEFUL_BUTTON_STATES.pending]}
            />,
          ].filter(Boolean)}
          variant="warning"
          icon={WarningIcon}
          title={intl.formatMessage(showErrors ? stockMessages.alertWarningOnSaveWithError : stockMessages.alertWarning)}
          description={intl.formatMessage(showErrors
            ? stockMessages.alertWarningDescriptionsOnSaveWithError
            : stockMessages.alertWarningDescriptions)}
        />
      </div>
    </div>
  );
};

CustomScheduleAndDetails.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CustomScheduleAndDetails;
