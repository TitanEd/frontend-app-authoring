import React, { useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Dropdown, Icon, IconButton, OverlayTrigger, Tooltip,
} from '@openedx/paragon';
import { DragHandle, Settings } from '@openedx/paragon/icons';

import cardHeaderMessages from '../card-header/messages';
import messages from './messages';
import './OutlineIcons.scss';

const MENU_TOOLTIPS = {
  section: messages.menuTooltipSection,
  subsection: messages.menuTooltipSubsection,
  unit: messages.menuTooltipUnit,
};

const DRAG_TOOLTIPS = {
  chapter: messages.dragTooltipSection,
  sequential: messages.dragTooltipSubsection,
  vertical: messages.dragTooltipUnit,
};

// Shown on hover and focus. Pressing the button (menu opens, drag starts) hides it until the
// pointer leaves; otherwise the focus that comes with the click would show it again.
const HoverTooltip = ({ text, children }) => {
  const id = useId();
  const [show, setShow] = useState(false);
  const pressed = useRef(false);
  const onToggle = (next) => {
    if (!next || !pressed.current) {
      setShow(next);
    }
  };
  const handlers = {
    onPointerDown: () => {
      pressed.current = true;
      setShow(false);
    },
    onPointerLeave: () => {
      pressed.current = false;
    },
  };
  return (
    <OverlayTrigger
      placement="top"
      trigger={['hover', 'focus']}
      show={show}
      onToggle={onToggle}
      overlay={<Tooltip id={`outline-tooltip-${id}`}>{text}</Tooltip>}
    >
      {children(handlers)}
    </OverlayTrigger>
  );
};

HoverTooltip.propTypes = {
  text: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired,
};

/** Settings (gear) button that opens the menu of a section, subsection or unit card. */
export const OutlineMenuToggle = ({ namePrefix }) => {
  const intl = useIntl();
  const tooltip = MENU_TOOLTIPS[namePrefix];
  const alt = intl.formatMessage(cardHeaderMessages.menuButtonAlt);
  const toggle = (props = {}) => (
    <Dropdown.Toggle
      className="item-card-header__menu"
      id={`${namePrefix}-card-header__menu`}
      data-testid={`${namePrefix}-card-header__menu-button`}
      as={IconButton}
      src={Settings}
      alt={alt}
      iconAs={Icon}
      {...props}
    />
  );
  if (!tooltip) {
    return toggle();
  }
  return (
    <HoverTooltip text={intl.formatMessage(tooltip)}>
      {(handlers) => toggle(handlers)}
    </HoverTooltip>
  );
};

OutlineMenuToggle.propTypes = {
  namePrefix: PropTypes.string.isRequired,
};

/** Icon inside the drag button of a card; it covers the whole button so the tooltip follows it. */
export const OutlineDragIcon = ({ category }) => {
  const intl = useIntl();
  const tooltip = DRAG_TOOLTIPS[category];
  const icon = (props = {}) => (
    <span className="outline-drag-icon" {...props}>
      <Icon src={DragHandle} />
    </span>
  );
  if (!tooltip) {
    return icon();
  }
  return (
    <HoverTooltip text={intl.formatMessage(tooltip)}>
      {(handlers) => icon(handlers)}
    </HoverTooltip>
  );
};

OutlineDragIcon.propTypes = {
  category: PropTypes.string,
};

OutlineDragIcon.defaultProps = {
  category: undefined,
};
