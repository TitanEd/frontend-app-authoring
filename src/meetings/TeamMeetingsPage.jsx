/*
 * "My Meetings" in Studio: the Zoom live classes of every course the person teaches (platform
 * staff: every course), one row per class. Schedule a class (ScheduleMeetingModal), start it as
 * the host, change it (one class or the whole series), cancel it (one class or the series),
 * delete it, see the attendance and the recording of a past class, add it to a calendar.
 * Tabs Live now / Upcoming / Past; filters course, status, date, repeating or one-off, search.
 *
 * Data: GET {LMS}/titaned/api/v2/my-meetings/teaching/ and …/teaching/options/, writes on
 * {LMS}/titaned/api/v2/meetings/ (control-hub zoom_integration/my_meetings_views.py); the
 * attendance and recordings come from the existing live-classes APIs. The stylesheet and
 * meetingUtils.js are the ones of the learner page.
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Alert,
  Button,
  Container,
  Dropdown,
  Form,
  Icon,
  IconButton,
  ModalDialog,
  Pagination,
  Spinner,
  Toast,
} from '@openedx/paragon';
import {
  Add,
  Cancel,
  CheckCircle,
  ContentCopy,
  Delete,
  Download,
  Edit,
  EventAvailable,
  MoreVert,
  OndemandVideo,
  People,
  Person,
  PlayCircle,
  Repeat,
  Schedule,
  Search,
  VideoCall,
} from '@openedx/paragon/icons';

import messages from './messages';
import ScheduleMeetingModal from './ScheduleMeetingModal';
import {
  PAGE_SIZE,
  daysAway,
  downloadIcs,
  groupByDay,
  inPeriod,
  matchesText,
  paginateGroups,
  prepare,
  rangeParams,
  tabOf,
  zoneNameOf,
} from './meetingUtils';
import './style.scss';

const STATUSES = {
  upcoming: { icon: Schedule, label: messages.statusUpcoming },
  live: { icon: VideoCall, label: messages.statusLive },
  ended: { icon: CheckCircle, label: messages.statusEnded },
  cancelled: { icon: Cancel, label: messages.statusCancelled },
};
const TABS = [
  ['live', messages.tabLive, VideoCall],
  ['upcoming', messages.tabUpcoming, Schedule],
  ['past', messages.tabPast, EventAvailable],
];
const EMPTY = {
  live: [messages.emptyLiveTitle, messages.emptyLiveText],
  upcoming: [messages.emptyUpcomingTitle, messages.emptyUpcomingText],
  past: [messages.emptyPastTitle, messages.emptyPastText],
};
const lms = () => getConfig().LMS_BASE_URL;

const AttendanceModal = ({ item, onClose }) => {
  const intl = useIntl();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState('');
  const url = item ? `${lms()}/api/v1/live-classes/attendance/${item.meeting_id}/${item.id}/` : '';
  useEffect(() => {
    if (!item) { return; }
    setData(null);
    setFailed('');
    getAuthenticatedHttpClient().get(url)
      .then((response) => setData(response.data))
      .catch((error) => setFailed(error?.response?.data?.error || intl.formatMessage(messages.attendanceFailed)));
  }, [item]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!item) { return null; }
  const title = intl.formatMessage(messages.attendanceTitle, { topic: item.topic });
  let body;
  if (failed) {
    body = <Alert variant="danger">{failed}</Alert>;
  } else if (!data) {
    body = (
      <div className="mtg-state">
        <Spinner
          animation="border"
          variant="primary"
          screenReaderText={intl.formatMessage(messages.attendanceLoading)}
        />
      </div>
    );
  } else {
    const people = data.participants || [];
    body = (
      <>
        {data.message && <p className="mtg-note">{data.message}</p>}
        {data.summary && (
          <p>
            <strong>
              {intl.formatMessage(messages.attendanceJoined, {
                joined: data.summary.joined || 0,
                total: data.summary.total_attendees || 0,
              })}
            </strong>
          </p>
        )}
        {people.length === 0 ? <p>{intl.formatMessage(messages.attendanceEmpty)}</p> : (
          <div className="mtg-table-wrap">
            <table className="mtg-attendance">
              <thead>
                <tr>
                  <th scope="col">{intl.formatMessage(messages.attendanceName)}</th>
                  <th scope="col">{intl.formatMessage(messages.attendanceEmail)}</th>
                  <th scope="col">{intl.formatMessage(messages.attendanceStatus)}</th>
                  <th scope="col">{intl.formatMessage(messages.attendanceDuration)}</th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr key={`${person.email}-${person.id}`}>
                    <td>{person.name}</td>
                    <td>{person.email}</td>
                    <td>{person.status}</td>
                    <td>{person.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  }
  return (
    <ModalDialog
      isOpen
      onClose={onClose}
      title={title}
      size="lg"
      hasCloseButton
      isFullscreenOnMobile
      className="mtg-modal"
    >
      <ModalDialog.Header>
        <ModalDialog.Title>{title}</ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>{body}</ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          {data && (data.participants || []).length > 0 && (
            <Button variant="outline-primary" iconBefore={Download} href={`${url}?download=1`}>
              {intl.formatMessage(messages.attendanceDownload)}
            </Button>
          )}
          <ModalDialog.CloseButton variant="primary">{intl.formatMessage(messages.close)}</ModalDialog.CloseButton>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

AttendanceModal.propTypes = {
  item: PropTypes.shape({ id: PropTypes.string, meeting_id: PropTypes.string, topic: PropTypes.string }),
  onClose: PropTypes.func.isRequired,
};
AttendanceModal.defaultProps = { item: null };

const TeamMeetingsPage = () => {
  const intl = useIntl();
  const [data, setData] = useState(null);
  const [options, setOptions] = useState(null);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState('');
  const [course, setCourse] = useState('');
  const [status, setStatus] = useState('');
  const [period, setPeriod] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [kind, setKind] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [now, setNow] = useState(() => new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null); // { kind: 'cancel' | 'delete', item }
  const [cancelScope, setCancelScope] = useState('single');
  const [busy, setBusy] = useState(false);
  const [attendance, setAttendance] = useState(null);
  const [toast, setToast] = useState('');
  const [recordingNote, setRecordingNote] = useState({});
  const listTop = useRef(null);

  const params = useMemo(() => rangeParams(period, from, to), [period, from, to]);
  const load = useCallback(() => {
    setFailed(false);
    return getAuthenticatedHttpClient()
      .get(`${lms()}/titaned/api/v2/my-meetings/teaching/`, { params })
      .then((response) => {
        setData(response.data);
        setNow(new Date());
      })
      .catch((error) => setFailed(error?.response?.status === 403 ? 'unavailable' : true));
  }, [params]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    getAuthenticatedHttpClient().get(`${lms()}/titaned/api/v2/my-meetings/teaching/options/`)
      .then((response) => setOptions(response.data))
      .catch(() =>
        setOptions({
          courses: [],
          time_zones: [{ value: 'UTC', label: 'UTC' }],
          settings: {},
          max_duration: 60,
        })
      );
  }, []);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const timeZone = data?.time_zone || '';
  const zone = timeZone || undefined;
  const items = useMemo(() => (data ? prepare(data.items, now) : []), [data, now]);
  const time = (date) => intl.formatTime(date, { hour: 'numeric', minute: '2-digit', timeZone: zone });
  const dayLabel = (date) => {
    const away = daysAway(date, now, timeZone);
    if (away === 0) { return intl.formatMessage(messages.today); }
    if (away === 1) { return intl.formatMessage(messages.tomorrow); }
    if (away === -1) { return intl.formatMessage(messages.yesterday); }
    return intl.formatDate(date, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: zone,
    });
  };
  const range = (item) =>
    `${time(item.startDate)} – ${
      intl.formatTime(item.endDate, {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: zone,
        timeZoneName: 'short',
      })
    }`;
  const zoneName = zoneNameOf(intl.locale, timeZone, now);

  const scoped = useMemo(() => {
    const text = query.trim().toLowerCase();
    return items.filter((item) =>
      (!course || item.course_id === course)
      && (!status || item.status === status)
      && (!kind || (kind === 'recurring') === item.is_recurring)
      && inPeriod(item.startDate, period, now, timeZone, from, to)
      && matchesText(item, text)
    );
  }, [items, course, status, kind, period, from, to, query, now, timeZone]);
  const counts = useMemo(() =>
    scoped.reduce((all, item) => {
      const key = tabOf(item, now);
      return { ...all, [key]: (all[key] || 0) + 1 };
    }, {}), [scoped, now]);
  const shownTab = tab || (counts.live ? 'live' : 'upcoming');
  const shown = useMemo(() => scoped.filter((item) => tabOf(item, now) === shownTab), [scoped, shownTab, now]);
  const groups = useMemo(() => groupByDay(shown, timeZone, shownTab === 'past'), [shown, timeZone, shownTab]);
  useEffect(() => {
    setPage(1);
  }, [shownTab, course, status, kind, period, from, to, query]);
  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageGroups = useMemo(() => paginateGroups(groups, currentPage), [groups, currentPage]);
  const goToPage = (number) => {
    setPage(number);
    if (listTop.current) { listTop.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  };

  const icsLabels = {
    joinLabel: intl.formatMessage(messages.calendarJoin),
    courseLabel: intl.formatMessage(messages.calendarCourse),
  };
  const filtered = Boolean(course || status || kind || period || query.trim());
  const clear = () => {
    setCourse('');
    setStatus('');
    setKind('');
    setPeriod('');
    setFrom('');
    setTo('');
    setQuery('');
  };
  const courseChoices = useMemo(() => {
    const all = new Map((data?.courses || []).map((entry) => [entry.id, entry.name]));
    (options?.courses || []).forEach((entry) => {
      if (!all.has(entry.id)) { all.set(entry.id, entry.name); }
    });
    return [...all.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [data, options]);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (item) => {
    setEditing(item);
    setFormOpen(true);
  };
  const saved = () => {
    setFormOpen(false);
    setEditing(null);
    setToast(intl.formatMessage(messages.saved));
    load();
  };

  const startClass = (item) => {
    // The window is opened at once (a click), then sent to Zoom's start link.
    const win = window.open('', '_blank');
    getAuthenticatedHttpClient().post(`${lms()}/titaned/api/v2/meetings/${item.meeting_id}/start/`, {})
      .then(({ data: answer }) => {
        if (win) {
          win.opener = null;
          win.location.href = answer.start_url;
        } else { window.location.href = answer.start_url; }
      })
      .catch((error) => {
        if (win) { win.close(); }
        setToast(error?.response?.data?.message || intl.formatMessage(messages.startFailed));
      });
  };
  const copyLink = (item) => {
    navigator.clipboard?.writeText(item.join_url).then(() => setToast(intl.formatMessage(messages.copied)));
  };
  const lookRecording = (item) => {
    if (item.recording_url) {
      window.open(item.recording_url, '_blank', 'noopener');
      return;
    }
    setRecordingNote((notes) => ({ ...notes, [item.id]: intl.formatMessage(messages.recordingLoading) }));
    getAuthenticatedHttpClient().get(`${lms()}/api/v1/live-classes/recordings/${item.meeting_id}/`)
      .then(({ data: answer }) => {
        const found = (answer.recordings || [])
          .find((entry) => !entry.occurrence_internal_id || entry.occurrence_internal_id === item.id) ||
          (answer.recordings || [])[0];
        if (answer.success && found?.play_url) {
          window.open(found.play_url, '_blank', 'noopener');
          setRecordingNote((notes) => ({ ...notes, [item.id]: '' }));
        } else {
          setRecordingNote((notes) => ({
            ...notes,
            [item.id]: answer.message || intl.formatMessage(messages.recordingNone),
          }));
        }
      })
      .catch(() => setRecordingNote((notes) => ({ ...notes, [item.id]: intl.formatMessage(messages.recordingNone) })));
  };

  const runConfirm = () => {
    const { kind: action, item } = confirm;
    const client = getAuthenticatedHttpClient();
    const base = `${lms()}/titaned/api/v2/meetings/${item.meeting_id}/`;
    const request = action === 'delete'
      ? client.delete(base)
      : client.post(`${base}cancel/`, item.is_recurring && cancelScope === 'single' ? { occurrence_id: item.id } : {});
    setBusy(true);
    request
      .then(() => {
        setToast(intl.formatMessage(action === 'delete' ? messages.deleted : messages.cancelled));
        setConfirm(null);
        load();
      })
      .catch((error) => setToast(error?.response?.data?.message || intl.formatMessage(messages.actionFailed)))
      .finally(() => setBusy(false));
  };

  const renderItem = (item) => {
    const meta = STATUSES[item.status] || STATUSES.upcoming;
    const planned = item.status === 'upcoming' || item.status === 'live';
    return (
      <li key={item.id}>
        <article className={`mtg-item mtg-item--${item.status}`} aria-label={item.topic}>
          <span className="mtg-item__date" aria-hidden="true">
            <strong>{intl.formatDate(item.startDate, { day: 'numeric', timeZone: zone })}</strong>
            <span>{intl.formatDate(item.startDate, { month: 'short', timeZone: zone })}</span>
          </span>
          <div className="mtg-item__main">
            <h3 className="mtg-item__title">{item.topic}</h3>
            {item.course && <span className="mtg-item__course">{item.course}</span>}
            <div className="mtg-item__meta">
              <span>
                <Icon src={Schedule} size="sm" /> {range(item)}
              </span>
              <span>{intl.formatMessage(messages.minutes, { count: item.duration })}</span>
              {item.host && (
                <span>
                  <Icon src={Person} size="sm" /> {intl.formatMessage(messages.host, { name: item.host })}
                </span>
              )}
            </div>
            <div className="mtg-item__meta">
              <span className={`mtg-tag mtg-tag--${item.status}`}>
                {item.status === 'live' ? <span className="mtg-dot" /> : <Icon src={meta.icon} size="xs" />}
                {intl.formatMessage(meta.label)}
              </span>
              {item.is_recurring && (
                <span className="mtg-tag">
                  <Icon src={Repeat} size="xs" />{' '}
                  {intl.formatMessage(messages.occurrences, { count: item.occurrence_count })}
                </span>
              )}
            </div>
            {item.agenda && <p className="mtg-item__agenda">{item.agenda}</p>}
          </div>
          <div className="mtg-item__actions">
            {planned && (
              <Button
                variant={item.status === 'live' ? 'danger' : 'primary'}
                size="sm"
                iconBefore={VideoCall}
                onClick={() => startClass(item)}
              >
                {intl.formatMessage(messages.start)}
              </Button>
            )}
            {planned && (
              <Button variant="outline-primary" size="sm" iconBefore={Edit} onClick={() => openEdit(item)}>
                {intl.formatMessage(messages.edit)}
              </Button>
            )}
            {item.status === 'ended' && (
              <>
                <Button variant="outline-primary" size="sm" iconBefore={People} onClick={() => setAttendance(item)}>
                  {intl.formatMessage(messages.attendance)}
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  iconBefore={item.recording_url ? PlayCircle : OndemandVideo}
                  onClick={() => lookRecording(item)}
                >
                  {intl.formatMessage(messages.recording)}
                </Button>
              </>
            )}
            <Dropdown>
              <Dropdown.Toggle
                as={IconButton}
                src={MoreVert}
                iconAs={Icon}
                variant="primary"
                size="sm"
                alt={intl.formatMessage(messages.moreActions, { topic: item.topic })}
                id={`mtg-more-${item.id}`}
              />
              <Dropdown.Menu>
                {planned && (
                  <Dropdown.Item as="button" onClick={() => copyLink(item)}>
                    <Icon src={ContentCopy} size="sm" className="me-2" /> {intl.formatMessage(messages.copyLink)}
                  </Dropdown.Item>
                )}
                {planned && (
                  <Dropdown.Item as="button" onClick={() => downloadIcs(item, icsLabels)}>
                    <Icon src={EventAvailable} size="sm" className="me-2" />{' '}
                    {intl.formatMessage(messages.addToCalendar)}
                  </Dropdown.Item>
                )}
                {item.status === 'upcoming' && (
                  <Dropdown.Item
                    as="button"
                    onClick={() => {
                      setCancelScope('single');
                      setConfirm({ kind: 'cancel', item });
                    }}
                  >
                    <Icon src={Cancel} size="sm" className="me-2" /> {intl.formatMessage(messages.cancel)}
                  </Dropdown.Item>
                )}
                {item.status !== 'live' && (
                  <Dropdown.Item
                    as="button"
                    onClick={() => setConfirm({ kind: 'delete', item })}
                  >
                    <Icon src={Delete} size="sm" className="me-2" /> {intl.formatMessage(messages.remove)}
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
            {recordingNote[item.id] && <span className="mtg-item__hint" role="status">{recordingNote[item.id]}</span>}
          </div>
        </article>
      </li>
    );
  };

  const title = intl.formatMessage(messages.pageTitle);
  let body;
  if (failed) {
    body = (
      <div className="mtg-state mtg-card" role="alert">
        <p>{intl.formatMessage(failed === 'unavailable' ? messages.unavailable : messages.error)}</p>
        {failed !== 'unavailable' && (
          <Button variant="outline-primary" onClick={load}>{intl.formatMessage(messages.retry)}</Button>
        )}
      </div>
    );
  } else if (!data) {
    body = (
      <div className="mtg-state">
        <Spinner animation="border" variant="primary" screenReaderText={intl.formatMessage(messages.loading)} />
      </div>
    );
  } else {
    const live = items.filter((item) => item.status === 'live').length;
    const upcoming = items.filter((item) => item.status === 'upcoming');
    const today = upcoming.filter((item) => daysAway(item.startDate, now, timeZone) === 0).length;
    const week = upcoming.filter((item) => inPeriod(item.startDate, 'week', now, timeZone)).length;
    const [emptyTitle, emptyText] = EMPTY[shownTab];
    body = (
      <>
        <section className="mtg-hero">
          <div className="mtg-hero__text">
            <div>
              <h1>{title}</h1>
              <p>{intl.formatMessage(messages.intro)}</p>
            </div>
            <dl className="mtg-figures">
              <div>
                <dt>{intl.formatMessage(messages.figureLive)}</dt>
                <dd>{intl.formatNumber(live)}</dd>
              </div>
              <div>
                <dt>{intl.formatMessage(messages.figureToday)}</dt>
                <dd>{intl.formatNumber(today)}</dd>
              </div>
              <div>
                <dt>{intl.formatMessage(messages.figureWeek)}</dt>
                <dd>{intl.formatNumber(week)}</dd>
              </div>
              <div>
                <dt>{intl.formatMessage(messages.figureCourses)}</dt>
                <dd>{intl.formatNumber(courseChoices.length)}</dd>
              </div>
            </dl>
            <p>{intl.formatMessage(messages.timeZoneNote, { zone: zoneName })}</p>
          </div>
          <div className="mtg-hero__actions">
            <Button variant="light" iconBefore={Add} onClick={openNew}>{intl.formatMessage(messages.schedule)}</Button>
          </div>
        </section>

        <div className="mtg-tabs" role="tablist" aria-label={intl.formatMessage(messages.tabsLabel)}>
          {TABS.map(([key, label, icon]) => (
            <button
              type="button"
              role="tab"
              key={key}
              id={`mtg-tab-${key}`}
              aria-selected={shownTab === key}
              aria-controls="mtg-panel"
              className={`mtg-tab mtg-tab--${key} ${shownTab === key ? 'is-on' : ''}`}
              onClick={() => setTab(key)}
            >
              {key === 'live' && counts.live
                ? <span className="mtg-dot" style={{ color: 'var(--mtg-live)' }} />
                : <Icon src={icon} size="sm" />}
              <span>{intl.formatMessage(label)}</span>
              <span className="mtg-tab__count">{intl.formatNumber(counts[key] || 0)}</span>
            </button>
          ))}
        </div>

        <div className="mtg-filters mtg-card">
          <Form.Group controlId="mtg-course">
            <Form.Label>{intl.formatMessage(messages.filterCourse)}</Form.Label>
            <Form.Control as="select" value={course} onChange={(event) => setCourse(event.target.value)}>
              <option value="">{intl.formatMessage(messages.filterAllCourses)}</option>
              {(data.courses || []).map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="mtg-status">
            <Form.Label>{intl.formatMessage(messages.filterStatus)}</Form.Label>
            <Form.Control as="select" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">{intl.formatMessage(messages.filterAnyStatus)}</option>
              {Object.entries(STATUSES).map(([key, entry]) => (
                <option key={key} value={key}>{intl.formatMessage(entry.label)}</option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="mtg-date">
            <Form.Label>{intl.formatMessage(messages.filterDate)}</Form.Label>
            <Form.Control as="select" value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="">{intl.formatMessage(messages.filterAnyDate)}</option>
              <option value="today">{intl.formatMessage(messages.filterToday)}</option>
              <option value="week">{intl.formatMessage(messages.filterWeek)}</option>
              <option value="month">{intl.formatMessage(messages.filterMonth)}</option>
              <option value="custom">{intl.formatMessage(messages.filterCustom)}</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="mtg-type">
            <Form.Label>{intl.formatMessage(messages.filterType)}</Form.Label>
            <Form.Control as="select" value={kind} onChange={(event) => setKind(event.target.value)}>
              <option value="">{intl.formatMessage(messages.filterAnyType)}</option>
              <option value="recurring">{intl.formatMessage(messages.filterRecurring)}</option>
              <option value="oneoff">{intl.formatMessage(messages.filterOneOff)}</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="mtg-search" className="mtg-filters__search">
            <Form.Label>{intl.formatMessage(messages.search)}</Form.Label>
            <Form.Control
              type="search"
              value={query}
              leadingElement={<Icon src={Search} />}
              onChange={(event) => setQuery(event.target.value)}
            />
          </Form.Group>
          {period === 'custom' && (
            <div className="mtg-filters__range">
              <Form.Group controlId="mtg-from">
                <Form.Label>{intl.formatMessage(messages.filterFrom)}</Form.Label>
                <Form.Control
                  type="date"
                  value={from}
                  max={to || undefined}
                  onChange={(event) => setFrom(event.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="mtg-to">
                <Form.Label>{intl.formatMessage(messages.filterTo)}</Form.Label>
                <Form.Control
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(event) => setTo(event.target.value)}
                />
              </Form.Group>
            </div>
          )}
          <div className="mtg-filters__foot">
            <span aria-live="polite">{intl.formatMessage(messages.showing, { count: shown.length })}</span>
            {filtered && (
              <Button variant="link" size="inline" onClick={clear}>{intl.formatMessage(messages.clearFilters)}</Button>
            )}
          </div>
        </div>

        {data.truncated && <p className="mtg-note" role="status">{intl.formatMessage(messages.truncated)}</p>}

        <div id="mtg-panel" role="tabpanel" aria-labelledby={`mtg-tab-${shownTab}`}>
          <div ref={listTop} />
          {shown.length === 0 && (
            <div className="mtg-state mtg-card">
              <Icon src={TABS.find(([key]) => key === shownTab)[2]} className="mtg-state__icon" />
              <h2>{intl.formatMessage(filtered ? messages.noMatchTitle : emptyTitle)}</h2>
              {filtered
                ? <Button variant="outline-primary" onClick={clear}>{intl.formatMessage(messages.clearFilters)}</Button>
                : (
                  <>
                    <p>{intl.formatMessage(emptyText)}</p>
                    {shownTab !== 'past' && (
                      <Button iconBefore={Add} onClick={openNew}>{intl.formatMessage(messages.schedule)}</Button>
                    )}
                  </>
                )}
            </div>
          )}
          {pageGroups.map((group) => (
            <section key={group.key} className="mtg-day">
              <h2>
                {dayLabel(group.date)} <span>{intl.formatNumber(group.total)}</span>
              </h2>
              <ul className="mtg-list">{group.list.map(renderItem)}</ul>
            </section>
          ))}
          {pageCount > 1 && (
            <div className="mtg-pager">
              <span aria-live="polite">
                {intl.formatMessage(messages.pageRange, {
                  from: (currentPage - 1) * PAGE_SIZE + 1,
                  to: Math.min(currentPage * PAGE_SIZE, shown.length),
                  total: shown.length,
                })}
              </span>
              <Pagination
                paginationLabel={intl.formatMessage(messages.paginationLabel)}
                pageCount={pageCount}
                currentPage={currentPage}
                onPageSelect={goToPage}
                buttonLabels={{
                  previous: intl.formatMessage(messages.pagePrevious),
                  next: intl.formatMessage(messages.pageNext),
                  page: intl.formatMessage(messages.pageWord),
                  currentPage: intl.formatMessage(messages.pageCurrent),
                  pageOfCount: intl.formatMessage(messages.pageOf),
                }}
              />
            </div>
          )}
        </div>
      </>
    );
  }

  const confirmItem = confirm?.item;
  const confirmTitle = confirm
    ? intl.formatMessage(confirm.kind === 'delete' ? messages.deleteTitle : messages.cancelTitle)
    : '';

  return (
    <div className="mtg-page">
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Container fluid size="xl" className="mtg-container">{body}</Container>

      <ScheduleMeetingModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={saved}
        options={options}
        editing={editing}
      />
      <AttendanceModal item={attendance} onClose={() => setAttendance(null)} />

      {confirm && (
        <ModalDialog
          isOpen
          onClose={() => setConfirm(null)}
          title={confirmTitle}
          hasCloseButton
          className="mtg-modal"
        >
          <ModalDialog.Header>
            <ModalDialog.Title>{confirmTitle}</ModalDialog.Title>
          </ModalDialog.Header>
          <ModalDialog.Body>
            <p>
              <strong>{confirmItem.topic}</strong> · {dayLabel(confirmItem.startDate)}, {range(confirmItem)}
            </p>
            <p>{intl.formatMessage(confirm.kind === 'delete' ? messages.deleteText : messages.cancelText)}</p>
            {confirm.kind === 'cancel' && confirmItem.is_recurring && (
              <div className="mtg-scope">
                <button type="button" aria-pressed={cancelScope === 'single'} onClick={() => setCancelScope('single')}>
                  <strong>{intl.formatMessage(messages.cancelOne)}</strong>
                  <small>{intl.formatMessage(messages.cancelOneHelp, { date: dayLabel(confirmItem.startDate) })}</small>
                </button>
                <button type="button" aria-pressed={cancelScope === 'series'} onClick={() => setCancelScope('series')}>
                  <strong>{intl.formatMessage(messages.cancelSeries)}</strong>
                  <small>{intl.formatMessage(messages.cancelSeriesHelp)}</small>
                </button>
              </div>
            )}
          </ModalDialog.Body>
          <ModalDialog.Footer>
            <ActionRow>
              <ModalDialog.CloseButton variant="tertiary">{intl.formatMessage(messages.keep)}</ModalDialog.CloseButton>
              <Button variant="danger" onClick={runConfirm} disabled={busy}>
                {intl.formatMessage(
                  busy
                    ? messages.working
                    : (confirm.kind === 'delete' ? messages.deleteConfirm : messages.cancelConfirm),
                )}
              </Button>
            </ActionRow>
          </ModalDialog.Footer>
        </ModalDialog>
      )}

      <Toast show={Boolean(toast)} onClose={() => setToast('')}>{toast || ' '}</Toast>
    </div>
  );
};

export default TeamMeetingsPage;
