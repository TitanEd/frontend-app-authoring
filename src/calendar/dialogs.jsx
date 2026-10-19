/*
 * Dialogs of the calendar: the details of an event (with its actions), the form of a course
 * event (course team) and "Export and subscribe". Same file in both forks.
 */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Alert, Button, Form, Icon, ModalDialog, StatefulButton,
} from '@openedx/paragon';
import {
  ContentCopy, Download, OpenInNew, Place, RssFeed, Schedule, School,
} from '@openedx/paragon/icons';

import {
  canJoin, dateInput, eventPayload, timeInput,
} from './dates';
import messages from './messages';
import { COURSE_EVENT_KINDS, TYPE_META, kindLabel } from './meta';
import { eventShape, useFormats } from './views';
import * as api from './api';

const ACTION_LABELS = {
  open_studio: messages.actionOpenStudio,
  join: messages.actionJoin,
  event_page: messages.actionEventPage,
  open_link: messages.actionOpenLink,
  updates: messages.actionUpdates,
};

export const EventDialog = ({
  event, audience, now, onClose, onEdit, onDeleted,
}) => {
  const { intl, whenLong } = useFormats();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => { setConfirm(false); setFailed(false); }, [event]);
  if (!event) { return null; }
  const meta = TYPE_META[event.type] || TYPE_META.course_event;
  const kind = kindLabel(intl, event);

  const label = (action) => {
    if (action.kind === 'open_course') {
      return intl.formatMessage(audience === 'instructor' ? messages.actionViewAsLearner : messages.actionOpenCourse);
    }
    if (action.kind === 'join' && event.kind === 'host') { return intl.formatMessage(messages.actionHost); }
    return intl.formatMessage(ACTION_LABELS[action.kind] || messages.actionOpenLink);
  };
  const joinOpen = event.type !== 'live_class' || canJoin(event, now);
  const ended = event.type === 'live_class' && (event.status === 'ended' || (event.endDate && event.endDate < now));
  const actions = (event.actions || []).filter((action) => !(action.kind === 'join' && ended));

  const remove = async (series) => {
    setBusy(true);
    setFailed(false);
    try {
      await api.deleteEvent(event.pk, series);
      onDeleted();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalDialog
      isOpen
      onClose={onClose}
      title={event.title}
      size="md"
      hasCloseButton
      closeLabel={intl.formatMessage(messages.close)}
      isFullscreenOnMobile
      className="tcal-dialog"
    >
      <ModalDialog.Header>
        <span className={`tcal-dialog__type tcal-type--${event.type}`}>
          <Icon src={meta.icon} size="sm" /> {intl.formatMessage(meta.label)}{kind ? ` · ${kind}` : ''}
        </span>
        <ModalDialog.Title as="h2">{event.title}</ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <dl className="tcal-facts">
          <div>
            <dt><Icon src={Schedule} size="sm" /> {intl.formatMessage(messages.detailWhen)}</dt>
            <dd>{whenLong(event)}</dd>
          </div>
          {event.course && (
            <div>
              <dt><Icon src={School} size="sm" /> {intl.formatMessage(messages.detailCourse)}</dt>
              <dd>{event.course}{event.section ? ` · ${event.section}` : ''}</dd>
            </div>
          )}
          {event.location && (
            <div>
              <dt><Icon src={Place} size="sm" /> {intl.formatMessage(messages.detailPlace)}</dt>
              <dd>{event.location}</dd>
            </div>
          )}
        </dl>
        <div className="tcal-row__tags">
          {event.hidden && <span className="tcal-tag tcal-tag--warn">{intl.formatMessage(messages.statusStaffOnly)}</span>}
          {event.status === 'ongoing' && <span className="tcal-tag tcal-tag--live">{intl.formatMessage(messages.statusLive)}</span>}
          {ended && <span className="tcal-tag">{intl.formatMessage(messages.statusEnded)}</span>}
          {event.registered && <span className="tcal-tag">{intl.formatMessage(messages.statusRegistered)}</span>}
          {event.series && <span className="tcal-tag">{intl.formatMessage(messages.statusSeries)}</span>}
        </div>
        {event.description && event.type !== 'assignment' && event.type !== 'exam' && (
          <div className="tcal-dialog__about">
            <h3>{intl.formatMessage(messages.detailAbout)}</h3>
            <p>{event.description}</p>
          </div>
        )}
        {event.type === 'live_class' && !ended && !joinOpen && (
          <p className="tcal-hint">{intl.formatMessage(messages.joinLater)}</p>
        )}
        {confirm && (
          <Alert variant="warning" className="tcal-confirm">
            <p>{intl.formatMessage(messages.deleteConfirm)}</p>
            <ActionRow>
              <Button variant="tertiary" onClick={() => setConfirm(false)} disabled={busy}>{intl.formatMessage(messages.cancel)}</Button>
              {event.series && (
                <Button variant="outline-danger" onClick={() => remove(true)} disabled={busy}>{intl.formatMessage(messages.deleteSeries)}</Button>
              )}
              <Button variant="danger" onClick={() => remove(false)} disabled={busy}>
                {intl.formatMessage(event.series ? messages.deleteOne : messages.delete)}
              </Button>
            </ActionRow>
          </Alert>
        )}
        {failed && <Alert variant="danger">{intl.formatMessage(messages.actionFailed)}</Alert>}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow className="tcal-dialog__actions">
          {event.editable && !confirm && (
            <>
              <Button variant="outline-danger" onClick={() => setConfirm(true)}>{intl.formatMessage(messages.delete)}</Button>
              <Button variant="outline-primary" onClick={() => onEdit(event)}>{intl.formatMessage(messages.edit)}</Button>
              <ActionRow.Spacer />
            </>
          )}
          {actions.map((action, index) => (
            <Button
              key={action.kind}
              variant={index === actions.length - 1 ? 'primary' : 'outline-primary'}
              href={action.url}
              target={action.kind === 'open_link' ? '_blank' : undefined}
              rel={action.kind === 'open_link' ? 'noopener noreferrer' : undefined}
              disabled={action.kind === 'join' && !joinOpen}
              iconAfter={action.kind === 'open_link' ? OpenInNew : undefined}
            >
              {label(action)}
            </Button>
          ))}
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

EventDialog.propTypes = {
  event: eventShape,
  audience: PropTypes.string.isRequired,
  now: PropTypes.instanceOf(Date).isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDeleted: PropTypes.func.isRequired,
};

EventDialog.defaultProps = { event: null };

const formFromEvent = (event, day, courses, course) => {
  if (event) {
    const end = event.endDate || event.startDate;
    return {
      course: event.course_id,
      title: event.title,
      kind: event.kind || 'other',
      allDay: Boolean(event.all_day),
      startDate: dateInput(event.startDate),
      startTime: timeInput(event.startDate),
      endDate: dateInput(event.all_day ? event.lastDay : end),
      endTime: timeInput(end),
      repeat: 0,
      location: event.location || '',
      url: event.link || '',
      description: event.description || '',
    };
  }
  const editable = courses.filter((entry) => entry.editable);
  const chosen = editable.find((entry) => entry.id === course) || (editable.length === 1 ? editable[0] : null);
  return {
    course: chosen ? chosen.id : '',
    title: '',
    kind: 'office_hours',
    allDay: false,
    startDate: dateInput(day),
    startTime: '10:00',
    endDate: dateInput(day),
    endTime: '11:00',
    repeat: 0,
    location: '',
    url: '',
    description: '',
  };
};

export const EventForm = ({
  event, day, courses, course, onClose, onSaved,
}) => {
  const { intl } = useFormats();
  const [form, setForm] = useState(() => formFromEvent(event, day, courses, course));
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('default');
  const set = (name) => (change) => {
    const value = change.target.type === 'checkbox' ? change.target.checked : change.target.value;
    setForm((current) => {
      const next = { ...current, [name]: value };
      // Moving the start moves an end that would come before it.
      if (name === 'startDate' && next.endDate < value) { next.endDate = value; }
      if (name === 'startTime' && next.startDate === next.endDate && next.endTime <= value) {
        const [hours, minutes] = value.split(':').map(Number);
        next.endTime = `${String(Math.min(23, hours + 1)).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      }
      return next;
    });
  };

  const submit = async (submitEvent) => {
    submitEvent.preventDefault();
    setState('pending');
    setErrors({});
    try {
      const saved = await api.saveEvent(eventPayload(form), event ? event.pk : null);
      setState('default');
      onSaved(saved);
    } catch (failure) {
      const answer = failure?.response?.data || {};
      setErrors(answer.errors || { form: answer.detail || intl.formatMessage(messages.actionFailed) });
      setState('default');
    }
  };

  const field = (name, label, control, help) => (
    <Form.Group controlId={`tcal-form-${name}`} isInvalid={Boolean(errors[name])} className="tcal-form__field">
      <Form.Label>{label}</Form.Label>
      {control}
      {help && !errors[name] && <Form.Text>{help}</Form.Text>}
      {errors[name] && <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>}
    </Form.Group>
  );
  const editable = courses.filter((entry) => entry.editable);
  const formTitle = intl.formatMessage(event ? messages.formEdit : messages.formNew);

  return (
    <ModalDialog
      isOpen
      onClose={onClose}
      title={formTitle}
      size="lg"
      hasCloseButton
      closeLabel={intl.formatMessage(messages.close)}
      isFullscreenOnMobile
      className="tcal-dialog"
    >
      <Form onSubmit={submit} noValidate>
        <ModalDialog.Header>
          <ModalDialog.Title as="h2">{formTitle}</ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          {(errors.form || Object.keys(errors).length > 0) && (
            <Alert variant="danger">{errors.form || intl.formatMessage(messages.formError)}</Alert>
          )}
          <div className="tcal-form">
            {!event && field(
              'course_id',
              intl.formatMessage(messages.formCourse), (
                <Form.Control as="select" value={form.course} onChange={set('course')} required>
                  <option value="">{intl.formatMessage(messages.formChooseCourse)}</option>
                  {editable.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
                </Form.Control>
              ),
            )}
            {field(
              'title',
              intl.formatMessage(messages.formTitle), (
                <Form.Control value={form.title} onChange={set('title')} maxLength={200} required />
              ),
            )}
            {field(
              'kind',
              intl.formatMessage(messages.formKind), (
                <Form.Control as="select" value={form.kind} onChange={set('kind')}>
                  {Object.entries(COURSE_EVENT_KINDS).map(([key, message]) => (
                    <option key={key} value={key}>{intl.formatMessage(message)}</option>
                  ))}
                </Form.Control>
              ),
            )}
            <Form.Checkbox checked={form.allDay} onChange={set('allDay')} className="tcal-form__wide">
              {intl.formatMessage(messages.formAllDay)}
            </Form.Checkbox>
            <fieldset className="tcal-form__when">
              <legend>{intl.formatMessage(messages.formStarts)}</legend>
              {field(
                'start',
                intl.formatMessage(messages.formDate), (
                  <Form.Control type="date" value={form.startDate} onChange={set('startDate')} required />
                ),
              )}
              {!form.allDay && field(
                'start_time',
                intl.formatMessage(messages.formTime), (
                  <Form.Control type="time" value={form.startTime} onChange={set('startTime')} required />
                ),
              )}
            </fieldset>
            <fieldset className="tcal-form__when">
              <legend>{intl.formatMessage(messages.formEnds)}</legend>
              {field(
                'end',
                intl.formatMessage(messages.formDate), (
                  <Form.Control type="date" value={form.endDate} min={form.startDate} onChange={set('endDate')} required />
                ),
              )}
              {!form.allDay && field(
                'end_time',
                intl.formatMessage(messages.formTime), (
                  <Form.Control type="time" value={form.endTime} onChange={set('endTime')} required />
                ),
              )}
            </fieldset>
            {!event && field(
              'repeat_weeks',
              intl.formatMessage(messages.formRepeat), (
                <Form.Control as="select" value={form.repeat} onChange={set('repeat')}>
                  <option value={0}>{intl.formatMessage(messages.formRepeatNone)}</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((count) => (
                    <option key={count} value={count}>{intl.formatMessage(messages.formRepeatWeeks, { count })}</option>
                  ))}
                </Form.Control>
              ),
            )}
            {field(
              'location',
              intl.formatMessage(messages.formPlace), (
                <Form.Control value={form.location} onChange={set('location')} maxLength={255} />
              ), intl.formatMessage(messages.formPlaceHelp),
            )}
            {field(
              'url',
              intl.formatMessage(messages.formLink), (
                <Form.Control type="url" value={form.url} onChange={set('url')} placeholder="https://" dir="ltr" />
              ), intl.formatMessage(messages.formLinkHelp),
            )}
            <div className="tcal-form__wide">
              {field(
                'description',
                intl.formatMessage(messages.formDescription), (
                  <Form.Control as="textarea" rows={4} value={form.description} onChange={set('description')} maxLength={5000} />
                ),
              )}
            </div>
            <p className="tcal-hint tcal-form__wide">{intl.formatMessage(messages.formVisible)}</p>
          </div>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <Button variant="tertiary" onClick={onClose}>{intl.formatMessage(messages.cancel)}</Button>
            <StatefulButton
              type="submit"
              variant="primary"
              state={state}
              labels={{
                default: intl.formatMessage(messages.formSave),
                pending: intl.formatMessage(messages.formSaving),
              }}
              disabledStates={['pending']}
            />
          </ActionRow>
        </ModalDialog.Footer>
      </Form>
    </ModalDialog>
  );
};

EventForm.propTypes = {
  event: eventShape,
  day: PropTypes.instanceOf(Date).isRequired,
  courses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string, name: PropTypes.string, editable: PropTypes.bool,
  })).isRequired,
  course: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

EventForm.defaultProps = { event: null, course: '' };

export const SubscribeDialog = ({ onClose, onDownload }) => {
  const { intl } = useFormats();
  const [url, setUrl] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [failed, setFailed] = useState('');
  useEffect(() => {
    api.getFeed().then(setUrl).catch(() => { setUrl(null); setFailed(intl.formatMessage(messages.actionFailed)); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const run = (work, failure = messages.actionFailed) => async () => {
    setBusy(true);
    setFailed('');
    setNote('');
    try { await work(); } catch { setFailed(intl.formatMessage(failure)); } finally { setBusy(false); }
  };
  const copy = run(async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.getElementById('tcal-feed-url');
      input.select();
      document.execCommand('copy');
    }
    setNote(intl.formatMessage(messages.feedCopied));
  });
  const download = run(onDownload, messages.downloadError);

  return (
    <ModalDialog
      isOpen
      onClose={onClose}
      title={intl.formatMessage(messages.subscribeTitle)}
      size="md"
      hasCloseButton
      closeLabel={intl.formatMessage(messages.close)}
      isFullscreenOnMobile
      className="tcal-dialog"
    >
      <ModalDialog.Header>
        <ModalDialog.Title as="h2">{intl.formatMessage(messages.subscribeTitle)}</ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <section className="tcal-sub">
          <h3><Icon src={Download} size="sm" /> {intl.formatMessage(messages.downloadTitle)}</h3>
          <p>{intl.formatMessage(messages.downloadHelp)}</p>
          <Button variant="outline-primary" onClick={download} disabled={busy} iconBefore={Download}>
            {intl.formatMessage(messages.download)}
          </Button>
        </section>
        <section className="tcal-sub">
          <h3><Icon src={RssFeed} size="sm" /> {intl.formatMessage(messages.feedTitle)}</h3>
          <p>{intl.formatMessage(messages.feedHelp)}</p>
          {url ? (
            <>
              <Form.Group controlId="tcal-feed-url">
                <Form.Label>{intl.formatMessage(messages.feedLabel)}</Form.Label>
                <div className="tcal-sub__copy">
                  <Form.Control readOnly value={url} dir="ltr" onFocus={(focus) => focus.target.select()} />
                  <Button variant="primary" onClick={copy} disabled={busy} iconBefore={ContentCopy}>
                    {intl.formatMessage(messages.feedCopy)}
                  </Button>
                </div>
              </Form.Group>
              <ActionRow className="tcal-sub__more">
                <Button variant="link" size="inline" onClick={run(async () => setUrl(await api.createFeed()))} disabled={busy}>
                  {intl.formatMessage(messages.feedRenew)}
                </Button>
                <Button variant="link" size="inline" className="text-danger" onClick={run(async () => { await api.deleteFeed(); setUrl(null); })} disabled={busy}>
                  {intl.formatMessage(messages.feedRemove)}
                </Button>
              </ActionRow>
              <p className="tcal-hint">{intl.formatMessage(messages.feedRenewHelp)}</p>
            </>
          ) : (
            <Button variant="primary" onClick={run(async () => setUrl(await api.createFeed()))} disabled={busy || url === undefined} iconBefore={RssFeed}>
              {intl.formatMessage(messages.feedCreate)}
            </Button>
          )}
          <p className="tcal-note" aria-live="polite">{note}</p>
          {failed && <Alert variant="danger">{failed}</Alert>}
        </section>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

SubscribeDialog.propTypes = { onClose: PropTypes.func.isRequired, onDownload: PropTypes.func.isRequired };
