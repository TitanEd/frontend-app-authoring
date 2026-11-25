# CourseUnitSidebarAccessSlot

### Slot ID: `org.openedx.frontend.authoring.course_unit_sidebar_access.v1`

### Plugin Props:

- `selectedPartitionIndex` - Number (optional). Index of the selected group type / partition.
- `setFieldValue` - Function. Formik `setFieldValue` for updating access fields.
- `userPartitionInfo` - Object (optional). Partition and group info for the unit (see `AccessEditComponentProps`).
- `selectedGroups` - Array of strings. IDs of the currently selected groups.

## Description

The slot wraps the **Access Restrictions** control on the unit sidebar Settings tab (`Info` → `Unit` → `Settings`). By default it renders the stock `AccessEditComponent` drop-down.

Operators can replace the default content (for example when the course has no group types) via plugin configuration.

## Example

The following example replaces the default Access Restrictions control with a custom widget:

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import CustomUnitAccessSettings from './src/course-unit/unit-sidebar/unit-info/CustomUnitAccessSettings';

const config = {
  pluginSlots: {
    'org.openedx.frontend.authoring.course_unit_sidebar_access.v1': {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Hide,
          widgetId: 'default_contents',
        },
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_unit_access_settings',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: (props) => <CustomUnitAccessSettings {...props} />,
          },
        },
      ],
    },
  },
};

export default config;
```
