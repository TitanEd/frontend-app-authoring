import { getConfig } from '@edx/frontend-platform';

/**
 * Tells the Studio pages shown in frames (unit page components, legacy editors, library blocks)
 * whether the page is in dark or light mode.
 *
 * Those pages normally read the shared `selected-paragon-theme-variant` cookie, which is set on the
 * LMS domain. When Studio's host is not under that domain (e.g. LMS demo.example.com, Studio
 * studio.example.com) the cookie never reaches them and they stay light. indigo's Studio
 * `dark-theme.js` applies the `variant` sent with its `indigo-toggle-dark` message instead.
 */
const VARIANT_ATTRIBUTE = 'data-paragon-theme-variant';

const currentVariant = () => (document.documentElement.getAttribute(VARIANT_ATTRIBUTE) === 'dark' ? 'dark' : 'light');

const studioOrigin = () => {
  try {
    return new URL(getConfig().STUDIO_BASE_URL).origin;
  } catch (error) {
    return null;
  }
};

const tellFrame = (frame, origin, variant) => {
  try {
    // Frames of any other origin do not receive it (postMessage checks the target origin).
    frame.contentWindow?.postMessage({ 'indigo-toggle-dark': true, variant }, origin);
  } catch (error) {
    // a frame that is being removed: nothing to tell
  }
};

const tellAllFrames = () => {
  const origin = studioOrigin();
  if (!origin) {
    return;
  }
  const variant = currentVariant();
  document.querySelectorAll('iframe').forEach((frame) => tellFrame(frame, origin, variant));
};

let installed = false;

const installStudioFrameTheme = () => {
  if (installed) {
    return;
  }
  installed = true;
  // A frame's load event does not bubble, but it can be caught on the way down.
  document.addEventListener('load', (event) => {
    if (event.target instanceof HTMLIFrameElement) {
      const origin = studioOrigin();
      if (origin) {
        tellFrame(event.target, origin, currentVariant());
      }
    }
  }, true);
  new MutationObserver(tellAllFrames).observe(document.documentElement, {
    attributes: true,
    attributeFilter: [VARIANT_ATTRIBUTE],
  });
  tellAllFrames();
};

export default installStudioFrameTheme;
