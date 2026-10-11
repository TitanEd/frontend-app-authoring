import { defineMessages } from '@edx/frontend-platform/i18n';

// Messages of the custom configure modal (CustomBasicTab): times are entered in
// the user's time zone, e.g. "Release time in (Asia/Kolkata GMT+05:30)".
const messages = defineMessages({
  releaseTimeCustom: {
    id: 'this.releaseTimeCustom',
    defaultMessage: 'Release time in ({timezone})',
    description: 'Label of the release time field, with the user time zone',
  },
  dueTimeCustom: {
    id: 'this.dueTimeCustom',
    defaultMessage: 'Due time in ({timezone})',
    description: 'Label of the due time field, with the user time zone',
  },
});

export default messages;
