/* eslint-disable linebreak-style */
import { getConfig } from '@edx/frontend-platform';

interface UserMenuItemsParams {
  studioBaseUrl: string;
  logoutUrl: string;
  isAdmin: any;
  authenticatedUser: any;
  userMenuItemsFromAPI?: any;
}

const getUserMenuItems = ({
  studioBaseUrl,
  logoutUrl,
  isAdmin,
  authenticatedUser,
  userMenuItemsFromAPI,
}: UserMenuItemsParams) => {
  // Use menu_items from API if available, otherwise use fallback items
  if (userMenuItemsFromAPI?.menu_items && Array.isArray(userMenuItemsFromAPI.menu_items)) {
    return userMenuItemsFromAPI.menu_items.map((item: { label: string; url: string }) => ({
      href: item.url,
      title: item.label,
    }));
  }

  // Fallback items
  let items = [
    {
      href: `${studioBaseUrl}`,
      title: 'Studio Home',
    }, {
      href: `${logoutUrl}`,
      title: 'Logout',
    },
  ];
  if (isAdmin) {
    items = [
      {
        href: `${studioBaseUrl}`,
        title: 'Studio Home',
      }, {
        href: `${getConfig().STUDIO_BASE_URL}/maintenance`,
        title: 'Maintenance',
      }, {
        href: `${logoutUrl}`,
        title: 'Logout',
      },
    ];
  }

  return items;
};

export default getUserMenuItems;
