import { PluginSlot } from '@openedx/frontend-plugin-framework';

import {
  AccessEditComponent,
  AccessEditComponentProps,
} from '@src/generic/configure-modal/UnitTab';

export interface CourseUnitSidebarAccessSlotProps extends AccessEditComponentProps {}

const CourseUnitSidebarAccessSlot = ({
  selectedPartitionIndex,
  setFieldValue,
  userPartitionInfo,
  selectedGroups,
}: CourseUnitSidebarAccessSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.authoring.course_unit_sidebar_access.v1"
    pluginProps={{
      selectedPartitionIndex,
      setFieldValue,
      userPartitionInfo,
      selectedGroups,
    }}
  >
    <AccessEditComponent
      selectedPartitionIndex={selectedPartitionIndex}
      setFieldValue={setFieldValue}
      userPartitionInfo={userPartitionInfo}
      selectedGroups={selectedGroups}
    />
  </PluginSlot>
);

export default CourseUnitSidebarAccessSlot;
