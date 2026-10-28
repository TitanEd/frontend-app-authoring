import React from 'react';
import PropTypes from 'prop-types';

import {
  ActionRow,
  Dropdown,
  Button,
  Form,
  Icon,
} from '@openedx/paragon';

import { Check, Search } from '@openedx/paragon/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { thunkActions, selectors } from '../../../../../../data/redux';
import { in8lTranscriptLanguages, videoTranscriptLanguages } from '../../../../../../data/constants/video';
import { FileInput, fileInput } from '../../../../../../sharedComponents/FileInput';
import { floatingMenuClass, floatingMenuProps } from '../floatingMenu';
import messages from './messages';
import './LanguageSelector.scss';

// The language menu is as wide as the field that opens it.
const sameWidth = {
  name: 'sameWidth',
  enabled: true,
  phase: 'beforeWrite',
  requires: ['computeStyles'],
  fn: ({ state }) => {
    // eslint-disable-next-line no-param-reassign
    state.styles.popper.width = `${state.rects.reference.width}px`;
  },
};
const menuProps = {
  popperConfig: { ...floatingMenuProps.popperConfig, modifiers: [sameWidth] },
};

const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/**
 * The transcript languages in the reader's language, sorted by name.
 * A query keeps the languages whose shown name, English name or code contains it.
 */
export const languageOptions = ({ names, query, locale }) => {
  const needle = normalize(query.trim());
  const collator = new Intl.Collator(locale);
  return Object.entries(videoTranscriptLanguages)
    .filter(([code]) => code !== 'placeholder')
    .map(([code, english]) => ({ code, english, name: names[code] || english }))
    .filter(({ code, english, name }) =>
      !needle
      || [name, english, code].some((text) => normalize(text).includes(needle))
    )
    .sort((a, b) => collator.compare(a.name, b.name));
};

export const hooks = {
  onSelectLanguage: ({
    dispatch,
    languageBeforeChange,
    triggerupload,
    setLocalLang,
  }) =>
  ({ newLang }) => {
    // IF Language is unset, set language and begin upload prompt.
    setLocalLang(newLang);
    if (languageBeforeChange === '') {
      triggerupload();
      return;
    }
    // Else: update language
    dispatch(
      thunkActions.video.updateTranscriptLanguage({
        newLanguageCode: newLang,
        languageBeforeChange,
      }),
    );
  },

  addFileCallback: ({ dispatch, localLang }) => (file) => {
    dispatch(thunkActions.video.uploadTranscript({
      file,
      filename: file.name,
      language: localLang,
    }));
  },
};

const LanguageSelector = ({
  index, // For a unique id for the form control
  language,
}) => {
  const openLanguages = useSelector(selectors.video.openLanguages);
  const intl = useIntl();
  const [localLang, setLocalLang] = React.useState(language);
  const input = fileInput({ onAddFile: hooks.addFileCallback({ dispatch: useDispatch(), localLang }) });
  const onLanguageChange = hooks.onSelectLanguage({
    dispatch: useDispatch(),
    languageBeforeChange: localLang,
    setLocalLang,
    triggerupload: input.click,
  });

  const names = React.useMemo(() => in8lTranscriptLanguages(intl), [intl]);
  const [query, setQuery] = React.useState('');
  const options = languageOptions({ names, query, locale: intl.locale });
  const isOpen = (code) => openLanguages.some(row => row.includes(code));

  const getTitle = () => {
    if (Object.prototype.hasOwnProperty.call(videoTranscriptLanguages, language) && language !== 'placeholder') {
      return (
        <ActionRow>
          {names[language]}
          <ActionRow.Spacer />
          <Icon className="text-primary-500" src={Check} />
        </ActionRow>
      );
    }
    return (
      <ActionRow>
        {intl.formatMessage(messages.languageSelectPlaceholder)}
        <ActionRow.Spacer />
      </ActionRow>
    );
  };

  return (
    <>
      <Dropdown
        className="w-100 mb-2 tels-language-selector"
        onToggle={(open) => {
          if (!open) { setQuery(''); }
        }}
      >
        <Dropdown.Toggle
          iconAs={Button}
          aria-label={intl.formatMessage(messages.languageSelectLabel)}
          block
          id={`selectLanguage-form-${index}`}
          className="w-100"
          variant="outline-primary"
        >
          {getTitle()}
        </Dropdown.Toggle>
        <Dropdown.Menu className={`tels-language-selector__menu ${floatingMenuClass}`} {...menuProps}>
          <div className="tels-language-selector__search">
            <Form.Control
              autoFocus
              size="sm"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              leadingElement={<Icon src={Search} />}
              placeholder={intl.formatMessage(messages.languageSearchPlaceholder)}
              aria-label={intl.formatMessage(messages.languageSearchPlaceholder)}
            />
          </div>
          <div className="tels-language-selector__list" role="presentation">
            {options.map(({ code, name }) => {
              if (language === code) {
                return (
                  <Dropdown.Item key={code} className="tels-language-selector__item is-selected" aria-current="true">
                    {name}
                    <Icon className="text-primary-500" src={Check} />
                  </Dropdown.Item>
                );
              }
              if (isOpen(code)) {
                return (
                  <Dropdown.Item
                    key={code}
                    className="tels-language-selector__item"
                    onClick={() => onLanguageChange({ newLang: code })}
                  >
                    {name}
                  </Dropdown.Item>
                );
              }
              return (
                <Dropdown.Item key={code} className="tels-language-selector__item disabled" aria-disabled="true">
                  {name}
                </Dropdown.Item>
              );
            })}
            {options.length === 0 && (
              <p className="tels-language-selector__empty">
                {intl.formatMessage(messages.languageSearchEmpty)}
              </p>
            )}
          </div>
        </Dropdown.Menu>
      </Dropdown>
      <FileInput fileInput={input} acceptedFiles=".srt" />
    </>
  );
};

LanguageSelector.propTypes = {
  index: PropTypes.number.isRequired,
  language: PropTypes.string.isRequired,
};

export default LanguageSelector;
