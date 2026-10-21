/*
 * Additions to the custom header (MainHeader of titaned-frontend-library), shared by every
 * TitanEd MFE fork: keep this file identical in all of them.
 *
 *  - headerUser(): the name and picture the header shows (full name and profile picture from
 *    the user-dropdown-menu API of control-hub).
 *  - <HeaderExtras />: the notification bell and the light / dark mode switch, placed next to
 *    the user menu, the styles that put the profile picture before the name, and the logo link
 *    to the site's home page (LMS).
 *
 * The notification bell is the stock Open edX one (NotificationsTray of
 * @edx/frontend-plugin-notifications), rendered in the same plugin slot as in the stock header
 * (org.openedx.frontend.layout.header_notifications_tray.v1), so it behaves the same: the LMS
 * decides whether it shows (`show_notifications_tray` of /api/notifications/count/), a badge
 * counts unseen notifications, a click opens the tray with its tabs, "mark all as read" and the
 * link to the notification preferences.
 *
 * The chosen mode is stored the way frontend-platform reads it (localStorage) and in a cookie
 * on the LMS domain, so the other MFEs and the LMS pages open in the same mode.
 *
 *  - loadSiteIntegrations(): Google Tag Manager and the support chat of the site (Control Hub ->
 *    Add-ons -> Integration). The LMS serves them as one small script, /integrations/site.js
 *    (control-hub integrations/api.py); the tools of the staff ask for it without the chat.
 *    Google Analytics 4 needs nothing here: frontend-platform loads it from the configuration.
 */
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { getConfig } from '@edx/frontend-platform';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import NotificationsTray from '@edx/frontend-plugin-notifications';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { Icon, IconButton } from '@openedx/paragon';
import { Nightlight, WbSunny } from '@openedx/paragon/icons';

const messages = defineMessages({
  switchToDark: {
    id: 'tels.header.theme.switchToDark',
    defaultMessage: 'Switch to dark mode',
    description: 'Label of the header button that turns dark mode on',
  },
  switchToLight: {
    id: 'tels.header.theme.switchToLight',
    defaultMessage: 'Switch to light mode',
    description: 'Label of the header button that turns light mode on',
  },
  // The notification tray (@edx/frontend-plugin-notifications) prints its tab names from the
  // API keys ("discussion", "updates", "grading") and one screen-reader text as plain English.
  trayTabDiscussion: {
    id: 'tels.header.notifications.tab.discussion',
    defaultMessage: 'Discussion',
    description: 'Tab of the notification tray with forum notifications',
  },
  trayTabUpdates: {
    id: 'tels.header.notifications.tab.updates',
    defaultMessage: 'Updates',
    description: 'Tab of the notification tray with course update notifications',
  },
  trayTabGrading: {
    id: 'tels.header.notifications.tab.grading',
    defaultMessage: 'Grading',
    description: 'Tab of the notification tray with grading notifications',
  },
  trayPreferences: {
    id: 'tels.header.notifications.preferences',
    defaultMessage: 'Notification preferences',
    description: 'Accessible name of the settings link in the notification tray',
  },
  toggleSidebar: {
    id: 'tels.header.sidebar.toggle',
    defaultMessage: 'Toggle sidebar',
    description: 'Accessible name of the header button that opens and closes the left navigation',
  },
  more: {
    id: 'tels.header.more',
    defaultMessage: 'More',
    description: 'Accessible name of the header button that opens the extra actions on small screens',
  },
  search: {
    id: 'tels.header.search.label',
    defaultMessage: 'Search',
    description: 'Placeholder and accessible name of the search field and search button in the header',
  },
  closeSearch: {
    id: 'tels.header.search.close',
    defaultMessage: 'Close search',
    description: 'Accessible name of the button that closes the search panel of the header',
  },
  closeAnnouncement: {
    id: 'tels.header.announcement.close',
    defaultMessage: 'Close announcement',
    description: 'Accessible name of the button that closes the announcement banner above the header',
  },
  logoAlt: {
    id: 'tels.header.logo.named',
    defaultMessage: '{siteName} logo',
    description: 'Text alternative of the logo in the header. {siteName} is the name of the platform.',
  },
});

// Names frontend-platform (and the earlier Indigo toggle) read the theme variant from.
const THEME_KEYS = ['selected-paragon-theme-variant', 'selected-theme-variant'];
const THEME_ATTRIBUTES = ['data-paragon-theme-variant', 'data-theme-variant'];
const THEME_COOKIE_DAYS = 90;

// Same slot as the stock header (frontend-component-header, HeaderNotificationsSlot).
const NOTIFICATIONS_SLOT_ID = 'org.openedx.frontend.layout.header_notifications_tray.v1';

const HEADER_EXTRAS_STYLE = `
  .tels-header-extras { display: inline-flex; align-items: center; gap: .25rem; flex: none; }
  .tels-header-extras #notificationIcon { display: inline-flex; align-items: center; margin: 0 !important; }
  /* MainHeader has a bell of its own that opens nothing: the real one replaces it. */
  .header-container .icon-curved-square:has(> button[aria-label="Notifications"]),
  .header-container .icon-curved-square:has(button[alt="Notifications"]) { display: none !important; }
  .header-container #user-dropdown-menu { display: inline-flex; align-items: center; gap: .5rem; }
  /* Narrow screens: the buttons and the user menu stay on one line next to the logo. */
  .header-container .usermenu-dropdown-mobile { display: flex; align-items: center; }
  @media (max-width: 575.98px) {
    .tels-header-extras { gap: 0; }
    .tels-header-extras .btn-icon { width: 2.25rem !important; height: 2.25rem !important; }
    .header-container .usermenu-dropdown-mobile #user-dropdown-menu { padding: .25rem !important; }
    .header-container .usermenu-dropdown-mobile > .dropdown { margin-inline-end: .25rem !important; }
  }
  @media (max-width: 359.98px) {
    .header-container .navbar-brand img { max-width: 3rem; }
    .tels-header-extras .btn-icon { width: 2rem !important; height: 2rem !important; }
    .header-container .usermenu-dropdown-mobile #user-dropdown-menu { padding: .125rem !important; }
    .header-container .usermenu-dropdown-mobile > .dropdown { margin-inline-end: 0 !important; }
    .header-container .usermenu-dropdown-mobile { margin-inline-start: 0 !important; }
    .header-container .toggle-sidebar-icon { margin-inline-end: .5rem !important; }
  }
  .header-container #user-dropdown-menu > img,
  .header-container #user-dropdown-menu > .pgn__avatar {
    order: -1; flex: none; width: 2rem !important; height: 2rem !important; margin: 0 !important;
    /* max-*: holds where utility classes (w-100) sit in a CSS layer and win over !important */
    max-width: 2rem; max-height: 2rem;
    border-radius: 50%; object-fit: cover;
  }
  /* Announcements of the site (Control Hub -> Configuration -> Announcements), above the page. */
  .tels-announcements { display: grid; gap: 1px; }
  .tels-announcement {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
    padding: .6rem 1rem; font-size: 1rem; line-height: 1.5;
    color: var(--pgn-color-gray-900, #1f2933);
    background: var(--pgn-color-info-100, #e6f2fb);
    border-inline-start: 4px solid var(--pgn-color-info-500, #0b6fbf);
  }
  .tels-announcement--success { background: var(--pgn-color-success-100, #e4f5ec); border-color: var(--pgn-color-success-500, #18794e); }
  .tels-announcement--warning { background: var(--pgn-color-warning-100, #fdf2dc); border-color: var(--pgn-color-warning-500, #a15c07); }
  .tels-announcement--critical { background: var(--pgn-color-danger-100, #fdebe6); border-color: var(--pgn-color-danger-500, #c4320a); }
  .tels-announcement__text { min-width: 0; overflow-wrap: anywhere; }
  .tels-announcement__text p { display: inline; margin: 0; }
  .tels-announcement__text a { color: inherit; text-decoration: underline; }
  .tels-announcement__close {
    flex: none; border: 0; background: transparent; color: inherit; font-size: 1.5rem; line-height: 1;
    padding: 0 .25rem; cursor: pointer;
  }
  .tels-announcement__close:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
`;

// Staff tools: no chat widget, and the announcements for course teams.
const STAFF_TOOLS = /^\/(authoring|course-authoring|admin-console|gradebook|communications|ora-grading)(\/|$)/;
const CLOSED_ANNOUNCEMENTS = 'tels-announcements-closed';

const closedAnnouncements = () => {
  try {
    return JSON.parse(window.localStorage.getItem(CLOSED_ANNOUNCEMENTS) || '[]');
  } catch (error) {
    return [];
  }
};

/**
 * The site's announcements shown now: to learners on learning pages, to course teams on the staff
 * tools (Studio, gradebook…). Drawn above the page; one closed stays closed until it is changed
 * (its id and version are remembered in this browser).
 */
const Announcements = () => {
  const intl = useIntl();
  const [items, setItems] = useState([]);
  const [host, setHost] = useState(null);

  useEffect(() => {
    if (window.top !== window.self) { return undefined; }
    const element = document.createElement('div');
    element.className = 'tels-announcements';
    document.body.insertBefore(element, document.body.firstChild);
    setHost(element);
    const audience = STAFF_TOOLS.test(window.location.pathname) ? 'course_teams' : 'learners';
    const closed = closedAnnouncements();
    fetch(`${getConfig().LMS_BASE_URL}/titaned/api/v1/system/alerts/?audience=${audience}`)
      .then((response) => (response.ok ? response.json() : {}))
      .then((data) => setItems((data.announcements || []).filter(
        (item) => !closed.includes(`${item.id}:${item.version}`),
      )))
      .catch(() => {});
    return () => element.remove();
  }, []);

  const close = (item) => {
    try {
      const keep = closedAnnouncements().slice(-50);
      window.localStorage.setItem(CLOSED_ANNOUNCEMENTS, JSON.stringify([...keep, `${item.id}:${item.version}`]));
    } catch (error) {
      // storage blocked: closed for this page only
    }
    setItems((current) => current.filter((other) => other.id !== item.id));
  };

  if (!host || !items.length) { return null; }
  return createPortal(
    items.map((item) => (
      <div key={item.id} className={`tels-announcement tels-announcement--${item.severity}`} role="status">
        <div className="tels-announcement__text">
          {item.title && <strong>{item.title} </strong>}
          {/* The message is cleaned of unsafe HTML by the LMS (alerts.views.announcement_payload). */}
          {/* eslint-disable-next-line react/no-danger */}
          <span dangerouslySetInnerHTML={{ __html: item.message }} />
        </div>
        {item.dismissible && (
          <button
            type="button"
            className="tels-announcement__close"
            aria-label={intl.formatMessage(messages.closeAnnouncement)}
            onClick={() => close(item)}
          >
            ×
          </button>
        )}
      </div>
    )),
    host,
  );
};

const readCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=(light|dark)(?:;|$)`));
  return match ? match[1] : null;
};

const readStorage = () => {
  try {
    return window.localStorage.getItem(THEME_KEYS[0]);
  } catch (error) {
    return null; // storage blocked (private mode): the cookie alone decides
  }
};

const writeStorage = (variant) => {
  try {
    THEME_KEYS.forEach((key) => window.localStorage.setItem(key, variant));
  } catch (error) {
    // storage blocked: nothing to remember here
  }
};

const cookieDomain = () => {
  try {
    const lmsHost = new URL(getConfig().LMS_BASE_URL).hostname;
    // Only a domain this page belongs to can be set; otherwise keep the cookie on this host.
    return window.location.hostname.endsWith(lmsHost) ? lmsHost : window.location.hostname;
  } catch (error) {
    return window.location.hostname;
  }
};

const writeCookie = (variant) => {
  const expires = new Date(Date.now() + THEME_COOKIE_DAYS * 24 * 60 * 60 * 1000).toUTCString();
  THEME_KEYS.forEach((key) => {
    document.cookie = `${key}=${variant}; domain=${cookieDomain()}; path=/; expires=${expires}; SameSite=Lax`;
  });
};

export const loadSiteIntegrations = () => {
  try {
    const lmsBaseUrl = getConfig().LMS_BASE_URL;
    // Once per page, and never inside a frame (the page around it does the work).
    if (!lmsBaseUrl || window.telsSiteIntegrationsRequested || window.top !== window.self) { return; }
    window.telsSiteIntegrationsRequested = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `${lmsBaseUrl}/integrations/site.js${STAFF_TOOLS.test(window.location.pathname) ? '?chat=0' : ''}`;
    document.head.appendChild(script);
  } catch (e) {
    // No access to the top window (embedded by another site): nothing to load.
  }
};

export const currentThemeVariant = () => {
  const variant = readCookie(THEME_KEYS[0]) || readStorage()
    || document.documentElement.getAttribute(THEME_ATTRIBUTES[0]);
  return variant === 'dark' ? 'dark' : 'light';
};

/**
 * The user as the header shows it: full name (the username when no name is set) and the
 * profile picture. `menu` is the response of /titaned/api/v1/user-dropdown-menu/.
 */
export const headerUser = (authenticatedUser, menu) => ({
  ...authenticatedUser,
  username: menu?.full_name || menu?.username || authenticatedUser?.name || authenticatedUser?.username,
  avatar: menu?.profile_image?.image_url_small || authenticatedUser?.avatar,
});

const HeaderExtras = () => {
  const intl = useIntl();
  const [host, setHost] = useState(null);
  const [variant] = useState(currentThemeVariant);

  // A mode chosen in another MFE or on an LMS page arrives in the cookie: adopt it.
  useEffect(() => { loadSiteIntegrations(); }, []);

  useEffect(() => {
    const fromCookie = readCookie(THEME_KEYS[0]);
    if (fromCookie && fromCookie !== readStorage()) {
      writeStorage(fromCookie);
      window.location.reload();
    }
  }, []);

  // MainHeader has no place for extra buttons, so the switch is put before its user menu.
  useEffect(() => {
    const element = document.createElement('div');
    element.className = 'tels-header-extras';
    // The logo of MainHeader points to "/" of the MFE host: send it to the site's home page.
    const homeUrl = `${getConfig().LMS_BASE_URL}/`;
    const goHome = () => { window.location.href = homeUrl; };
    const place = () => {
      const anchor = document.querySelector('.header-container .usermenu-dropdown')
        || document.getElementById('user-dropdown-menu')?.closest('.dropdown');
      if (anchor && anchor.parentNode && element.nextSibling !== anchor) {
        anchor.parentNode.insertBefore(element, anchor);
      }
      // In dark mode the header shows the logo made for dark backgrounds (theme page: "Logo for
      // dark backgrounds"); the library only knows one logo.
      const darkLogo = getConfig().LOGO_WHITE_URL;
      const logoImage = document.querySelector('.header-container .navbar-brand img');
      if (logoImage && darkLogo && currentThemeVariant() === 'dark' && logoImage.getAttribute('src') !== darkLogo) {
        logoImage.setAttribute('src', darkLogo);
      }
      // The library writes alt="Logo" in English: name the logo after the site, in the page language.
      const logoAlt = intl.formatMessage(messages.logoAlt, { siteName: getConfig().SITE_NAME });
      if (logoImage && logoImage.getAttribute('alt') !== logoAlt) {
        logoImage.setAttribute('alt', logoAlt);
      }
      // index.html says lang="en-us" whatever the language: screen readers and the browser's
      // hyphenation and spell check follow this attribute.
      if (intl.locale && document.documentElement.lang !== intl.locale) {
        document.documentElement.lang = intl.locale;
      }
      // The library names these controls in English only: give them the translated names.
      const search = intl.formatMessage(messages.search);
      const labels = [
        ['.header-container .toggle-sidebar-icon button', 'aria-label', intl.formatMessage(messages.toggleSidebar)],
        ['.header-container .navbar-buttons > button.btn-icon', 'aria-label', intl.formatMessage(messages.more)],
        ['.header-container button[aria-label="Search"]', 'aria-label', search],
        ['.header-container input[placeholder="Search"]', 'placeholder', search],
        ['input.search-input[placeholder="Search"], .search-modal input[placeholder="Search"]', 'placeholder', search],
        ['button.close-search-bar', 'aria-label', intl.formatMessage(messages.closeSearch)],
        ['button[aria-label="Close announcement banner"]', 'aria-label', intl.formatMessage(messages.closeAnnouncement)],
      ];
      labels.forEach(([selector, attribute, text]) => {
        document.querySelectorAll(selector).forEach((control) => {
          if (control.getAttribute(attribute) !== text) {
            control.setAttribute(attribute, text);
          }
        });
      });
      // The library draws the logo as a <nav href="/"> element, which is not a link.
      const logo = document.querySelector('.header-container .navbar-brand');
      if (logo && logo.dataset.telsHome !== homeUrl) {
        logo.dataset.telsHome = homeUrl;
        logo.setAttribute('href', homeUrl);
        if (logo.tagName !== 'A') {
          logo.setAttribute('role', 'link');
          logo.setAttribute('tabindex', '0');
          logo.style.cursor = 'pointer';
          logo.addEventListener('click', goHome);
          logo.addEventListener('keydown', (event) => { if (event.key === 'Enter') { goHome(); } });
        }
      }
    };
    place();
    const observer = new MutationObserver(place);
    // The whole page, not only the header: the announcement banner and the search panel are drawn
    // outside it, and later than the header.
    observer.observe(document.body, { childList: true, subtree: true });
    setHost(element);
    return () => {
      observer.disconnect();
      element.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The tray opens in an overlay outside the header: translate the few texts it has no
  // messages for, whenever it appears or redraws.
  useEffect(() => {
    const texts = {
      discussion: intl.formatMessage(messages.trayTabDiscussion),
      updates: intl.formatMessage(messages.trayTabUpdates),
      grading: intl.formatMessage(messages.trayTabGrading),
      'preferences settings icon': intl.formatMessage(messages.trayPreferences),
    };
    const translateTray = () => {
      const tray = document.getElementById('notificationTray');
      if (!tray) { return; }
      tray.querySelectorAll('.nav-link, .sr-only').forEach((element) => {
        element.childNodes.forEach((node) => {
          const text = node.nodeType === Node.TEXT_NODE ? texts[node.nodeValue.trim().toLowerCase()] : null;
          if (text && node.nodeValue !== text) {
            node.nodeValue = text; // eslint-disable-line no-param-reassign
          }
        });
      });
    };
    const observer = new MutationObserver(translateTray);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const next = variant === 'dark' ? 'light' : 'dark';
    writeStorage(next);
    writeCookie(next);
    THEME_ATTRIBUTES.forEach((attribute) => document.documentElement.setAttribute(attribute, next));
    // frontend-platform loads the stylesheets of the variant when the page starts.
    window.location.reload();
  };

  const label = intl.formatMessage(variant === 'dark' ? messages.switchToLight : messages.switchToDark);
  return (
    <>
      <style>{HEADER_EXTRAS_STYLE}</style>
      <Announcements />
      {host && createPortal(
        <>
          <PluginSlot id={NOTIFICATIONS_SLOT_ID}>
            <NotificationsTray />
          </PluginSlot>
          <IconButton
            className="tels-theme-toggle"
            src={variant === 'dark' ? WbSunny : Nightlight}
            iconAs={Icon}
            alt={label}
            title={label}
            variant="primary"
            onClick={toggle}
          />
        </>,
        host,
      )}
    </>
  );
};

export default HeaderExtras;
