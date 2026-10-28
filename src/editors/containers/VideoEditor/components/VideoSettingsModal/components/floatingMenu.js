import './floatingMenu.scss';

/**
 * Props for a dropdown menu inside the video settings cards.
 *
 * The cards clip what overflows them, so a menu placed inside a card loses the
 * items below its edge. A fixed menu is drawn over the modal instead and flips
 * above its button when there is no room below.
 */
export const floatingMenuClass = 'video-settings-floating-menu';

export const floatingMenuProps = {
  popperConfig: { strategy: 'fixed' },
};

export default floatingMenuProps;
