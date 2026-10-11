import PropTypes from 'prop-types';
import { Card } from '@openedx/paragon';
import './MetricCard.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SUPPORTED_ICON_CLASSES } from '../constants';

const MetricCard = ({
  icon, value, label, index,
}) => {
  // Define colors based on card position/index
  const getCardStyle = (cardIndex) => {
    const colors = [
      { background: 'var(--pgn-color-danger-100, var(--pgn-color-light-200))', iconBg: 'var(--pgn-color-danger-base)' }, // Pink
      { background: 'var(--pgn-color-warning-100, var(--pgn-color-light-200))', iconBg: 'var(--pgn-color-warning-base)' }, // Yellow
      { background: 'var(--pgn-color-success-100, var(--pgn-color-light-200))', iconBg: 'var(--pgn-color-success-base)' }, // Green
      { background: 'var(--pgn-color-info-100, var(--pgn-color-light-200))', iconBg: 'var(--pgn-color-info-base)' }, // Blue
    ];

    return colors[cardIndex % colors.length];
  };

  const cardStyle = getCardStyle(index || 0);

  return (
    <Card
      className="metric-card-visual"
      style={{ background: cardStyle.background }}
    >
      <div className="metric-card-visual-content">
        <div
          className="metric-card-visual-icon"
          style={{ background: cardStyle.iconBg }}
        >
          {SUPPORTED_ICON_CLASSES.includes(icon) ? (
            <FontAwesomeIcon icon={`${icon}`} />
          ) : (
            <FontAwesomeIcon icon="fas fa-chart-bar" />
          )}
        </div>
        <div className="metric-card-visual-text">
          <div className="metric-card-visual-value">{value}</div>
          <div className="metric-card-visual-label">{label}</div>
        </div>
      </div>
    </Card>
  );
};

MetricCard.propTypes = {
  icon: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  index: PropTypes.number,
};

export default MetricCard;
