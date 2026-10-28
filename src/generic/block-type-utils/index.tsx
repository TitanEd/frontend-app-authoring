import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { Article } from '@openedx/paragon/icons';
import {
  COMPONENT_TYPE_ICON_MAP,
  STRUCTURAL_TYPE_ICONS,
  COMPONENT_TYPE_STYLE_COLOR_MAP,
} from './constants';

import messages from './messages';
import blockTypeMessages from '../../search-manager/messages';

export function getItemIcon(blockType: string): React.ComponentType {
  return STRUCTURAL_TYPE_ICONS[blockType] ?? COMPONENT_TYPE_ICON_MAP[blockType] ?? Article;
}

export function getComponentStyleColor(blockType: string): string {
  return COMPONENT_TYPE_STYLE_COLOR_MAP[blockType] ?? COMPONENT_TYPE_STYLE_COLOR_MAP.other;
}

interface ComponentIconProps {
  blockType: string;
  iconTitle: string;
  text?: string;
  className?: string;
  /** What screen readers say for the icon; the block type when not given. */
  screenReaderText?: string;
}

export const ComponentIcon = ({
  blockType,
  iconTitle,
  text,
  className,
  screenReaderText,
}: ComponentIconProps) => (
  <div className={`rounded p-1 d-inline-flex ${getComponentStyleColor(blockType)} ${className}`}>
    <Icon
      src={getItemIcon(blockType)}
      screenReaderText={screenReaderText || blockType}
      title={iconTitle}
      size="sm"
    />
    {text && <span className="ml-1 x-small">{text}</span>}
  </div>
);

/** A block type's name for people ("vertical" -> "Unit"), or the type itself when unknown. */
const useBlockTypeName = () => {
  const intl = useIntl();
  return (blockType: string): string => {
    const message = blockTypeMessages[`blockType.${blockType}`];
    return message ? intl.formatMessage(message) : blockType;
  };
};

interface ComponentCountSnippetProps {
  componentData: Record<string, number>;
}

export const ComponentCountSnippet = ({ componentData }: ComponentCountSnippetProps) => {
  const intl = useIntl();
  const blockTypeName = useBlockTypeName();

  const totalCount = componentData && Object.values(componentData).reduce((acc, val) => acc + val, 0);

  return (
    <div>
      {componentData && (
        <div className="d-inline-flex py-1 px-2 mr-2 border-right border-light">
          <Icon
            src={getItemIcon('components')}
            title={intl.formatMessage(messages.componentTotal)}
            className="mr-1"
            size="sm"
          />
          <span className="x-small">
            {`${totalCount} ${intl.formatMessage(messages.componentTotal)}`}
          </span>
        </div>
      )}
      {componentData && Object.keys(componentData).map((blockType) => (
        <ComponentIcon
          key={blockType}
          blockType={blockType}
          iconTitle={blockTypeName(blockType)}
          screenReaderText={blockTypeName(blockType)}
          text={componentData[blockType].toString()}
          className="px-2 mr-2"
        />
      ))}
    </div>
  );
};
