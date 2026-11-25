/**
 * TitanEd widget for org.openedx.frontend.authoring.course_unit_sidebar_access.v1 (TSD-61).
 * Shows the stock Access Restrictions control when group types exist; otherwise a note with a
 * link to Group Configurations instead of an empty drop-down.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { AccessEditComponent } from '@src/generic/configure-modal/UnitTab';

import messages from './CustomUnitAccessSettings.messages';

const CustomUnitAccessSettings = ({
  selectedPartitionIndex,
  setFieldValue,
  userPartitionInfo,
  selectedGroups,
}) => {
  const intl = useIntl();
  const { courseId } = useCourseAuthoringContext();

  if ((userPartitionInfo?.selectablePartitions?.length || 0) > 0) {
    return (
      <AccessEditComponent
        selectedPartitionIndex={selectedPartitionIndex}
        setFieldValue={setFieldValue}
        userPartitionInfo={userPartitionInfo}
        selectedGroups={selectedGroups}
      />
    );
  }

  return (
    <p className="tels-unit-access-empty small mb-0">
      {intl.formatMessage(messages.noGroups, {
        link: (
          <Link to={`/course/${courseId}/group_configurations`}>
            {intl.formatMessage(messages.groupConfigurationsLink)}
          </Link>
        ),
      })}
    </p>
  );
};

CustomUnitAccessSettings.propTypes = {
  selectedPartitionIndex: PropTypes.number,
  setFieldValue: PropTypes.func.isRequired,
  userPartitionInfo: PropTypes.shape({
    selectablePartitions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      scheme: PropTypes.string,
      groups: PropTypes.arrayOf(PropTypes.shape({
        deleted: PropTypes.bool,
        id: PropTypes.number,
        name: PropTypes.string,
        selected: PropTypes.bool,
      })),
    })),
    selectedPartitionIndex: PropTypes.number,
    selectedGroupsLabel: PropTypes.string,
  }),
  selectedGroups: PropTypes.arrayOf(PropTypes.string).isRequired,
};

CustomUnitAccessSettings.defaultProps = {
  selectedPartitionIndex: undefined,
  userPartitionInfo: undefined,
};

export default CustomUnitAccessSettings;
