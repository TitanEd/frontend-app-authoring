/*
 * The form to schedule a Zoom class, or to change one ("My Meetings" in Studio): course, title,
 * agenda, start, time zone, length, repeat (none, daily every N days, weekly every N weeks on
 * chosen days, monthly every N months on a day or on the Nth weekday; ending on a date or after
 * N classes, like Zoom) and the Zoom options the site allows.
 *
 * A class of a repeating meeting can be changed alone (date, time, length, agenda) or with the
 * whole series. The server checks everything again (control-hub zoom_integration/my_meetings.py)
 * and answers a message per field, shown under the field.
 */
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Alert,
  Button,
  Form,
  Icon,
  ModalDialog,
  Spinner,
} from '@openedx/paragon';
import { Repeat } from '@openedx/paragon/icons';

import { TelsDateInput, TelsTimeInput } from '../generic/tels-date-time-input/TelsDateTimeInput';

import messages from './messages';
import { ZOOM_WEEKDAYS, weekdayDate } from './meetingUtils';

const WEEKS = [[1, messages.week1], [2, messages.week2], [3, messages.week3], [4, messages.week4], [
  -1,
  messages.weekLast,
]];
const KINDS = [
  ['none', messages.formRepeatNone],
  ['daily', messages.formRepeatDaily],
  ['weekly', messages.formRepeatWeekly],
  ['monthly', messages.formRepeatMonthly],
];
const UNITS = { daily: messages.formUnitDays, weekly: messages.formUnitWeeks, monthly: messages.formUnitMonths };

const pad = (number) => String(number).padStart(2, '0');
const browserZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

// "YYYY-MM-DD" and "HH:MM" of the current moment in an IANA time zone (falls back to the browser zone).
const nowInZone = (zone) => {
  const partsOf = (timeZone) => {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    };
    if (timeZone) { options.timeZone = timeZone; }
    const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(new Date());
    const get = (type) => parts.find((part) => part.type === type)?.value;
    return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
  };
  try {
    return partsOf(zone);
  } catch {
    return partsOf();
  }
};

// Tomorrow at the next full hour, as the form shows it (in the chosen zone).
const defaultStart = (zone) => {
  const { date, time } = nowInZone(zone);
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + 1);
  const hour = Math.min(23, Number(time.slice(0, 2)) + 1);
  return {
    date: `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`,
    time: `${pad(hour)}:00`,
  };
};

const emptyForm = (options) => {
  const zones = (options?.time_zones || []).map((zone) => zone.value);
  const wanted = options?.default_time_zone || browserZone();
  const time_zone = zones.includes(wanted) ? wanted : 'UTC';
  const settings = {};
  Object.entries(options?.settings || {}).forEach(([key, value]) => {
    settings[key] = value.allowed && value.default;
  });
  return {
    course_id: options?.courses?.length === 1 ? options.courses[0].id : '',
    topic: '',
    agenda: '',
    ...defaultStart(time_zone),
    time_zone,
    duration: Math.min(60, options?.max_duration || 60),
    recurrence: {
      type: 'none',
      interval: 1,
      weekly_days: [],
      monthly_mode: 'day',
      monthly_day: 1,
      monthly_week: 1,
      monthly_week_day: 2,
      end_mode: 'count',
      end_times: 4,
      end_date: '',
    },
    settings,
  };
};

const fromDetail = (detail, options) => {
  const base = emptyForm(options);
  const [date, time] = (detail.start || '').split('T');
  return {
    ...base,
    course_id: detail.course_id,
    topic: detail.topic,
    agenda: detail.agenda || '',
    date,
    time,
    time_zone: detail.time_zone,
    duration: detail.duration,
    recurrence: { ...base.recurrence, ...detail.recurrence, weekly_days: detail.recurrence.weekly_days || [] },
    settings: { ...base.settings, ...detail.settings },
  };
};

const ScheduleMeetingModal = ({
  isOpen,
  onClose,
  onSaved,
  options,
  editing,
}) => {
  const intl = useIntl();
  const recurringEdit = Boolean(editing && editing.is_recurring);
  const [scope, setScope] = useState(recurringEdit ? 'single' : 'series');
  const [form, setForm] = useState(() => emptyForm(options));
  const [loadedStart, setLoadedStart] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const single = scope === 'single';

  useEffect(() => {
    if (!isOpen) { return; }
    setErrors({});
    setMessage('');
    if (!editing) {
      setForm(emptyForm(options));
      setLoadedStart('');
      return;
    }
    setLoading(true);
    const params = single ? { occurrence: editing.id } : {};
    getAuthenticatedHttpClient()
      .get(`${getConfig().LMS_BASE_URL}/titaned/api/v2/meetings/${editing.meeting_id}/`, { params })
      .then(({ data }) => {
        const next = fromDetail(data.meeting, options);
        setForm(next);
        setLoadedStart(`${next.date}T${next.time}`);
      })
      .catch((error) => setMessage(error?.response?.data?.message || intl.formatMessage(messages.actionFailed)))
      .finally(() => setLoading(false));
  }, [isOpen, editing, scope]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setScope(recurringEdit ? 'single' : 'series');
  }, [editing, recurringEdit]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setRule = (key, value) =>
    setForm((current) => ({ ...current, recurrence: { ...current.recurrence, [key]: value } }));
  const setOption = (key, value) =>
    setForm((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));
  const toggleDay = (day) => {
    const days = form.recurrence.weekly_days.includes(day)
      ? form.recurrence.weekly_days.filter((value) => value !== day)
      : [...form.recurrence.weekly_days, day].sort();
    setRule('weekly_days', days);
  };

  const weekday = (day, style = 'short') => intl.formatDate(weekdayDate(day), { weekday: style });
  const rule = form.recurrence;
  const summary = useMemo(() => {
    if (rule.type === 'none') { return intl.formatMessage(messages.summaryOnce); }
    const interval = Number(rule.interval) || 1;
    let base;
    if (rule.type === 'daily') { base = intl.formatMessage(messages.summaryDaily, { interval }); }
    if (rule.type === 'weekly') {
      const days = rule.weekly_days.length
        ? intl.formatList(rule.weekly_days.map((day) => weekday(day, 'long')), { type: 'conjunction' })
        : '…';
      base = intl.formatMessage(messages.summaryWeekly, { interval, days });
    }
    if (rule.type === 'monthly') {
      base = rule.monthly_mode === 'day'
        ? intl.formatMessage(messages.summaryMonthlyDay, { interval, day: rule.monthly_day })
        : intl.formatMessage(messages.summaryMonthlyWeek, {
          interval,
          week: intl.formatMessage(WEEKS.find(([value]) => value === Number(rule.monthly_week))[1]),
          weekday: weekday(Number(rule.monthly_week_day), 'long'),
        });
    }
    if (rule.end_mode === 'date') {
      return rule.end_date
        ? intl.formatMessage(messages.summaryUntil, {
          base,
          date: intl.formatDate(new Date(`${rule.end_date}T12:00:00`), { dateStyle: 'medium' }),
        })
        : base;
    }
    return intl.formatMessage(messages.summaryTimes, { base, count: Number(rule.end_times) || 0 });
  }, [rule, intl]); // eslint-disable-line react-hooks/exhaustive-deps

  const { zoneNow, start, pastStart } = useMemo(() => {
    const zoneNow = nowInZone(form.time_zone);
    const start = `${form.date}T${form.time}`;
    const pastStart = Boolean(form.date && form.time)
      && start !== loadedStart
      && start < `${zoneNow.date}T${zoneNow.time}`;
    return { zoneNow, start, pastStart };
  }, [form.time_zone, form.date, form.time, loadedStart]);
  const zoneLabel = (options?.time_zones || []).find((zone) => zone.value === form.time_zone)?.label || form.time_zone;

  const submit = (event) => {
    event.preventDefault();
    const missing = {};
    const required = single
      ? ['date', 'time', 'duration']
      : ['course_id', 'topic', 'date', 'time', 'time_zone', 'duration'];
    required.forEach((key) => {
      if (!String(form[key] ?? '').trim()) {
        missing[key === 'date' || key === 'time' ? 'start' : key] = intl.formatMessage(messages.formRequired);
      }
    });
    if (Object.keys(missing).length) {
      setErrors(missing);
      setMessage(intl.formatMessage(messages.formFixErrors));
      return;
    }
    if (pastStart) {
      setErrors({ start: intl.formatMessage(messages.formPastStart, { zone: zoneLabel }) });
      setMessage(intl.formatMessage(messages.formFixErrors));
      return;
    }
    const body = {
      course_id: form.course_id,
      topic: form.topic,
      agenda: form.agenda,
      start: `${form.date}T${form.time}`,
      time_zone: form.time_zone,
      duration: Number(form.duration),
      recurrence: {
        ...rule,
        interval: Number(rule.interval),
        monthly_day: Number(rule.monthly_day),
        monthly_week: Number(rule.monthly_week),
        monthly_week_day: Number(rule.monthly_week_day),
        end_times: Number(rule.end_times),
      },
      settings: form.settings,
    };
    if (editing && single) { body.occurrence_id = editing.id; }
    const client = getAuthenticatedHttpClient();
    const base = `${getConfig().LMS_BASE_URL}/titaned/api/v2/meetings/`;
    setSaving(true);
    setErrors({});
    setMessage('');
    (editing ? client.put(`${base}${editing.meeting_id}/`, body) : client.post(base, body))
      .then(() => {
        setSaving(false);
        onSaved();
      })
      .catch((error) => {
        setSaving(false);
        const data = error?.response?.data || {};
        setErrors(data.errors || {});
        setMessage(data.message || intl.formatMessage(messages.actionFailed));
      });
  };

  const fieldError = (
    key,
  ) => (errors[key] ? <div className="mtg-form__error" id={`mtg-${key}-error`}>{errors[key]}</div> : null);
  const invalid = (key) => ({
    isInvalid: Boolean(errors[key]),
    'aria-describedby': errors[key] ? `mtg-${key}-error` : undefined,
  });
  const allowed = options?.settings || {};
  const noCourses = !editing && options && options.courses.length === 0;
  const occurrenceDate = editing ? intl.formatDate(new Date(editing.start), { dateStyle: 'medium' }) : '';

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title={intl.formatMessage(editing ? messages.formEditTitle : messages.formNewTitle)}
      size="lg"
      hasCloseButton
      isFullscreenOnMobile
      className="mtg-modal"
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage(editing ? messages.formEditTitle : messages.formNewTitle)}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {loading || !options ?
          (
            <div className="mtg-state">
              <Spinner animation="border" variant="primary" screenReaderText={intl.formatMessage(messages.loading)} />
            </div>
          ) :
          (
            <form id="mtg-schedule-form" className="mtg-form" onSubmit={submit} noValidate>
              {message && <Alert variant="danger" role="alert">{message}</Alert>}
              {noCourses && <Alert variant="warning">{intl.formatMessage(messages.formNoCourses)}</Alert>}

              {recurringEdit && (
                <fieldset>
                  <legend>{intl.formatMessage(messages.formScope)}</legend>
                  <div className="mtg-scope">
                    <button type="button" aria-pressed={single} onClick={() => setScope('single')}>
                      <strong>{intl.formatMessage(messages.formScopeOne)}</strong>
                      <small>{intl.formatMessage(messages.formScopeOneHelp, { date: occurrenceDate })}</small>
                    </button>
                    <button type="button" aria-pressed={!single} onClick={() => setScope('series')}>
                      <strong>{intl.formatMessage(messages.formScopeSeries)}</strong>
                      <small>{intl.formatMessage(messages.formScopeSeriesHelp)}</small>
                    </button>
                  </div>
                </fieldset>
              )}

              <div className="mtg-form__row">
                <Form.Group controlId="mtg-f-course">
                  <Form.Label>{intl.formatMessage(messages.formCourse)}</Form.Label>
                  <Form.Control
                    as="select"
                    value={form.course_id}
                    disabled={Boolean(editing)}
                    onChange={(event) => set('course_id', event.target.value)}
                    {...invalid('course_id')}
                  >
                    <option value="">{intl.formatMessage(messages.formChooseCourse)}</option>
                    {(options.courses || []).map((course) => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                    {editing && !options.courses.some((course) => course.id === form.course_id) && (
                      <option value={form.course_id}>{editing.course || form.course_id}</option>
                    )}
                  </Form.Control>
                  {fieldError('course_id')}
                </Form.Group>
                <Form.Group controlId="mtg-f-topic">
                  <Form.Label>{intl.formatMessage(messages.formTopic)}</Form.Label>
                  <Form.Control
                    value={form.topic}
                    maxLength={200}
                    disabled={single}
                    placeholder={intl.formatMessage(messages.placeholderTopic)}
                    onChange={(event) => set('topic', event.target.value)}
                    {...invalid('topic')}
                  />
                  <Form.Text>{intl.formatMessage(messages.formTopicHelp)}</Form.Text>
                  {fieldError('topic')}
                </Form.Group>
              </div>

              <Form.Group controlId="mtg-f-agenda">
                <Form.Label>{intl.formatMessage(messages.formAgenda)}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  maxLength={2000}
                  value={form.agenda}
                  placeholder={intl.formatMessage(messages.placeholderAgenda)}
                  onChange={(event) => set('agenda', event.target.value)}
                  {...invalid('agenda')}
                />
                {fieldError('agenda')}
              </Form.Group>

              <div className="mtg-form__row">
                <Form.Group controlId="mtg-f-date">
                  <Form.Label>{intl.formatMessage(messages.formDate)}</Form.Label>
                  <TelsDateInput
                    id="mtg-f-date"
                    value={form.date}
                    min={start === loadedStart ? undefined : zoneNow.date}
                    onChange={(next) => set('date', next)}
                    placeholder={intl.formatMessage(messages.placeholderDate)}
                    isInvalid={Boolean(errors.start || pastStart)}
                    ariaDescribedBy={pastStart || errors.start ? 'mtg-start-error' : undefined}
                  />
                </Form.Group>
                <Form.Group controlId="mtg-f-time">
                  <Form.Label>{intl.formatMessage(messages.formTime)}</Form.Label>
                  <TelsTimeInput
                    id="mtg-f-time"
                    value={form.time}
                    step={5}
                    min={form.date === zoneNow.date && start !== loadedStart ? zoneNow.time : undefined}
                    onChange={(next) => set('time', next)}
                    placeholder={intl.formatMessage(messages.placeholderTime)}
                    isInvalid={Boolean(errors.start || pastStart)}
                    ariaDescribedBy={pastStart || errors.start ? 'mtg-start-error' : undefined}
                    timeCaption={intl.formatMessage(messages.formTime)}
                  />
                </Form.Group>
                <Form.Group controlId="mtg-f-duration">
                  <Form.Label>{intl.formatMessage(messages.formDuration)}</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    max={options.max_duration}
                    step={5}
                    value={form.duration}
                    placeholder={intl.formatMessage(messages.placeholderDuration)}
                    onChange={(event) => set('duration', event.target.value)}
                    {...invalid('duration')}
                  />
                  <Form.Text>
                    {intl.formatMessage(messages.formDurationHelp, { count: options.max_duration })}
                  </Form.Text>
                  {fieldError('duration')}
                </Form.Group>
              </div>
              {pastStart ?
                (
                  <div className="mtg-form__error" id="mtg-start-error">
                    {intl.formatMessage(messages.formPastStart, { zone: zoneLabel })}
                  </div>
                ) :
                fieldError('start')}

              <Form.Group controlId="mtg-f-zone">
                <Form.Label>{intl.formatMessage(messages.formTimeZone)}</Form.Label>
                <Form.Control
                  as="select"
                  value={form.time_zone}
                  disabled={single}
                  onChange={(event) => set('time_zone', event.target.value)}
                  {...invalid('time_zone')}
                >
                  {(options.time_zones || []).map((zone) => (
                    <option key={zone.value} value={zone.value}>{zone.label}</option>
                  ))}
                </Form.Control>
                {fieldError('time_zone')}
              </Form.Group>

              {!single && (
                <fieldset>
                  <legend>{intl.formatMessage(messages.formRepeat)}</legend>
                  <Form.Group controlId="mtg-f-repeat">
                    <Form.Label className="sr-only">{intl.formatMessage(messages.formRepeat)}</Form.Label>
                    <Form.Control
                      as="select"
                      value={rule.type}
                      onChange={(event) => setRule('type', event.target.value)}
                      {...invalid('recurrence')}
                    >
                      {KINDS.map(([value, label]) => (
                        <option key={value} value={value}>{intl.formatMessage(label)}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>

                  {rule.type !== 'none' && (
                    <>
                      <div className="mtg-form__inline">
                        <label htmlFor="mtg-f-interval">{intl.formatMessage(messages.formEvery)}</label>
                        <Form.Control
                          id="mtg-f-interval"
                          type="number"
                          min={1}
                          max={options.interval_max?.[rule.type] || 99}
                          value={rule.interval}
                          placeholder={intl.formatMessage(messages.placeholderInterval)}
                          onChange={(event) => setRule('interval', event.target.value)}
                          {...invalid('interval')}
                        />
                        <span>{intl.formatMessage(UNITS[rule.type], { count: Number(rule.interval) || 1 })}</span>
                      </div>
                      {fieldError('interval')}

                      {rule.type === 'weekly' && (
                        <div role="group" aria-label={intl.formatMessage(messages.formOn)}>
                          <div className="mtg-form__inline">
                            <span>{intl.formatMessage(messages.formOn)}</span>
                          </div>
                          <div className="mtg-weekdays">
                            {ZOOM_WEEKDAYS.map((day) => (
                              <button
                                type="button"
                                key={day}
                                aria-pressed={rule.weekly_days.includes(day)}
                                aria-label={weekday(day, 'long')}
                                onClick={() => toggleDay(day)}
                              >
                                {weekday(day)}
                              </button>
                            ))}
                          </div>
                          {fieldError('weekly_days')}
                        </div>
                      )}

                      {rule.type === 'monthly' && (
                        <div className="mtg-choice" role="radiogroup" aria-label={intl.formatMessage(messages.formOn)}>
                          <label htmlFor="mtg-f-mday">
                            <input
                              type="radio"
                              name="mtg-monthly"
                              checked={rule.monthly_mode === 'day'}
                              onChange={() =>
                                setRule('monthly_mode', 'day')}
                            />
                            {intl.formatMessage(messages.formMonthlyDay)}
                            <Form.Control
                              as="select"
                              id="mtg-f-mday"
                              value={rule.monthly_day}
                              disabled={rule.monthly_mode !== 'day'}
                              onChange={(event) =>
                                setRule('monthly_day', event.target.value)}
                              {...invalid('monthly_day')}
                            >
                              {Array.from({ length: 31 }, (_, index) =>
                                index + 1).map((day) => (
                                  <option key={day} value={day}>{intl.formatNumber(day)}</option>
                                ))}
                            </Form.Control>
                            {intl.formatMessage(messages.formMonthlyDayOf)}
                          </label>
                          <label htmlFor="mtg-f-mweek">
                            <input
                              type="radio"
                              name="mtg-monthly"
                              checked={rule.monthly_mode === 'week'}
                              onChange={() => setRule('monthly_mode', 'week')}
                            />
                            {intl.formatMessage(messages.formMonthlyThe)}
                            <Form.Control
                              as="select"
                              id="mtg-f-mweek"
                              value={rule.monthly_week}
                              disabled={rule.monthly_mode !== 'week'}
                              onChange={(event) => setRule('monthly_week', event.target.value)}
                            >
                              {WEEKS.map(([value, label]) => (
                                <option key={value} value={value}>{intl.formatMessage(label)}</option>
                              ))}
                            </Form.Control>
                            <Form.Control
                              as="select"
                              aria-label={intl.formatMessage(messages.formOn)}
                              value={rule.monthly_week_day}
                              disabled={rule.monthly_mode !== 'week'}
                              onChange={(event) => setRule('monthly_week_day', event.target.value)}
                            >
                              {ZOOM_WEEKDAYS.map((day) => (
                                <option key={day} value={day}>{weekday(day, 'long')}</option>
                              ))}
                            </Form.Control>
                          </label>
                          {fieldError('monthly_day')}
                          {fieldError('monthly_week')}
                          {fieldError('monthly_week_day')}
                        </div>
                      )}

                      <div className="mtg-choice" role="radiogroup" aria-label={intl.formatMessage(messages.formEnds)}>
                        <strong>{intl.formatMessage(messages.formEnds)}</strong>
                        <label htmlFor="mtg-f-endtimes">
                          <input
                            type="radio"
                            name="mtg-end"
                            checked={rule.end_mode === 'count'}
                            onChange={() => setRule('end_mode', 'count')}
                          />
                          {intl.formatMessage(messages.formEndsAfter)}
                          <Form.Control
                            id="mtg-f-endtimes"
                            type="number"
                            min={2}
                            max={options.max_occurrences || 60}
                            value={rule.end_times}
                            disabled={rule.end_mode !== 'count'}
                            placeholder={intl.formatMessage(messages.placeholderTimes)}
                            onChange={(event) => setRule('end_times', event.target.value)}
                            {...invalid('end_times')}
                          />
                          {intl.formatMessage(messages.formTimes, { count: Number(rule.end_times) || 2 })}
                        </label>
                        <label htmlFor="mtg-f-enddate">
                          <input
                            type="radio"
                            name="mtg-end"
                            checked={rule.end_mode === 'date'}
                            onChange={() => setRule('end_mode', 'date')}
                          />
                          {intl.formatMessage(messages.formEndsOn)}
                          <TelsDateInput
                            id="mtg-f-enddate"
                            value={rule.end_date}
                            min={form.date}
                            disabled={rule.end_mode !== 'date'}
                            onChange={(next) => setRule('end_date', next)}
                            placeholder={intl.formatMessage(messages.placeholderEndDate)}
                            isInvalid={Boolean(errors.end_date)}
                            ariaDescribedBy={errors.end_date ? 'mtg-end_date-error' : undefined}
                          />
                        </label>
                        {fieldError('end_times')}
                        {fieldError('end_date')}
                      </div>
                    </>
                  )}
                  <div className="mtg-form__summary" aria-live="polite">
                    <Icon src={Repeat} size="sm" /> {summary}
                  </div>
                </fieldset>
              )}

              {!single && Object.values(allowed).some((value) => value.allowed) && (
                <fieldset>
                  <legend>{intl.formatMessage(messages.formOptions)}</legend>
                  <div className="mtg-form__switches">
                    {[
                      ['waiting_room', messages.formWaitingRoom],
                      ['mute_upon_entry', messages.formMute],
                      ['auto_recording', messages.formRecord],
                      ['participant_video', messages.formVideo],
                    ].filter(([key]) => allowed[key]?.allowed).map(([key, label]) => (
                      <Form.Switch
                        key={key}
                        checked={Boolean(form.settings[key])}
                        onChange={(event) => setOption(key, event.target.checked)}
                      >
                        {intl.formatMessage(label)}
                      </Form.Switch>
                    ))}
                  </div>
                </fieldset>
              )}
              <p className="mtg-note">{intl.formatMessage(messages.formNotifyNote)}</p>
            </form>
          )}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            {intl.formatMessage(messages.formCancel)}
          </ModalDialog.CloseButton>
          <Button type="submit" form="mtg-schedule-form" disabled={saving || loading || noCourses}>
            {saving && <Spinner animation="border" size="sm" className="me-2" screenReaderText="" />}
            {intl.formatMessage(
              saving ? messages.formSaving : (editing ? messages.formSaveChanges : messages.formSave),
            )}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

ScheduleMeetingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
  options: PropTypes.shape({
    courses: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })),
    time_zones: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, label: PropTypes.string })),
    default_time_zone: PropTypes.string,
    max_duration: PropTypes.number,
    max_occurrences: PropTypes.number,
    interval_max: PropTypes.objectOf(PropTypes.number),
    settings: PropTypes.objectOf(PropTypes.shape({ allowed: PropTypes.bool, default: PropTypes.bool })),
  }),
  editing: PropTypes.shape({
    id: PropTypes.string,
    meeting_id: PropTypes.string,
    is_recurring: PropTypes.bool,
    start: PropTypes.string,
    course: PropTypes.string,
  }),
};

ScheduleMeetingModal.defaultProps = { options: null, editing: null };

export default ScheduleMeetingModal;
