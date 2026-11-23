import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  noGroups: {
    id: 'tels.course.unit.access.noGroups',
    defaultMessage: 'You have not created any content groups yet. Create them in {link} to restrict access.',
    description: 'Shown in the unit sidebar Access Restrictions when the course has no group types.',
  },
  groupConfigurationsLink: {
    id: 'tels.course.unit.access.groupConfigurationsLink',
    defaultMessage: 'Group Configurations',
    description: 'Link text to the Group Configurations page.',
  },
});

export default messages;
