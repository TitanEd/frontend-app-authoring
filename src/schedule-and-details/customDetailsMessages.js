import { defineMessages } from '@edx/frontend-platform/i18n';

// Texts of the redesigned Schedule & Details page (src/CustomScheduleAndDetails.jsx). The
// sections themselves keep their own messages.
const messages = defineMessages({
  lead: { id: 'tels.details.lead', defaultMessage: 'Dates, the course page learners see, requirements and licence. Changes apply when you save.' },
  viewAbout: { id: 'tels.details.viewAbout', defaultMessage: 'View course page' },
  navLabel: { id: 'tels.details.nav.label', defaultMessage: 'Sections of this page' },
  navBasics: { id: 'tels.details.nav.basics', defaultMessage: 'Basics' },
  navCredit: { id: 'tels.details.nav.credit', defaultMessage: 'Credit' },
  navPacing: { id: 'tels.details.nav.pacing', defaultMessage: 'Pacing' },
  navSchedule: { id: 'tels.details.nav.schedule', defaultMessage: 'Schedule' },
  navDetails: { id: 'tels.details.nav.details', defaultMessage: 'Language' },
  navIntroducing: { id: 'tels.details.nav.introducing', defaultMessage: 'Course page' },
  navOutcomes: { id: 'tels.details.nav.outcomes', defaultMessage: 'Learning outcomes' },
  navInstructors: { id: 'tels.details.nav.instructors', defaultMessage: 'Instructors' },
  navRequirements: { id: 'tels.details.nav.requirements', defaultMessage: 'Requirements' },
  navPricing: { id: 'tels.details.nav.pricing', defaultMessage: 'Pricing' },
  navLicense: { id: 'tels.details.nav.license', defaultMessage: 'Licence' },
  pricingTitle: { id: 'tels.details.pricing.title', defaultMessage: 'Pricing' },
  pricingHelp: { id: 'tels.details.pricing.help', defaultMessage: 'Decide whether learners enrol for free or buy the course.' },
  pricingModel: { id: 'tels.details.pricing.model', defaultMessage: 'Pricing model' },
  pricingFree: { id: 'tels.details.pricing.free', defaultMessage: 'Free' },
  pricingFreeHelp: { id: 'tels.details.pricing.free.help', defaultMessage: 'Anyone who may enrol starts learning at once.' },
  pricingPaid: { id: 'tels.details.pricing.paid', defaultMessage: 'Paid' },
  pricingPaidHelp: { id: 'tels.details.pricing.paid.help', defaultMessage: 'Learners pay at checkout before they are enrolled.' },
  price: { id: 'tels.details.pricing.price', defaultMessage: 'Price ({currency})' },
  priceHelp: { id: 'tels.details.pricing.price.help', defaultMessage: 'A whole number, without decimals.' },
  priceInvalid: { id: 'tels.details.pricing.price.invalid', defaultMessage: 'Enter a price of 1 or more, as a whole number.' },
  priceNotSelling: { id: 'tels.details.pricing.notSelling', defaultMessage: 'Selling courses is switched off for this site, so learners enrol for free until an administrator switches it on.' },
  priceLoadFailed: { id: 'tels.details.pricing.loadFailed', defaultMessage: 'The price could not be loaded.' },
  priceSaveFailed: { id: 'tels.details.pricing.saveFailed', defaultMessage: 'The price could not be saved. Try again.' },
});

export default messages;
