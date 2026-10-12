/* eslint-disable no-lonely-if */
/* eslint-disable consistent-return */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */
import { useState, useEffect, useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import PropTypes from 'prop-types';
import {
  Container,
  Form,
  Row,
  Col,
  Button,
  Stack,
  Icon,
  Image,
  // RadioButton,
  Dropdown,
  Nav,
} from '@openedx/paragon';
import {
  Calendar,
  Money,
  More,
  Add,
  Close,
  InfoOutline,
  Warning,
  CheckCircle,
  Photo,
  LmsOutline,
  Face3,
} from '@openedx/paragon/icons';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import { DatepickerControl, DATEPICKER_TYPES } from '../../generic/datepicker-control';
import './PSCourseForm.scss';
import messages from './messages';
import createCourseMessages from './createCourseMessages';
import a11yMessages from '../../generic/a11y-messages';
import IntroductionVideo from '../../schedule-and-details/introducing-section/introduction-video/CustomIntroductionVideo';
// import { getStudioHomeData } from '../data/selectors';
import { useCreateOrRerunCourse } from '../../generic/create-or-rerun-course/hooks';
import { fetchStudioHomeData } from '../data/thunks';
// import { fetchCourseAppSettings } from '../../advanced-settings/data/thunks';
import { videoTranscriptLanguages } from '../../editors/data/constants/video';
import { LICENSE_TYPE } from '../../schedule-and-details/license-section/constants';
import { useLicenseDetails } from '../../schedule-and-details/license-section/hooks';
import LicenseSelector from '../../schedule-and-details/license-section/license-selector';
import LicenseCommonsOptions from '../../schedule-and-details/license-section/license-commons-options';
import LicenseIcons from '../../schedule-and-details/license-section/license-icons';
import licenseMessages from '../../schedule-and-details/license-section/messages';
import CustomTypeaheadDropdown from '../../editors/sharedComponents/CustomTypeaheadDropdown';
import AlertMessage from '../../generic/alert-message';
import CertificateDisplayRow from '../../schedule-and-details/schedule-section/certificate-display-row/CertificateDisplayRow';
import ModalNotification from '../../generic/modal-notification';
import LearningOutcomesSection from '../../schedule-and-details/learning-outcomes-section';
import InstructorsSection from '../../schedule-and-details/instructors-section';
import { WysiwygEditor } from '../../generic/WysiwygEditor';
import AIButton from './AIButton';
import Copilot from '../../copilot/Copilot';
import { CopilotProvider, useCopilot } from '../../copilot/CopilotContext';

// const BASE_API_URL = 'https://gingery-xerographic-willette.ngrok-free.dev/'; // AI service base URL

// Utility function to get user's timezone string
function getUserTimezoneString() {
  const date = new Date();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const pad = n => String(Math.floor(Math.abs(n))).padStart(2, '0');
  const hours = pad(offset / 60);
  const minutes = pad(offset % 60);
  return `${tz} GMT${sign}${hours}:${minutes}`;
}

// Utility function to validate if a string is a valid image URL
const isValidImageUrl = (url) => {
  return (
    typeof url === 'string' &&
    (url.match(/\.(jpeg|jpg|png|gif|webp|bmp|svg)(?=\?|$)/i) ||
      url.match(/^https?:\/\/(www\.)?picsum\.photos\/.+/i))
  );
};

const PSCourseForm = ({
  children,
  hideGeneralTab = false,
  hideTitleField = false,
  hideCreateNewCourseButton = false,
  onImageUpload,
  onBannerImageUpload,
  onRemoveImage,
  onFieldChange,
  possiblePreRequisiteCourses = [],
  cardImagePreview,
  bannerImagePreview,
  hasCardImage,
  hasBannerImage,
  cardImageFile,
  bannerImageFile,
  isImageUploading,
  uploadProgress,
  imageErrors = {},
  editedValues,
  handleValuesChange,
  allowedImageTypes = ['image/jpeg', 'image/png'],
  onSubmit,
  onImageValidationErrorChange,
  onResetForm,
  scheduleSettings = false,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // copilotcode
  const {
    isOpen,
    title,
    shortDescription,
    description,
    cardImage,
    bannerImage,
    introVideo,
    updateTitle,
    updateShortDescription,
    updateDescription,
    updateCardImage,
    updateBannerImage,
    updateIntroVideo,
    handleAIButtonClick,
    aiLoading,
    showCopilotIcon,
    openCopilotReview,
    enabledCopilot,
  } = useCopilot();

  useEffect(() => {
    if (title && title !== editedValues.title) {
      handleInputChange('title', title);
    }
  }, [title, editedValues.title]);

  useEffect(() => {
    if (shortDescription && shortDescription !== editedValues.shortDescription) {
      handleInputChange('shortDescription', shortDescription);
    }
  }, [shortDescription, editedValues.shortDescription]);

  useEffect(() => {
    if (description && description !== editedValues.description) {
      handleInputChange('description', description);
    }
  }, [description, editedValues.description]);

  useEffect(() => {
    if (cardImage && cardImage !== editedValues.courseImageAssetPath) {
      console.log('Updating courseImageAssetPath with:', cardImage);
      handleInputChange('courseImageAssetPath', cardImage);
      // Simulate image upload to ensure preview updates
      if (isValidImageUrl(cardImage)) {
        handleValuesChange?.(cardImage, 'courseImageAssetPath');
        onFieldChange?.(cardImage, 'courseImageAssetPath');
      }
    }
  }, [cardImage, editedValues.courseImageAssetPath]);

  useEffect(() => {
    if (bannerImage && bannerImage !== editedValues.bannerImageAssetPath) {
      console.log('Updating bannerImageAssetPath with:', bannerImage);
      handleInputChange('bannerImageAssetPath', bannerImage);
      if (isValidImageUrl(bannerImage)) {
        handleValuesChange?.(bannerImage, 'bannerImageAssetPath');
        onFieldChange?.(bannerImage, 'bannerImageAssetPath');
      }
    }
  }, [bannerImage, editedValues.bannerImageAssetPath]);
  useEffect(() => {
    if (introVideo && introVideo !== editedValues.introVideo) {
      console.log('Updating introVideo with:', introVideo);
      handleInputChange('introVideo', introVideo);
      handleValuesChange?.(introVideo, 'introVideo');
      onFieldChange?.(introVideo, 'introVideo');
    }
  }, [introVideo, editedValues.introVideo]);

  // Auto-scroll and highlight any field updated by Copilot
  useEffect(() => {
    // Helper to find the closest form group or section for a field
    const scrollToField = (fieldName, valueFromCopilot, currentFormValue) => {
      // Only trigger if Copilot just set a new non-empty value
      if (!valueFromCopilot || valueFromCopilot.trim() === '' || valueFromCopilot === currentFormValue) {
        return;
      }

      let targetElement = null;

      switch (fieldName) {
        case 'title':
        case 'shortDescription':
        case 'description':
          // These are in .title-section
          targetElement = document.querySelector('.title-section');
          break;

        case 'courseImageAssetPath':
          // Card image upload section
          targetElement = document.querySelector('.custom-image-upload-section-ps-form:nth-of-type(1)');
          break;

        case 'bannerImageAssetPath':
          // Banner image upload section
          targetElement = document.querySelector('.custom-image-upload-section-ps-form:nth-of-type(2)');
          break;

        case 'introVideo':
          // Introduction video section (last form group in media-section)
          targetElement = document.querySelector('.media-section .form-group:last-child')
            || document.querySelector('.introduction-video')
            || document.querySelector('.embed-video-container');
          break;

        default:
          return;
      }

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });

        // Gentle highlight feedback
        targetElement.style.transition = 'background-color 1.5s ease';
        targetElement.style.backgroundColor = 'var(--pgn-color-primary-light)'; // highlight (design token)
        targetElement.style.borderRadius = '8px';
        targetElement.style.padding = '4px'; // small padding for visual pop

        setTimeout(() => {
          targetElement.style.backgroundColor = '';
          targetElement.style.padding = '';
        }, 2000);
      }
    };

    // Check each Copilot field
    scrollToField('title', title, editedValues.title);
    scrollToField('shortDescription', shortDescription, editedValues.shortDescription);
    scrollToField('description', description, editedValues.description);
    scrollToField('courseImageAssetPath', cardImage, editedValues.courseImageAssetPath);
    scrollToField('bannerImageAssetPath', bannerImage, editedValues.bannerImageAssetPath);
    scrollToField('introVideo', introVideo, editedValues.introVideo);
  }, [
    title,
    shortDescription,
    description,
    cardImage,
    bannerImage,
    introVideo,
    editedValues.title,
    editedValues.shortDescription,
    editedValues.description,
    editedValues.courseImageAssetPath,
    editedValues.bannerImageAssetPath,
    editedValues.introVideo,
  ]);
  // end

  //   const { allowedOrganizations } = useSelector(getStudioHomeData);
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        // const response = await getAuthenticatedHttpClient().get(`${getConfig().STUDIO_BASE_URL}/organizations`);
        const response = await getAuthenticatedHttpClient().get(
          `${getConfig().STUDIO_BASE_URL}/titaned/api/v1/menu-config/`,
        );
        console.log('allowedOrganizations response', response);
        // Transform the response to match the expected format
        const organizations = response.data || [];
        setAllowedOrganizations(organizations?.allowed_organizations_for_courses);
        setCanCreateNewOrganization(organizations?.can_create_organizations);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setAllowedOrganizations([]);
        setCanCreateNewOrganization(false);
      }
      console.log('allowedOrganizations', allowedOrganizations);
      console.log('canCreateNewOrganization', canCreateNewOrganization);
    };

    fetchOrganizations();
  }, []);

  const initialValues = {
    title: '',
    shortDescription: '',
    description: '',
    organization: '',
    courseNumber: '',
    courseRun: '',
    coursePacing: 'instructor',
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    enrollmentStart: null,
    enrollmentStartTime: null,
    enrollmentEnd: null,
    enrollmentEndTime: null,
    pricingModel: 'free',
    price: '',
    language: 'en',
    duration: '',
    invitationOnly: false,
    cardImage: null,
    bannerImage: null,
    introVideo: null,
    prerequisites: '',
    license: null,
    learningInfo: [],
    instructorInfo: { instructors: [] },
    overview: '',
    courseImageAssetPath: '',
    bannerImageAssetPath: '',
  };

  const [activeTab, setActiveTab] = useState(hideGeneralTab ? 'schedule' : 'general');
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [allowedOrganizations, setAllowedOrganizations] = useState([]);
  const [canCreateNewOrganization, setCanCreateNewOrganization] = useState(false);

  const {
    licenseURL,
    licenseType,
    licenseDetails,
    handleToggleCheckbox,
    handleChangeLicenseType,
  } = useLicenseDetails(editedValues?.license || null, (value, field) => handleInputChange(field, value));

  const userTimezone = useMemo(getUserTimezoneString, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchStudioHomeData());
      } catch (error) {
        console.error('Error loading studio home data:', error);
      }
    };

    loadData();
  }, [dispatch]);

  // The fetched advanced settings were not used by this form (and it was called without a courseId).
  // useEffect(() => {
  //   // Only make API calls for new UI to prevent infinite calls in old UI
  //   if (localStorage.getItem('oldUI') !== 'true') {
  //     dispatch(fetchCourseAppSettings());
  //   }
  // }, [dispatch]);
  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert]);

  const {
    organizations: createOrRerunOrganizations,
  } = useCreateOrRerunCourse(initialValues);

  console.log('createOrRerunOrganizations', createOrRerunOrganizations);

  useEffect(() => {
    if (typeof onImageValidationErrorChange === 'function') {
      const hasError = !!imageErrors.cardImage || !!imageErrors.bannerImage;
      onImageValidationErrorChange(hasError);
    }
  }, [imageErrors, onImageValidationErrorChange]);

  // Validate form when editedValues change (e.g., when form loads with existing data)
  useEffect(() => {
    if (editedValues && Object.keys(editedValues).length > 0) {
      const fieldErrors = validateForm();
      setErrors(fieldErrors);
    }
  }, [editedValues]);

  const handleInputChange = (field, value) => {
    const hasChanged = value !== editedValues[field];

    if (hasChanged) {
      if (handleValuesChange) {
        handleValuesChange(value, field);
      }

      if (onFieldChange) {
        onFieldChange(value, field);
      }
      // New: Update CopilotContext title when form title changes
      if (field === 'title') {
        updateTitle(value);
      } else if (field === 'shortDescription') {
        updateShortDescription(value);
      } else if (field === 'description') {
        updateDescription(value);
      } else if (field === 'courseImageAssetPath') {
        updateCardImage(value);
      } else if (field === 'bannerImageAssetPath') {
        updateBannerImage(value);
      } else if (field === 'introVideo') {
        updateIntroVideo(value);
      }
    }

    setTouched(prev => ({ ...prev, [field]: true }));

    // Validate the specific field and related fields
    const fieldErrors = validateForm();

    // If start date changes, also validate end date
    if (field === 'startDate' && editedValues.endDate) {
      const startDate = new Date(value);
      const endDate = new Date(editedValues.endDate);

      if (endDate < startDate) {
        fieldErrors.endDate = intl.formatMessage(messages.courseEndDateCannotBeEarlierThan);
      } else {
        // Clear endDate error if dates are now valid
        delete fieldErrors.endDate;
      }
    }

    // If end date changes, validate against start date
    if (field === 'endDate' && editedValues.startDate) {
      const startDate = new Date(editedValues.startDate);
      const endDate = new Date(value);

      if (endDate < startDate) {
        fieldErrors.endDate = intl.formatMessage(messages.courseEndDateCannotBeEarlierThan);
      } else {
        // Clear endDate error if dates are now valid
        delete fieldErrors.endDate;
      }
    }

    // If start date changes, validate against enrollment start date
    if (field === 'startDate' && editedValues.enrollmentStart) {
      const startDate = new Date(value);
      const enrollmentStartDate = new Date(editedValues.enrollmentStart);

      if (startDate <= enrollmentStartDate) {
        fieldErrors.startDate = intl.formatMessage(messages.courseStartDateMustBeLaterThan);
        setTouched(prev => ({ ...prev, startDate: true }));
      } else {
        // Clear startDate error if dates are now valid
        delete fieldErrors.startDate;
      }
    }

    // If enrollment start date changes, validate against start date
    if (field === 'enrollmentStart' && editedValues.startDate) {
      const startDate = new Date(editedValues.startDate);
      const enrollmentStartDate = new Date(value);

      if (startDate <= enrollmentStartDate) {
        fieldErrors.startDate = intl.formatMessage(messages.courseStartDateMustBeLaterThan);
        setTouched(prev => ({ ...prev, startDate: true }));
      } else {
        // Clear startDate error if dates are now valid
        delete fieldErrors.startDate;
      }
    }

    // If enrollment start date changes, validate against enrollment end date
    if (field === 'enrollmentStart' && editedValues.enrollmentEnd) {
      const enrollmentStartDate = new Date(value);
      const enrollmentEndDate = new Date(editedValues.enrollmentEnd);

      if (enrollmentStartDate > enrollmentEndDate) {
        fieldErrors.enrollmentStart = intl.formatMessage(messages.enrollmentStartDateCannotBeLaterThan);
        setTouched(prev => ({ ...prev, enrollmentStart: true }));
      } else if (enrollmentEndDate < enrollmentStartDate) {
        fieldErrors.enrollmentEnd = intl.formatMessage(messages.enrollmentEndDateCannotBeEarlierThan);
        setTouched(prev => ({ ...prev, enrollmentEnd: true }));
      } else {
        // Clear both errors if dates are now valid
        delete fieldErrors.enrollmentStart;
        delete fieldErrors.enrollmentEnd;
      }
    }

    // If enrollment end date changes, validate against enrollment start date
    if (field === 'enrollmentEnd' && editedValues.enrollmentStart) {
      const enrollmentStartDate = new Date(editedValues.enrollmentStart);
      const enrollmentEndDate = new Date(value);

      if (enrollmentStartDate > enrollmentEndDate) {
        fieldErrors.enrollmentStart = intl.formatMessage(messages.enrollmentStartDateCannotBeLaterThan);
        setTouched(prev => ({ ...prev, enrollmentStart: true }));
      } else if (enrollmentEndDate < enrollmentStartDate) {
        fieldErrors.enrollmentEnd = intl.formatMessage(messages.enrollmentEndDateCannotBeEarlierThan);
        setTouched(prev => ({ ...prev, enrollmentEnd: true }));
      } else {
        // Clear both errors if dates are now valid
        delete fieldErrors.enrollmentStart;
        delete fieldErrors.enrollmentEnd;
      }
    }

    // If enrollment end date changes, validate against course start date
    if (field === 'enrollmentEnd' && editedValues.startDate) {
      const enrollmentEndDate = new Date(value);
      const courseStartDate = new Date(editedValues.startDate);

      if (enrollmentEndDate < courseStartDate) {
        fieldErrors.enrollmentEnd = intl.formatMessage(messages.enrollmentEndDateCannotBeEarlierThan2);
        setTouched(prev => ({ ...prev, enrollmentEnd: true }));
      } else {
        // Clear enrollmentEnd error if dates are now valid
        delete fieldErrors.enrollmentEnd;
      }
    }

    // If enrollment end date changes, validate against course end date
    if (field === 'enrollmentEnd' && editedValues.endDate) {
      const enrollmentEndDate = new Date(value);
      const courseEndDate = new Date(editedValues.endDate);

      if (enrollmentEndDate > courseEndDate) {
        fieldErrors.enrollmentEnd = intl.formatMessage(messages.enrollmentEndDateCannotBeLaterThan);
        setTouched(prev => ({ ...prev, enrollmentEnd: true }));
      } else {
        // Clear enrollmentEnd error if dates are now valid
        delete fieldErrors.enrollmentEnd;
      }
    }

    // If course start date changes, validate against enrollment end date
    if (field === 'startDate' && editedValues.enrollmentEnd) {
      const courseStartDate = new Date(value);
      const enrollmentEndDate = new Date(editedValues.enrollmentEnd);

      if (enrollmentEndDate < courseStartDate) {
        fieldErrors.enrollmentEnd = intl.formatMessage(messages.enrollmentEndDateCannotBeEarlierThan2);
        setTouched(prev => ({ ...prev, enrollmentEnd: true }));
      } else {
        // Clear enrollmentEnd error if dates are now valid
        delete fieldErrors.enrollmentEnd;
      }
    }

    // If course end date changes, validate against enrollment end date
    if (field === 'endDate' && editedValues.enrollmentEnd) {
      const courseEndDate = new Date(value);
      const enrollmentEndDate = new Date(editedValues.enrollmentEnd);

      if (enrollmentEndDate > courseEndDate) {
        fieldErrors.enrollmentEnd = intl.formatMessage(messages.enrollmentEndDateCannotBeLaterThan);
        setTouched(prev => ({ ...prev, enrollmentEnd: true }));
      } else {
        // Clear enrollmentEnd error if dates are now valid
        delete fieldErrors.enrollmentEnd;
      }
    }

    // Update errors for the changed field and any related fields
    Object.keys(fieldErrors).forEach(errorField => {
      if (fieldErrors[errorField]) {
        setErrors(prev => ({
          ...prev,
          [errorField]: fieldErrors[errorField],
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[errorField];
          return newErrors;
        });
      }
    });
  };

  const handleCertificateChange = (value, field) => {
    handleInputChange(field, value);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    // validateForm();
    /* Custom error messages */
    const fieldErrors = validateForm();
    if (fieldErrors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: fieldErrors[field],
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    /* Custom error messages */
  };

  const transformFormDataToApiPayload = (formData) => {
    // Convert date objects to ISO strings if they exist
    const formatDate = (date) => {
      if (!date) { return null; }
      return new Date(date).toISOString();
    };

    return {
      display_name: formData.title || '',
      org: formData.organization || '',
      number: formData.courseNumber || '',
      run: formData.courseRun || '',
      start_date: formatDate(formData.startDate),
      end_date: formatDate(formData.endDate),
      enrollment_start: formatDate(formData.enrollmentStart),
      enrollment_end: formatDate(formData.enrollmentEnd),
      title: formData.title || '',
      description: formData.description || '',
      short_description: formData.shortDescription || '',
      subtitle: '',
      duration: formData.duration || '',
      intro_video: formData.introVideo || 'None',
      course_image_name: formData.cardImage?.name || '',
      course_image_asset_path: formData.cardImageAssetPath || '',
      banner_image_name: formData.bannerImage?.name || '',
      banner_image_asset_path: formData.bannerImageAssetPath || '',
      video_thumbnail_image_name: formData.cardImage?.name || '',
      video_thumbnail_image_asset_path: formData.cardImageAssetPath || '',
      self_paced: formData.coursePacing === 'self',
      effort: formData.effort || 'None',
      pre_requisite_courses: formData.prerequisiteCourse ? [formData.prerequisiteCourse] : [],
      entrance_exam_enabled: formData.entranceExamEnabled || 'false',
      entrance_exam_minimum_score_pct: formData.entranceExamMinimumScorePct?.toString() || '',
      language: formData.language || 'en',
      price: formData.pricingModel === 'paid' ? formData.price : '',
      amount: formData.pricingModel === 'paid' ? formData.price : '',
      license: formData.license || 'all-rights-reserved',
      overview: formData.overview || '',
      learning_info: formData.learningInfo || [],
      instructor_info: formData.instructorInfo || {},
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true); // Show loader and disable button
      setShowErrorModal(false); // Hide any previous error modals
      const apiPayload = transformFormDataToApiPayload(editedValues);
      console.log('API Payload:', apiPayload);
      const response = await getAuthenticatedHttpClient().post(
        `${getConfig().STUDIO_BASE_URL}/titaned/api/v1/create-course`,
        apiPayload,
      );
      // for local api fetch
      // const response = await getAuthenticatedHttpClient().post('STUDIO_API_DOMAIN/titaned/api/v1/create-course', apiPayload);

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(intl.formatMessage(messages.failedToCreateCoursePleaseTryAgain));
      }

      // Handle success response with new API format
      const responseData = response.data;
      if (responseData && responseData.success && responseData.url) {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        setShowSuccessAlert(true); // Show success alert

        // Navigate to the course URL from the API response
        setTimeout(() => {
          // Remove leading slash if present and construct full URL
          const courseUrl = responseData.url.startsWith('/') ? responseData.url.substring(1) : responseData.url;
          const fullCourseUrl = `${getConfig().STUDIO_BASE_URL}/${courseUrl}`;
          window.location.href = fullCourseUrl;
        }, 2000);
      } else {
        // Fallback to old behavior if response format is different
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        setShowSuccessAlert(true); // Show success alert

        // Redirect to /my-courses after 2 seconds
        setTimeout(() => {
          navigate('/my-courses');
        }, 2000);
      }

      if (typeof onSubmit === 'function') {
        onSubmit(editedValues);
      }
    } catch (error) {
      console.error('Error submitting form:', error);

      // Set error message based on the type of error
      let errorMsg = intl.formatMessage(messages.failedToCreateCoursePleaseTryAgain);
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 400 || error.response.status === 403 || error.response.status === 500) {
          // For 400, 403, and 500, prioritize backend error message
          if (error.response.data && error.response.data.message) {
            errorMsg = error.response.data.message;
          } else if (error.response.data && error.response.data.error) {
            errorMsg = error.response.data.error;
          } else if (error.response.data && typeof error.response.data === 'string') {
            errorMsg = error.response.data;
          } else {
            // Fallback to default messages if no backend message
            if (error.response.status === 400) {
              errorMsg = intl.formatMessage(messages.badRequestPleaseCheckYourInputs);
            } else if (error.response.status === 403) {
              errorMsg = intl.formatMessage(messages.youDoNotHavePermissionToCreate);
            } else if (error.response.status === 500) {
              errorMsg = intl.formatMessage(messages.serverErrorPleaseTryAgainLater);
            }
          }
        } else if (error.response.status === 401) {
          errorMsg = intl.formatMessage(messages.authenticationFailedPleaseLogInAgain);
        } else if (error.response.status === 422) {
          errorMsg = intl.formatMessage(messages.invalidCourseDataPleaseCheckYourInputs);
        } else if (error.response.data && error.response.data.message) {
          errorMsg = error.response.data.message;
        }
      } else if (error.request) {
        // Network error
        errorMsg = intl.formatMessage(messages.networkErrorPleaseCheckYourConnectionAnd);
      } else if (error.message) {
        // Other error
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      setErrors((prev) => ({
        ...prev,
        submit: errorMsg,
      }));
    } finally {
      setIsSubmitting(false); // Hide loader and enable button
    }
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  const handleVideoChange = (value, field) => {
    handleInputChange(field, value);

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const languageOptions = useMemo(
    () =>
      Object.entries(videoTranscriptLanguages)
        .filter(([code]) => code !== 'placeholder')
        .map(([code, label]) => [code, label]),
    [],
  );

  const formattedLanguage = () => {
    const result = languageOptions.find((arr) => arr[0] === editedValues.language);
    return result ? result[1] : intl.formatMessage(messages.selectLanguage);
  };

  const renderImageUploadSection = (field, label, preview, file, hasImage, onUpload) => {
    const errorField = field === 'courseImageAssetPath' ? 'cardImage' : 'bannerImage';
    const error = imageErrors?.[errorField];

    // Added AIButton-related logic
    const isCardImage = field === 'courseImageAssetPath';

    let previewSrc = editedValues[field] || preview || '';
    const hasPreviewImage = isValidImageUrl(previewSrc);

    return (
      <Form.Group className="mb-4 custom-image-upload-section-ps-form">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Form.Label className="mb-0 d-flex justify-content-between align-items-center">
            {label}
            {showCopilotIcon && (
              <div className="aibutton">
                {aiLoading[isCardImage ? 'cardImage' : 'bannerImage'] ?
                  (
                    <span
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--primary)',
                        animation: 'pulse 1.5s infinite',
                      }}
                    >
                      {intl.formatMessage(messages.loading)}
                    </span>
                  ) :
                  (
                    <AIButton
                      disabled={!editedValues.description?.trim()}
                      onClick={enabledCopilot ? handleAIButtonClick : openCopilotReview}
                      fieldName={isCardImage ? 'cardImage' : 'bannerImage'}
                      fieldValue={editedValues.title || ''}
                    />
                  )}
              </div>
            )}
          </Form.Label>
        </div>
        <div
          className={`upload-box border rounded${error ? ' border-danger' : ''}`}
        >
          {hasPreviewImage ?
            (
              <div className="image-preview-container">
                <Image
                  src={previewSrc}
                  className="preview-image"
                  fluid
                />
                <Button
                  variant="icon"
                  className="remove-image-overlay"
                  onClick={() => {
                    onRemoveImage(field);
                    handleInputChange(field, ''); // Clear the field
                    if (isCardImage) { updateCardImage(''); }
                    else { updateBannerImage(''); }
                  }}
                  aria-label={`${intl.formatMessage(createCourseMessages.imageRemove)} ${label}`}
                >
                  <Icon src={Close} />
                </Button>
              </div>
            ) :
            (
              <div className="p-3 text-center">
                <div className="d-flex flex-column align-items-center">
                  <Icon
                    src={Photo}
                    className="mb-2"
                    style={{ fontSize: '2rem' }}
                  />
                  <Button
                    variant="outline-primary"
                    onClick={() => document.getElementById(`${field}Input`).click()}
                    disabled={isImageUploading}
                    className="mb-2"
                  >
                    <Icon src={Add} className="me-2" />
                    {isImageUploading
                      ? intl.formatMessage(messages.uploading)
                      : intl.formatMessage(messages.uploadImage)}
                  </Button>
                  <div className="font-12">{intl.formatMessage(messages.pleaseUploadAJpegOrPngImage)}</div>
                  <input
                    type="file"
                    id={`${field}Input`}
                    accept={allowedImageTypes.join(',')}
                    className="d-none"
                    onChange={(e) => onUpload(field, e)}
                  />
                  {isImageUploading && uploadProgress > 0 && (
                    <div className="progress mt-2 w-100">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${uploadProgress}%` }}
                        aria-valuenow={uploadProgress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        {uploadProgress}%
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="text-danger mt-2 d-flex align-items-center font-small">
                      <Icon src={Warning} className="me-1" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </Form.Group>
    );
  };

  const tabList = [
    !hideGeneralTab && { key: 'general', label: intl.formatMessage(messages.general), icon: InfoOutline },
    { key: 'schedule', label: intl.formatMessage(messages.schedule), icon: Calendar },
    { key: 'requirements', label: intl.formatMessage(messages.requirements), icon: InfoOutline },
    { key: 'additional', label: intl.formatMessage(messages.additional), icon: More },
    { key: 'pricing', label: intl.formatMessage(messages.pricing), icon: Money },
    { key: 'license', label: intl.formatMessage(messages.courseContentLicense), icon: InfoOutline },
    scheduleSettings &&
    { key: 'learningOutcomes', label: intl.formatMessage(messages.learningOutcomes), icon: LmsOutline },
    scheduleSettings && { key: 'instructors', label: intl.formatMessage(messages.instructors), icon: Face3 },
  ].filter(Boolean);

  const validateForm = () => {
    const newErrors = {};

    /* Custom error messages */
    // Validate Title field
    if (!editedValues.title || !editedValues.title.trim()) {
      newErrors.title = intl.formatMessage(messages.titleIsRequired);
    }
    // Validate shortDescription field
    if (!editedValues.shortDescription || !editedValues.shortDescription.trim()) {
      newErrors.shortDescription = intl.formatMessage(messages.shortDescriptionIsRequired);
    }
    // Validate Organization field
    if (!editedValues.organization || !editedValues.organization.trim()) {
      newErrors.organization = intl.formatMessage(messages.organizationIsRequired);
    }
    // Validate Course Number field
    if (!editedValues.courseNumber || !editedValues.courseNumber.trim()) {
      newErrors.courseNumber = intl.formatMessage(messages.courseNumberIsRequired);
    } else if (!/^[a-zA-Z0-9_-]+$/.test(editedValues.courseNumber.trim())) {
      newErrors.courseNumber = 'Course Number can only contain letters, numbers, underscores (_), and hyphens (-).';
    }
    // Validate Course Run field
    if (!editedValues.courseRun || !editedValues.courseRun.trim()) {
      newErrors.courseRun = intl.formatMessage(messages.courseRunIsRequired);
    } else if (!/^[a-zA-Z0-9_-]+$/.test(editedValues.courseRun.trim())) {
      newErrors.courseRun = 'Course Run can only contain letters, numbers, underscores (_), and hyphens (-).';
    }
    // Validate Course start date field
    if (!editedValues.startDate) {
      newErrors.startDate = intl.formatMessage(messages.courseStartDateIsRequired);
    }

    // Validate that end date is not earlier than start date (only if both dates are provided)
    if (editedValues.startDate && editedValues.endDate) {
      const startDate = new Date(editedValues.startDate);
      const endDate = new Date(editedValues.endDate);

      if (endDate < startDate) {
        newErrors.endDate = intl.formatMessage(messages.courseEndDateCannotBeEarlierThan);
      } else {
        // Clear endDate error if dates are now valid
        delete newErrors.endDate;
      }
    } else {
      // Clear endDate error if one of the dates is missing
      delete newErrors.endDate;
    }

    // Validate that course start date is later than enrollment start date (only if both dates are provided)
    if (editedValues.startDate && editedValues.enrollmentStart) {
      const startDate = new Date(editedValues.startDate);
      const enrollmentStartDate = new Date(editedValues.enrollmentStart);

      if (startDate <= enrollmentStartDate) {
        newErrors.startDate = intl.formatMessage(messages.courseStartDateMustBeLaterThan);
      } else {
        // Clear startDate error if dates are now valid
        delete newErrors.startDate;
      }
    }

    // Validate that enrollment start date is not later than enrollment end date (only if both dates are provided)
    if (editedValues.enrollmentStart && editedValues.enrollmentEnd) {
      const enrollmentStartDate = new Date(editedValues.enrollmentStart);
      const enrollmentEndDate = new Date(editedValues.enrollmentEnd);

      if (enrollmentStartDate > enrollmentEndDate) {
        newErrors.enrollmentStart = intl.formatMessage(messages.enrollmentStartDateCannotBeLaterThan);
      } else if (enrollmentEndDate < enrollmentStartDate) {
        newErrors.enrollmentEnd = intl.formatMessage(messages.enrollmentEndDateCannotBeEarlierThan);
      } else {
        // Clear both errors if dates are now valid
        delete newErrors.enrollmentStart;
        delete newErrors.enrollmentEnd;
      }
    }

    // Validate that enrollment end date is not earlier than course start date (only if both dates are provided)
    if (editedValues.enrollmentEnd && editedValues.startDate) {
      const enrollmentEndDate = new Date(editedValues.enrollmentEnd);
      const courseStartDate = new Date(editedValues.startDate);

      if (enrollmentEndDate < courseStartDate) {
        newErrors.enrollmentEnd = intl.formatMessage(messages.enrollmentEndDateCannotBeEarlierThan2);
      } else {
        // Clear enrollmentEnd error if dates are now valid
        delete newErrors.enrollmentEnd;
      }
    }

    // Validate that enrollment end date is not later than course end date (only if both dates are provided)
    if (editedValues.enrollmentEnd && editedValues.endDate) {
      const enrollmentEndDate = new Date(editedValues.enrollmentEnd);
      const courseEndDate = new Date(editedValues.endDate);

      if (enrollmentEndDate > courseEndDate) {
        newErrors.enrollmentEnd = intl.formatMessage(messages.enrollmentEndDateCannotBeLaterThan);
      } else {
        // Clear enrollmentEnd error if dates are now valid
        delete newErrors.enrollmentEnd;
      }
    }
    /* Custom error messages */
    setErrors(newErrors);
    // return Object.keys(newErrors).length === 0;
    return newErrors;
  };

  const handleCancel = () => {
    if (typeof onResetForm === 'function') {
      onResetForm();
    }
    setTouched({});
    setErrors({});
    navigate('/my-courses');
  };

  const handleLearningOutcomesChange = (learningInfo, field) => {
    handleInputChange(field, learningInfo);
  };

  const handleInstructorsChange = (instructorInfo, field) => {
    handleInputChange(field, instructorInfo);
  };

  const handleCustomBlurForDropdown = (e) => {
    const { value, name } = e.target;
    handleInputChange(name, value);
    handleBlur(name);
  };

  return (
    <div className="coursepage">
      <div className="ps-course-form">
        {showSuccessAlert && (
          <div className="alert-container mb-4">
            <AlertMessage
              variant="success"
              icon={CheckCircle}
              title={intl.formatMessage(messages.courseHasBeenCreatedSuccessfully)}
              className="success-alert"
              aria-hidden="true"
            />
          </div>
        )}

        <ModalNotification
          isOpen={showErrorModal}
          title={intl.formatMessage(messages.courseCreationFailed)}
          message={errorMessage}
          handleCancel={handleErrorModalClose}
          handleAction={handleErrorModalClose}
          cancelButtonText=""
          actionButtonText={intl.formatMessage(messages.ok)}
          variant="danger"
          icon={Warning}
        />
        <Container size="xl" className="px-0">
          <Row className="mx-0">
            <Col xs={12} className="px-0 pb-0">
              <Form className="course-form" onSubmit={handleSubmit}>
                <Row>
                  <Col xs={12} md={8} className="col-cs px-0 pr-md-3">
                    <div>
                      {children}
                    </div>
                    <div className="title-section">
                      {!hideTitleField && (
                        <Form.Group className="mb-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <Form.Label className="mb-0 d-flex justify-content-between align-items-center">
                              <>
                                {intl.formatMessage(messages.title)} <span className="required-asterisk">*</span>
                              </>
                              {showCopilotIcon && (
                                <div className="aibutton">
                                  {aiLoading.title ?
                                    (
                                      <span
                                        style={{
                                          fontSize: '0.875rem',
                                          color: 'var(--primary)',
                                          animation: 'pulse 1.5s infinite',
                                        }}
                                      >
                                        {intl.formatMessage(messages.loading)}
                                      </span>
                                    ) :
                                    (
                                      <AIButton
                                        disabled={!editedValues.title?.trim()}
                                        onClick={enabledCopilot ? handleAIButtonClick : openCopilotReview}
                                        fieldName="title"
                                        fieldValue={editedValues.title || ''}
                                      />
                                    )}
                                </div>
                              )}
                            </Form.Label>
                          </div>
                          <Form.Control
                            type="text"
                            name="title"
                            value={editedValues.title || ''}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            onBlur={() => handleBlur('title')}
                            isInvalid={!!errors.title && touched.title}
                          />
                          {errors.title && touched.title && (
                            <Form.Control.Feedback type="invalid">
                              {errors.title}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      )}
                      <Form.Group className="mb-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <Form.Label className="mb-0 d-flex justify-content-between align-items-center">
                            <>
                              {intl.formatMessage(messages.shortDescription)}{' '}
                              <span className="required-asterisk">*</span>
                            </>
                            {showCopilotIcon && (
                              <div className="aibutton">
                                {aiLoading.shortDescription ?
                                  (
                                    <span
                                      style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--primary)',
                                        animation: 'pulse 1.5s infinite',
                                      }}
                                    >
                                      {intl.formatMessage(messages.loading)}
                                    </span>
                                  ) :
                                  (
                                    <AIButton
                                      disabled={!editedValues.title?.trim()}
                                      onClick={enabledCopilot ? handleAIButtonClick : openCopilotReview}
                                      fieldName="shortDescription"
                                      fieldValue={editedValues.shortDescription || ''}
                                    />
                                  )}
                              </div>
                            )}
                          </Form.Label>
                        </div>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="shortDescription"
                          value={editedValues.shortDescription || ''}
                          onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                          onBlur={() => handleBlur('shortDescription')}
                          maxLength={150}
                          isInvalid={!!errors.shortDescription && touched.shortDescription}
                          className="short-description"
                        />
                        <Form.Text>{intl.formatMessage(messages.aShortDescriptionThatWillBeDisplayed)}</Form.Text>
                        {errors.shortDescription && touched.shortDescription && (
                          <Form.Control.Feedback type="invalid">
                            {errors.shortDescription}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>

                      <Form.Group className={scheduleSettings ? 'mb-1' : 'mb-3'}>
                        <div className="d-flex justify-content-between align-items-center">
                          <Form.Label className="mb-0 d-flex justify-content-between align-items-center">
                            <>{intl.formatMessage(messages.description)}</>
                            {showCopilotIcon && (
                              <div className="aibutton">
                                {aiLoading.description ?
                                  (
                                    <span
                                      style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--primary)',
                                        animation: 'pulse 1.5s infinite',
                                      }}
                                    >
                                      {intl.formatMessage(messages.loading)}
                                    </span>
                                  ) :
                                  (
                                    <AIButton
                                      disabled={!(editedValues.title?.trim() && editedValues.shortDescription?.trim())}
                                      onClick={enabledCopilot ? handleAIButtonClick : openCopilotReview}
                                      fieldName="description"
                                      fieldValue={editedValues.description || ''}
                                    />
                                  )}
                              </div>
                            )}
                          </Form.Label>
                        </div>
                        <Form.Control
                          as="textarea"
                          rows={8}
                          name="description"
                          value={editedValues.description || ''}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          onBlur={() => handleBlur('description')}
                          isInvalid={!!errors.description && touched.description}
                        />
                        {errors.description && touched.description && (
                          <Form.Control.Feedback type="invalid">
                            {errors.description}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>

                      {scheduleSettings && (
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <>{intl.formatMessage(messages.courseOverview)}</>
                          </Form.Label>
                          <WysiwygEditor
                            initialValue={editedValues.overview || ''}
                            onChange={(value) => handleInputChange('overview', value)}
                          />
                          <Form.Control.Feedback>
                            {intl.formatMessage(messages.provideADetailedOverviewOfYourCourse)}
                          </Form.Control.Feedback>
                        </Form.Group>
                      )}
                    </div>
                    <div className="options-container">
                      <Row>
                        <Col xs={12} md={3} className="sidebar">
                          <Nav className="nav-tabs flex-column border-0">
                            {tabList.map((tab) => (
                              <Nav.Item key={tab.key}>
                                <Nav.Link
                                  className={activeTab === tab.key ? 'active' : ''}
                                  onClick={() => {
                                    console.log('Edited Values:', editedValues);
                                    setActiveTab(tab.key);
                                  }}
                                >
                                  <Icon className="icon" src={tab.icon} />
                                  <span>{tab.label}</span>
                                </Nav.Link>
                              </Nav.Item>
                            ))}
                          </Nav>
                        </Col>

                        <Col xs={12} md={9} className="content-area">
                          {activeTab === 'general' && (
                            <div className="form-section">
                              <Stack>
                                <Row className="custom-padding">
                                  <Col xs={12} md={12}>
                                    <Form.Group>
                                      <Form.Label>
                                        <>
                                          {intl.formatMessage(messages.organization)}{' '}
                                          <span className="required-asterisk">*</span>
                                        </>
                                      </Form.Label>
                                      {canCreateNewOrganization ?
                                        (
                                          <CustomTypeaheadDropdown
                                            readOnly={false}
                                            name="organization"
                                            value={editedValues.organization || ''}
                                            controlClassName={errors.organization ? 'is-invalid' : ''}
                                            options={allowedOrganizations}
                                            placeholder={intl.formatMessage(messages.selectAnOrganization)}
                                            handleChange={(value) => handleInputChange('organization', value)}
                                            handleBlur={handleCustomBlurForDropdown}
                                            noOptionsMessage={intl.formatMessage(messages.noOrganizationsAvailable)}
                                            expandMoreAlt={intl.formatMessage(a11yMessages.expandMore)}
                                            expandLessAlt={intl.formatMessage(a11yMessages.expandLess)}
                                            required
                                          />
                                        ) :
                                        (
                                          <div className="read-only-organization-dropdown">
                                            <Dropdown>
                                              <Dropdown.Toggle
                                                id="organization-dropdown"
                                                variant="outline-primary"
                                                className={`form-control ${
                                                  errors.organization && touched.organization ? 'is-invalid' : ''
                                                }`}
                                                onBlur={() => handleBlur('organization')}
                                              >
                                                {editedValues.organization ||
                                                  intl.formatMessage(messages.selectAnOrganization)}
                                              </Dropdown.Toggle>
                                              <Dropdown.Menu>
                                                {allowedOrganizations && allowedOrganizations.length > 0 ?
                                                  (
                                                    allowedOrganizations.map((org) => (
                                                      <Dropdown.Item
                                                        key={org}
                                                        onClick={() => {
                                                          handleInputChange('organization', org);
                                                          handleBlur('organization');
                                                        }}
                                                      >
                                                        {org}
                                                      </Dropdown.Item>
                                                    ))
                                                  ) :
                                                  (
                                                    <Dropdown.Item disabled>
                                                      {intl.formatMessage(messages.noOrganizationsAvailable2)}
                                                    </Dropdown.Item>
                                                  )}
                                              </Dropdown.Menu>
                                            </Dropdown>
                                          </div>
                                        )}
                                      <Form.Text>
                                        {intl.formatMessage(messages.theNameOfTheOrganizationSponsoringThe)}
                                      </Form.Text>
                                      {errors.organization && touched.organization && (
                                        <Form.Control.Feedback type="invalid" className="d-block">
                                          {errors.organization}
                                        </Form.Control.Feedback>
                                      )}
                                    </Form.Group>
                                  </Col>
                                  <Col xs={12} md={12}>
                                    <Form.Group>
                                      <Form.Label>
                                        <>
                                          {intl.formatMessage(messages.courseNumber)}{' '}
                                          <span className="required-asterisk">*</span>
                                        </>
                                      </Form.Label>
                                      <Form.Control
                                        type="text"
                                        name="courseNumber"
                                        value={editedValues.courseNumber || ''}
                                        onChange={(e) => handleInputChange('courseNumber', e.target.value)}
                                        onBlur={() => handleBlur('courseNumber')}
                                        placeholder={intl.formatMessage(messages.eGCs101)}
                                        isInvalid={!!errors.courseNumber && touched.courseNumber}
                                        required
                                      />
                                      <Form.Text>
                                        {intl.formatMessage(messages.theUniqueNumberThatIdentifiesYourCourse)}
                                      </Form.Text>
                                      {errors.courseNumber && touched.courseNumber && (
                                        <Form.Control.Feedback type="invalid">
                                          {errors.courseNumber}
                                        </Form.Control.Feedback>
                                      )}
                                    </Form.Group>
                                  </Col>
                                </Row>
                                <Row className="pt-0 custom-padding">
                                  <Col xs={12} md={6}>
                                    <Form.Group>
                                      <Form.Label>
                                        <>
                                          {intl.formatMessage(messages.courseRun)}{' '}
                                          <span className="required-asterisk">*</span>
                                        </>
                                      </Form.Label>
                                      <Form.Control
                                        type="text"
                                        name="courseRun"
                                        value={editedValues.courseRun || ''}
                                        onChange={(e) => handleInputChange('courseRun', e.target.value)}
                                        onBlur={() => handleBlur('courseRun')}
                                        placeholder={intl.formatMessage(messages.eG2014T1)}
                                        isInvalid={!!errors.courseRun && touched.courseRun}
                                        required
                                      />
                                      <Form.Text>
                                        {intl.formatMessage(messages.theTermInWhichYourCourseWill)}
                                      </Form.Text>
                                      {errors.courseRun && touched.courseRun && (
                                        <Form.Control.Feedback type="invalid">
                                          {errors.courseRun}
                                        </Form.Control.Feedback>
                                      )}
                                    </Form.Group>
                                  </Col>
                                  <Col xs={12} md={6}>
                                    <Form.Group>
                                      <Form.Label>{intl.formatMessage(messages.coursePacing)}</Form.Label>
                                      <div className="pacing-style">
                                        <label>
                                          <input
                                            type="radio"
                                            name="coursePacing"
                                            value="instructor"
                                            checked={editedValues.coursePacing === 'instructor'}
                                            onChange={() => handleInputChange('coursePacing', 'instructor')}
                                          />
                                          {intl.formatMessage(messages.instructorPaced)}
                                        </label>
                                        <label>
                                          <input
                                            type="radio"
                                            name="coursePacing"
                                            value="self"
                                            checked={editedValues.coursePacing === 'self'}
                                            onChange={() => handleInputChange('coursePacing', 'self')}
                                          />
                                          {intl.formatMessage(messages.selfPaced)}
                                        </label>
                                      </div>
                                    </Form.Group>
                                  </Col>
                                </Row>
                              </Stack>
                            </div>
                          )}
                          {activeTab === 'schedule' && (
                            <div className="form-section">
                              <Stack gap={4}>
                                <div className="schedule-section">
                                  <ul className="schedule-date-list">
                                    <li className="schedule-date-item">
                                      <div>
                                        <Row className="pl-0 pr-0 pb-0 pt-0">
                                          <Col xs={12} md={6}>
                                            <div className="datepicker-control">
                                              <Form.Label>
                                                {intl.formatMessage(createCourseMessages.courseStartDate)} <span className="required-asterisk">*</span>
                                              </Form.Label>
                                              <DatepickerControl
                                                type={DATEPICKER_TYPES.date}
                                                value={editedValues.startDate || ''}
                                                label={null}
                                                helpText={intl.formatMessage(messages.enterTheDateWhenYourCourseWill)}
                                                isInvalid={!!errors.startDate && touched.startDate}
                                                controlName="start-date"
                                                onChange={(value) => handleInputChange('startDate', value)}
                                                onBlur={() => handleBlur('startDate')}
                                                placeholder={intl.formatMessage(messages.mmDdYyyy)}
                                              />
                                              {errors.startDate && touched.startDate && (
                                                <Form.Text className="text-danger">
                                                  {errors.startDate}
                                                </Form.Text>
                                              )}
                                            </div>
                                          </Col>
                                          <Col xs={12} md={6}>
                                            <div className="time-field">
                                              <Form.Label>{intl.formatMessage(messages.courseStartTime)}</Form.Label>
                                              <DatepickerControl
                                                type={DATEPICKER_TYPES.time}
                                                value={editedValues.startTime || ''}
                                                label={null}
                                                isInvalid={!!errors.startTime && touched.startTime}
                                                controlName="start-time"
                                                onChange={(value) => handleInputChange('startTime', value)}
                                                onBlur={() => handleBlur('startTime')}
                                              />
                                              <span className="h6 font-weight-normal text-gray-500 mb-0 mt-2">
                                                ({userTimezone})
                                              </span>
                                            </div>
                                          </Col>
                                        </Row>
                                      </div>
                                    </li>
                                    <li className="schedule-date-item">
                                      <div>
                                        <Row className="pl-0 pr-0 pb-0 pt-0">
                                          <Col xs={12} md={6}>
                                            <div className="datepicker-control">
                                              <Form.Label>{intl.formatMessage(messages.courseEndDate)}</Form.Label>
                                              <DatepickerControl
                                                type={DATEPICKER_TYPES.date}
                                                value={editedValues.endDate || ''}
                                                label={null}
                                                helpText={intl.formatMessage(messages.enterTheDateWhenYourCourseWill2)}
                                                isInvalid={!!errors.endDate}
                                                controlName="end-date"
                                                onChange={(value) => handleInputChange('endDate', value)}
                                                onBlur={() => handleBlur('endDate')}
                                                placeholder={intl.formatMessage(messages.mmDdYyyy)}
                                              />
                                              {errors.endDate && (
                                                <Form.Text className="text-danger">
                                                  {errors.endDate}
                                                </Form.Text>
                                              )}
                                            </div>
                                          </Col>
                                          <Col xs={12} md={6}>
                                            <div className="time-field">
                                              <Form.Label>{intl.formatMessage(messages.courseEndTime)}</Form.Label>
                                              <DatepickerControl
                                                type={DATEPICKER_TYPES.time}
                                                value={editedValues.endTime || ''}
                                                label={null}
                                                isInvalid={!!errors.endTime && touched.endTime}
                                                controlName="end-time"
                                                onChange={(value) => handleInputChange('endTime', value)}
                                                onBlur={() => handleBlur('endTime')}
                                              />
                                              <span className="h6 font-weight-normal text-gray-500 mb-0 mt-2">
                                                ({userTimezone})
                                              </span>
                                            </div>
                                          </Col>
                                        </Row>
                                      </div>
                                    </li>
                                    <li className="schedule-date-item">
                                      <div>
                                        <Row className="pl-0 pr-0 pb-0 pt-0">
                                          <Col xs={12} md={6}>
                                            <div className="datepicker-control">
                                              <Form.Label>
                                                {intl.formatMessage(createCourseMessages.enrollmentStartDate)}{' '}
                                                {/* <span className="required-asterisk">*</span> */}
                                              </Form.Label>
                                              <DatepickerControl
                                                type={DATEPICKER_TYPES.date}
                                                value={editedValues.enrollmentStart || ''}
                                                label={null}
                                                helpText={intl.formatMessage(
                                                  messages.enterTheDateWhenEnrollmentWillStart,
                                                )}
                                                isInvalid={!!errors.enrollmentStart && touched.enrollmentStart}
                                                controlName="enrollment-start-date"
                                                onChange={(value) => handleInputChange('enrollmentStart', value)}
                                                onBlur={() => handleBlur('enrollmentStart')}
                                                placeholder={intl.formatMessage(messages.mmDdYyyy)}
                                              />
                                              {errors.enrollmentStart && touched.enrollmentStart && (
                                                <Form.Text className="text-danger">
                                                  {errors.enrollmentStart}
                                                </Form.Text>
                                              )}
                                            </div>
                                          </Col>
                                          <Col xs={12} md={6}>
                                            <div className="time-field">
                                              <Form.Label>
                                                {intl.formatMessage(messages.enrollmentStartTime)}
                                              </Form.Label>
                                              <DatepickerControl
                                                type={DATEPICKER_TYPES.time}
                                                value={editedValues.enrollmentStartTime || ''}
                                                label={null}
                                                isInvalid={!!errors.enrollmentStartTime && touched.enrollmentStartTime}
                                                controlName="enrollment-start-time"
                                                onChange={(value) => handleInputChange('enrollmentStartTime', value)}
                                                onBlur={() => handleBlur('enrollmentStartTime')}
                                              />
                                              <span className="h6 font-weight-normal text-gray-500 mb-0 mt-2">
                                                ({userTimezone})
                                              </span>
                                            </div>
                                          </Col>
                                        </Row>
                                      </div>
                                    </li>
                                    <li className="schedule-date-item">
                                      <div>
                                        <Row className="pl-0 pr-0 pb-0 pt-0">
                                          <Col xs={12} md={6}>
                                            <div className="datepicker-control">
                                              <Form.Label>{intl.formatMessage(messages.enrollmentEndDate)}</Form.Label>
                                              <DatepickerControl
                                                type={DATEPICKER_TYPES.date}
                                                value={editedValues.enrollmentEnd || ''}
                                                label={null}
                                                helpText={intl.formatMessage(
                                                  messages.enterTheDateWhenEnrollmentWillEnd,
                                                )}
                                                isInvalid={!!errors.enrollmentEnd && touched.enrollmentEnd}
                                                controlName="enrollment-end-date"
                                                onChange={(value) => handleInputChange('enrollmentEnd', value)}
                                                onBlur={() => handleBlur('enrollmentEnd')}
                                                placeholder={intl.formatMessage(messages.mmDdYyyy)}
                                              />
                                              {errors.enrollmentEnd && touched.enrollmentEnd && (
                                                <Form.Text className="text-danger">
                                                  {errors.enrollmentEnd}
                                                </Form.Text>
                                              )}
                                            </div>
                                          </Col>
                                          <Col xs={12} md={6}>
                                            <div className="time-field">
                                              <Form.Label>{intl.formatMessage(messages.enrollmentEndTime)}</Form.Label>
                                              <DatepickerControl
                                                type={DATEPICKER_TYPES.time}
                                                value={editedValues.enrollmentEndTime || ''}
                                                label={null}
                                                isInvalid={!!errors.enrollmentEndTime && touched.enrollmentEndTime}
                                                controlName="enrollment-end-time"
                                                onChange={(value) => handleInputChange('enrollmentEndTime', value)}
                                                onBlur={() => handleBlur('enrollmentEndTime')}
                                              />
                                              <span className="h6 font-weight-normal text-gray-500 mb-0 mt-2">
                                                ({userTimezone})
                                              </span>
                                            </div>
                                          </Col>
                                        </Row>
                                      </div>
                                    </li>
                                    <li className="certificate-display-row">
                                      <CertificateDisplayRow
                                        certificateAvailableDate={editedValues.certificateAvailableDate || ''}
                                        availableDateErrorFeedback={errors.certificateAvailableDate || ''}
                                        certificatesDisplayBehavior={editedValues.certificatesDisplayBehavior || ''}
                                        displayBehaviorErrorFeedback={errors.certificatesDisplayBehavior || ''}
                                        onChange={handleCertificateChange}
                                      />
                                    </li>
                                  </ul>
                                </div>
                              </Stack>
                            </div>
                          )}
                          {activeTab === 'requirements' && (
                            <div className="form-section">
                              <Stack gap={2}>
                                <Row className="custom-padding">
                                  <Col xs={12} md={6}>
                                    <Form.Group>
                                      <Form.Label>{intl.formatMessage(messages.hoursOfEffortPerWeek)}</Form.Label>
                                      <Form.Control
                                        type="text"
                                        name="effort"
                                        value={editedValues.effort || ''}
                                        onChange={(e) => handleInputChange('effort', e.target.value)}
                                        onBlur={() => handleBlur('effort')}
                                        isInvalid={!!errors.effort && touched.effort}
                                      />
                                      <Form.Text>{intl.formatMessage(messages.timeSpentOnAllCourseWork)}</Form.Text>
                                    </Form.Group>
                                  </Col>
                                  <Col xs={12} md={6}>
                                    <Form.Group>
                                      <Form.Label>{intl.formatMessage(messages.prerequisiteCourse)}</Form.Label>
                                      <Dropdown>
                                        <Dropdown.Toggle id="prerequisiteDropdown" variant="outline-primary">
                                          {editedValues.prerequisiteCourse || intl.formatMessage(messages.none)}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                          <Dropdown.Item
                                            key="None"
                                            onClick={() => handleInputChange('prerequisiteCourse', '')}
                                          >
                                            {intl.formatMessage(messages.none)}
                                          </Dropdown.Item>
                                          {possiblePreRequisiteCourses?.map((course) => (
                                            <Dropdown.Item
                                              key={course.courseKey}
                                              onClick={() => handleInputChange('prerequisiteCourse', course.courseKey)}
                                            >
                                              {course.displayName}
                                            </Dropdown.Item>
                                          ))}
                                        </Dropdown.Menu>
                                      </Dropdown>
                                      <Form.Text>
                                        {intl.formatMessage(messages.courseThatStudentsMustCompleteBeforeBeginning)}
                                      </Form.Text>
                                    </Form.Group>
                                  </Col>
                                </Row>
                                <Form.Group className="entrance-exam-group">
                                  <div className="entrance-exam-label mb-2">
                                    {intl.formatMessage(messages.entranceExam)}
                                  </div>
                                  <div className="entrance-exam-card">
                                    <div className="pb-2">
                                      <Form.Check
                                        type="checkbox"
                                        className="entrance-exam-checkbox"
                                        label={
                                          <span className="entrance-exam-checkbox-label">
                                            {intl.formatMessage(messages.requireStudentsToPassAnExamBefore)}
                                          </span>
                                        }
                                        checked={editedValues.entranceExamEnabled === 'true'}
                                        onChange={(e) =>
                                          handleInputChange('entranceExamEnabled', e.target.checked ? 'true' : 'false')}
                                      />
                                    </div>
                                    {editedValues.entranceExamEnabled === 'true' && (
                                      <div className="entrance-exam-content p-1">
                                        <div className="form-group-custom">
                                          <Form.Label>{intl.formatMessage(messages.gradeRequirements)}</Form.Label>
                                          <div className="d-flex">
                                            <Form.Control
                                              type="number"
                                              min={0}
                                              max={100}
                                              className=""
                                              value={editedValues.entranceExamMinimumScorePct || 40}
                                              onChange={(e) =>
                                                handleInputChange('entranceExamMinimumScorePct', e.target.value)}
                                              onBlur={() => handleBlur('entranceExamMinimumScorePct')}
                                            />
                                            <span className="pgn__form-control-trailing">%</span>
                                          </div>
                                          <div className="form-control-feedback">
                                            {intl.formatMessage(messages.theScoreStudentMustMeetInOrder)}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </Form.Group>
                              </Stack>
                            </div>
                          )}
                          {activeTab === 'additional' && (
                            <div className="form-section pl-12-pr-12">
                              <Stack gap={1}>
                                <Form.Group className="form-group-custom dropdown-language">
                                  <Form.Label>{intl.formatMessage(messages.language)}</Form.Label>
                                  <Dropdown className="bg-white">
                                    <Dropdown.Toggle variant="outline-primary" id="languageDropdown">
                                      {formattedLanguage()}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                      {languageOptions.map((option) => (
                                        <Dropdown.Item
                                          key={option[0]}
                                          onClick={() => handleInputChange('language', option[0])}
                                        >
                                          {option[1]}
                                        </Dropdown.Item>
                                      ))}
                                    </Dropdown.Menu>
                                  </Dropdown>
                                  <Form.Control.Feedback>
                                    {intl.formatMessage(messages.thePrimaryLanguageOfYourCourse)}
                                  </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group>
                                  <Form.Label>{intl.formatMessage(messages.duration)}</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="duration"
                                    value={editedValues.duration || ''}
                                    onChange={(e) => handleInputChange('duration', e.target.value)}
                                    onBlur={() => handleBlur('duration')}
                                    placeholder={intl.formatMessage(messages.eG8Weeks)}
                                    isInvalid={!!errors.duration && touched.duration}
                                  />
                                  <Form.Text>
                                    {intl.formatMessage(messages.theExpectedDurationOfYourCourse)}
                                  </Form.Text>
                                </Form.Group>
                              </Stack>
                            </div>
                          )}
                          {activeTab === 'pricing' && (
                            <div className="form-section pl-12-pr-12">
                              <Stack gap={1}>
                                <Form.Group>
                                  <Form.Label>{intl.formatMessage(messages.pricingModel)}</Form.Label>
                                  <div className="d-flex radio-button-options">
                                    <Form.Radio
                                      name="pricingModel"
                                      value="free"
                                      checked={editedValues.pricingModel === 'free'}
                                      onChange={() => handleInputChange('pricingModel', 'free')}
                                    >
                                      {intl.formatMessage(messages.free)}
                                    </Form.Radio>
                                    <Form.Radio
                                      name="pricingModel"
                                      value="paid"
                                      checked={editedValues.pricingModel === 'paid'}
                                      onChange={() => handleInputChange('pricingModel', 'paid')}
                                    >
                                      {intl.formatMessage(messages.paid)}
                                    </Form.Radio>
                                  </div>
                                  <Form.Text className="mt-1">
                                    {intl.formatMessage(messages.chooseWhetherYourCourseWillBeFree)}
                                  </Form.Text>
                                </Form.Group>

                                {editedValues.pricingModel === 'paid' && (
                                  <Form.Group>
                                    <Form.Label>{intl.formatMessage(messages.price)}</Form.Label>
                                    <Form.Control
                                      type="number"
                                      value={editedValues.price}
                                      onChange={(e) => handleInputChange('price', e.target.value)}
                                      onBlur={() => handleBlur('price')}
                                      placeholder={intl.formatMessage(messages.enterCoursePrice)}
                                      min="0"
                                      step="0.01"
                                    />
                                    <Form.Text>{intl.formatMessage(messages.setThePriceForYourCourseIn)}</Form.Text>
                                  </Form.Group>
                                )}
                              </Stack>
                            </div>
                          )}
                          {activeTab === 'license' && (
                            <div className="form-section license-section pl-12-pr-12">
                              <Stack gap={1}>
                                <div>
                                  <p className="mb-8">{intl.formatMessage(licenseMessages.licenseDescription)}</p>
                                </div>
                                <LicenseSelector
                                  licenseType={licenseType}
                                  onChangeLicenseType={handleChangeLicenseType}
                                />
                                {licenseType === LICENSE_TYPE.creativeCommons && (
                                  <LicenseCommonsOptions
                                    licenseDetails={licenseDetails}
                                    onToggleCheckbox={handleToggleCheckbox}
                                  />
                                )}
                                <div>
                                  <p className="fw-bold mb-1">{intl.formatMessage(messages.licenseDisplay)}</p>
                                  <p className="small text-gray-700 mb-2">
                                    {intl.formatMessage(messages.theFollowingMessageWillBeDisplayedAt)}
                                  </p>
                                  <LicenseIcons
                                    licenseType={licenseType}
                                    licenseDetails={licenseDetails}
                                    licenseURL={licenseURL}
                                  />
                                </div>
                              </Stack>
                            </div>
                          )}
                          {activeTab === 'learningOutcomes' && (
                            <div className="form-section learning-outcomes-section pl-12-pr-12">
                              <LearningOutcomesSection
                                learningInfo={editedValues.learningInfo || []}
                                onChange={handleLearningOutcomesChange}
                              />
                            </div>
                          )}
                          {activeTab === 'instructors' && (
                            <div className="form-section instructors-section pl-12-pr-12">
                              <InstructorsSection
                                instructors={editedValues.instructorInfo?.instructors || []}
                                onChange={handleInstructorsChange}
                              />
                            </div>
                          )}
                        </Col>
                      </Row>
                    </div>
                  </Col>

                  <Col xs={12} md={4} className="px-0 pl-md-3">
                    <div className="media-section">
                      <Stack gap={1}>
                        {renderImageUploadSection(
                          'courseImageAssetPath',
                          intl.formatMessage(messages.courseCardImage),
                          cardImagePreview,
                          cardImageFile,
                          hasCardImage,
                          onImageUpload,
                        )}
                        {renderImageUploadSection(
                          'bannerImageAssetPath',
                          intl.formatMessage(messages.courseBannerImage),
                          bannerImagePreview,
                          bannerImageFile,
                          hasBannerImage,
                          onBannerImageUpload,
                        )}
                        <Form.Group>
                          <IntroductionVideo
                            intl={intl}
                            introVideo={editedValues.introVideo}
                            onChange={(value) => handleVideoChange(value, 'introVideo')}
                            editedValues={editedValues}
                          />
                        </Form.Group>
                      </Stack>
                    </div>
                  </Col>
                </Row>

                {!hideCreateNewCourseButton && (
                  <div className="ps-courseform-footer-bar">
                    <div className="footer-cancel">
                      <Button variant="outline-primary" onClick={handleCancel}>
                        {intl.formatMessage(messages.cancel)}
                      </Button>
                    </div>
                    <div className="footer-create">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting
                          || Object.keys(errors).length > 0
                          || !!imageErrors.cardImage
                          || !!imageErrors.bannerImage}
                      >
                        {isSubmitting ?
                          (
                            <span>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              />
                              {intl.formatMessage(messages.creating)}
                            </span>
                          ) :
                          (
                            intl.formatMessage(messages.create)
                          )}
                      </Button>
                    </div>
                  </div>
                )}
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="copilot">
        {isOpen && <Copilot />}
      </div>
    </div>
  );
};

PSCourseForm.propTypes = {
  children: PropTypes.node,
  hideGeneralTab: PropTypes.bool,
  hideTitleField: PropTypes.bool,
  hideCreateNewCourseButton: PropTypes.bool,
  onImageUpload: PropTypes.func.isRequired,
  onBannerImageUpload: PropTypes.func.isRequired,
  onRemoveImage: PropTypes.func.isRequired,
  onFieldChange: PropTypes.func,
  possiblePreRequisiteCourses: PropTypes.array,
  cardImagePreview: PropTypes.string,
  bannerImagePreview: PropTypes.string,
  hasCardImage: PropTypes.bool,
  hasBannerImage: PropTypes.bool,
  cardImageFile: PropTypes.object,
  bannerImageFile: PropTypes.object,
  isImageUploading: PropTypes.bool,
  uploadProgress: PropTypes.number,
  imageErrors: PropTypes.object,
  editedValues: PropTypes.object.isRequired,
  handleValuesChange: PropTypes.func.isRequired,
  allowedImageTypes: PropTypes.array,
  onSubmit: PropTypes.func,
  onImageValidationErrorChange: PropTypes.func,
  onResetForm: PropTypes.func,
  scheduleSettings: PropTypes.bool,
  courseSettings: PropTypes.object,
};

PSCourseForm.defaultProps = {
  children: null,
  hideGeneralTab: false,
  hideTitleField: false,
  hideCreateNewCourseButton: false,
  onFieldChange: () => {},
  cardImagePreview: '',
  bannerImagePreview: '',
  hasCardImage: false,
  hasBannerImage: false,
  cardImageFile: null,
  bannerImageFile: null,
  isImageUploading: false,
  uploadProgress: 0,
  imageErrors: {},
  possiblePreRequisiteCourses: [],
  allowedImageTypes: ['image/jpeg', 'image/png'],
  onSubmit: undefined,
  onImageValidationErrorChange: () => {},
  onResetForm: () => {},
  scheduleSettings: false,
  courseSettings: {},
};

export default (props) => (
  <CopilotProvider initialConfig={{ width: 350, height: 83, position: 'right' }}>
    <PSCourseForm {...props} />
  </CopilotProvider>
);
