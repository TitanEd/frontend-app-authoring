import { getConfig } from '@edx/frontend-platform';
import { defineMessages, IntlShape } from '@edx/frontend-platform/i18n';

// Same ids and texts as the stock Studio header user menu
// (@edx/frontend-component-header studio-header), so their translations apply.
const messages = defineMessages({
  studioHome: {
    id: 'header.user.menu.studio',
    defaultMessage: 'Studio Home',
    description: 'Link to Studio Home',
  },
  maintenance: {
    id: 'header.user.menu.maintenance',
    defaultMessage: 'Maintenance',
    description: 'Link to the Studio maintenance page',
  },
  logout: {
    id: 'header.user.menu.logout',
    defaultMessage: 'Logout',
    description: 'Logout link',
  },
});

interface UserMenuItemsParams {
  intl: IntlShape;
  logoutUrl?: string;
  isAdmin?: boolean;
  userMenuItemsFromAPI?: any;
}

/**
 * User menu of the custom Studio header.
 * Items come from the user-dropdown-menu API; when it returns nothing the stock
 * Studio user menu is rebuilt from the MFE config (no hardcoded URLs).
 */
const customGetUserMenuItems = ({
  intl,
  logoutUrl,
  isAdmin,
  userMenuItemsFromAPI,
}: UserMenuItemsParams) => {
  if (Array.isArray(userMenuItemsFromAPI?.menu_items) && userMenuItemsFromAPI.menu_items.length) {
    return userMenuItemsFromAPI.menu_items.map((item: { label: string; url: string }) => ({
      href: item.url,
      title: item.label,
    }));
  }

  const { STUDIO_BASE_URL, LOGOUT_URL } = getConfig();

  return [
    {
      href: `${STUDIO_BASE_URL}`,
      title: intl.formatMessage(messages.studioHome),
    },
    ...(isAdmin ? [{
      href: `${STUDIO_BASE_URL}/maintenance`,
      title: intl.formatMessage(messages.maintenance),
    }] : []),
    {
      href: logoutUrl || LOGOUT_URL,
      title: intl.formatMessage(messages.logout),
    },
  ];
};

export default customGetUserMenuItems;
