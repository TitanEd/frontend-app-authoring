/*
 * Brand-coloured date / time inputs for TitanEd forms.
 *
 * Native <input type="date"> / <input type="time"> draw their pop-ups in the
 * browser's own blue and cannot take the brand colour. These wrappers use
 * react-datepicker (already a dependency; CSS imported in src/index.jsx) so the
 * selected day/time can use the brand colour from the brand package
 * (tels-brand-openedx overrides/_datepicker.scss); the app keeps only layout.
 * Values stay the same strings ('YYYY-MM-DD' / 'HH:MM'), so callers do not change.
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import DatePicker from 'react-datepicker';
import { Icon } from '@openedx/paragon';
import { Calendar, AccessTime } from '@openedx/paragon/icons';

const pad = (n) => String(n).padStart(2, '0');

const dateFromDay = (day) => {
  if (!day) { return null; }
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const dayFromDate = (date) => (
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
);

const dateFromTime = (time) => {
  if (!time) { return null; }
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const timeFromDate = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const TelsDateInput = ({
  id,
  name,
  value,
  min,
  max,
  onChange,
  onBlur,
  isInvalid,
  ariaDescribedBy,
  disabled,
  placeholder,
  inPortal,
}) => (
  <DatePicker
    id={id}
    name={name}
    selected={dateFromDay(value)}
    onChange={(date) => onChange(date ? dayFromDate(date) : '')}
    onBlur={onBlur}
    minDate={min ? dateFromDay(min) : undefined}
    maxDate={max ? dateFromDay(max) : undefined}
    dateFormat="P"
    disabled={disabled}
    placeholderText={placeholder}
    ariaDescribedBy={ariaDescribedBy}
    className={classNames('form-control', 'tels-picker__input', { 'is-invalid': isInvalid })}
    wrapperClassName="tels-picker"
    calendarClassName="tels-picker__calendar"
    showIcon
    icon={<Icon src={Calendar} />}
    toggleCalendarOnIconClick
    showPopperArrow={false}
    {...(inPortal ? { portalId: 'tels-picker-portal' } : { popperProps: { strategy: 'fixed' } })}
    autoComplete="off"
  />
);

TelsDateInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  value: PropTypes.string,
  min: PropTypes.string,
  max: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  isInvalid: PropTypes.bool,
  ariaDescribedBy: PropTypes.string,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  // false = render next to the input with a fixed-position pop-up (not clipped by an overflow parent, and clicks stay inside e.g. a dropdown menu).
  inPortal: PropTypes.bool,
};

TelsDateInput.defaultProps = {
  name: undefined,
  value: '',
  min: undefined,
  max: undefined,
  onChange: () => {},
  onBlur: undefined,
  isInvalid: false,
  ariaDescribedBy: undefined,
  disabled: false,
  placeholder: undefined,
  inPortal: true,
};

export const TelsTimeInput = ({
  id,
  name,
  value,
  min,
  onChange,
  onBlur,
  isInvalid,
  ariaDescribedBy,
  disabled,
  placeholder,
  step,
  timeCaption,
  inPortal,
}) => (
  <DatePicker
    id={id}
    name={name}
    selected={dateFromTime(value)}
    onChange={(date) => onChange(date ? timeFromDate(date) : '')}
    onBlur={onBlur}
    showTimeSelect
    showTimeSelectOnly
    timeIntervals={step}
    dateFormat="p"
    timeCaption={timeCaption}
    minTime={min ? dateFromTime(min) : undefined}
    maxTime={min ? dateFromTime('23:59') : undefined}
    disabled={disabled}
    placeholderText={placeholder}
    ariaDescribedBy={ariaDescribedBy}
    className={classNames('form-control', 'tels-picker__input', { 'is-invalid': isInvalid })}
    wrapperClassName="tels-picker"
    calendarClassName="tels-picker__calendar"
    showIcon
    icon={<Icon src={AccessTime} />}
    toggleCalendarOnIconClick
    showPopperArrow={false}
    {...(inPortal ? { portalId: 'tels-picker-portal' } : { popperProps: { strategy: 'fixed' } })}
    autoComplete="off"
  />
);

TelsTimeInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  value: PropTypes.string,
  min: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  isInvalid: PropTypes.bool,
  ariaDescribedBy: PropTypes.string,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  step: PropTypes.number,
  timeCaption: PropTypes.string,
  // false = render next to the input with a fixed-position pop-up (not clipped by an overflow parent, and clicks stay inside e.g. a dropdown menu).
  inPortal: PropTypes.bool,
};

TelsTimeInput.defaultProps = {
  name: undefined,
  value: '',
  min: undefined,
  onChange: () => {},
  onBlur: undefined,
  isInvalid: false,
  ariaDescribedBy: undefined,
  disabled: false,
  placeholder: undefined,
  step: 5,
  timeCaption: undefined,
  inPortal: true,
};
