/* eslint-disable linebreak-style */
import React from 'react';
import {
  Card, Button, IconButtonWithTooltip, Icon,
} from '@openedx/paragon';
import './CourseCard.scss';
import { Repeat } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import customMessages from '../../customMessages';

type CourseCardProps = {
  imageSrc?: string;
  title: string;
  metadata: string;
  onViewLive?: () => void;
  onEditCourse?: () => void;
  onReRun?: () => void;
  isReRunEnabled?: boolean;
};

const fallbackImage = 'https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty.jpg';

const CourseCard: React.FC<CourseCardProps> = ({
  imageSrc,
  title,
  metadata,
  onViewLive,
  onEditCourse,
  onReRun,
  isReRunEnabled = false,
}) => {
  const intl = useIntl();
  return (
  <Card style={{ width: '19rem' }} className="course-card">
    <Card.ImageCap
      src={imageSrc === null ? fallbackImage : imageSrc}
      srcAlt={intl.formatMessage(customMessages.courseCoverAlt)}
      className="course-card-image"
    />
    <Card.Section className="text-center card-content-section">
      <div className="title-container">
        <h6 className="card-title fw-bold">{title}</h6>
        <p className="text-muted small">{metadata}</p>
      </div>
      {/* <hr /> */}
      {/* <p className="text-muted">{metadata}</p> */}
      <div className={`d-flex gap-2 course-card-buttons ${isReRunEnabled ? 'justify-content-between' : 'justify-content-around course-card-buttons-without-rerun'}`}>
        <Button size="sm" variant="primary" onClick={onViewLive}>{intl.formatMessage(customMessages.viewLive)}</Button>
        <Button size="sm" variant="outline-primary" onClick={onEditCourse}>{intl.formatMessage(customMessages.editCourse)}</Button>
        {isReRunEnabled && (
        <IconButtonWithTooltip src={Repeat} size="sm" variant="primary" iconAs={Icon} alt={intl.formatMessage(customMessages.reRun)} tooltipPlacement="bottom" tooltipContent={intl.formatMessage(customMessages.reRun)} onClick={onReRun} />
        )}
      </div>
    </Card.Section>
  </Card>
  );
};

export default CourseCard;
