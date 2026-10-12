import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import createCourseMessages from './createCourseMessages';
import './AIButton.scss';
import Aibutton from './ai.png';

const AIButton = ({ disabled, onClick, fieldName, fieldValue }) => {
  const intl = useIntl();
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(fieldName, fieldValue)}
      className="ai-button ml-2 p-0"
      aria-label={intl.formatMessage(createCourseMessages.aiButtonLabel)}
    >
      <img
        src={Aibutton}
        alt="AI"
        className="ai-button-icon"
      />
    </button>
  );
};

AIButton.propTypes = {
  disabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  fieldName: PropTypes.string.isRequired,
  fieldValue: PropTypes.any.isRequired,
};

export default AIButton;
