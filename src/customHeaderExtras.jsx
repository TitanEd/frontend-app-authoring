/*
 * Additions to the custom header (MainHeader of titaned-frontend-library), shared by every
 * TitanEd MFE fork: keep this file identical in all of them.
 *
 *  - headerUser(): the name and picture the header shows (full name and profile picture from
 *    the user-dropdown-menu API of control-hub).
 *  - <HeaderExtras />: the light / dark mode switch, placed next to the user menu, the
 *    styles that put the profile picture before the name, and the logo link to the site's
 *    home page (LMS).
 *
 * The chosen mode is stored the way frontend-platform reads it (localStorage) and in a cookie
 * on the LMS domain, so the other MFEs and the LMS pages open in the same mode.
 */
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { getConfig } from '@edx/frontend-platform';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
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
});

// Names frontend-platform (and the earlier Indigo toggle) read the theme variant from.
const THEME_KEYS = ['selected-paragon-theme-variant', 'selected-theme-variant'];
const THEME_ATTRIBUTES = ['data-paragon-theme-variant', 'data-theme-variant'];
const THEME_COOKIE_DAYS = 90;

const HEADER_EXTRAS_STYLE = `
  .tels-header-extras { display: inline-flex; align-items: center; }
  .header-container #user-dropdown-menu { display: inline-flex; align-items: center; gap: .5rem; }
  .header-container #user-dropdown-menu > img,
  .header-container #user-dropdown-menu > .pgn__avatar {
    order: -1; flex: none; width: 2rem !important; height: 2rem !important; margin: 0 !important;
    border-radius: 50%; object-fit: cover;
  }
`;

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
    observer.observe(document.querySelector('.header-container') || document.body, { childList: true, subtree: true });
    setHost(element);
    return () => {
      observer.disconnect();
      element.remove();
    };
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
      {host && createPortal(
        <IconButton
          className="tels-theme-toggle"
          src={variant === 'dark' ? WbSunny : Nightlight}
          iconAs={Icon}
          alt={label}
          title={label}
          variant="primary"
          onClick={toggle}
        />,
        host,
      )}
    </>
  );
};

export default HeaderExtras;
