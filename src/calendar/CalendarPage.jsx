/*
 * The calendar: "My Calendar" of the learner dashboard (audience "learner": the courses the
 * person is enrolled in) and the teaching calendar of Studio (audience "instructor": the courses
 * of their course-team roles, where they can also add course events).
 *
 * Data: GET {LMS}/titaned/api/v2/calendar/ (control-hub course_calendar/sources.py), one request
 * per visible period (a month view asks for its six weeks); filters and search work on what is
 * loaded. Views: month, week, day, agenda (the default on a phone). Same file in both forks.
 */
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { getConfig } from '@edx/frontend-platform';
import {
  Button, Container, Form, Icon, IconButton, Toast,
} from '@openedx/paragon';
import {
  Add, ChevronLeft, ChevronRight, EventNote, FilterList, RssFeed, Search,
} from '@openedx/paragon/icons';

import * as api from './api';
import {
  AGENDA_DAYS, TYPES, VIEWS, addDays, eventsByDay, filterEvents, firstDayOfWeek, prepare,
  startOfDay, step, upcoming, visibleRange,
} from './dates';
import { EventDialog, EventForm, SubscribeDialog } from './dialogs';
import messages from './messages';
import { TYPE_META } from './meta';
import {
  AgendaView, EventRow, MiniMonth, MonthView, Skeleton, WeekView, useFormats,
} from './views';
import './style.scss';

const VIEW_LABELS = {
  month: messages.viewMonth, week: messages.viewWeek, day: messages.viewDay, agenda: messages.viewAgenda,
};
const STORAGE_KEY = 'tels-calendar-view';
const PHONE = '(max-width: 767px)';
const UPCOMING_SHOWN = 6;

const isPhone = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia(PHONE).matches;

const initialView = () => {
  if (isPhone()) { return 'agenda'; }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (VIEWS.includes(stored)) { return stored; }
  } catch {
    // Storage may be blocked: the default view is fine.
  }
  return 'month';
};

const rememberView = (view) => {
  try { window.localStorage.setItem(STORAGE_KEY, view); } catch { /* not kept */ }
};

const CalendarPage = ({ audience }) => {
  const {
    intl, longDate, dayRange,
  } = useFormats();
  const weekStart = useMemo(() => firstDayOfWeek(intl.locale), [intl.locale]);
  const [view, setView] = useState(initialView);
  const [date, setDate] = useState(() => startOfDay(new Date()));
  const [miniMonth, setMiniMonth] = useState(() => new Date());
  const [course, setCourse] = useState('');
  const [hiddenTypes, setHiddenTypes] = useState(() => new Set());
  const [query, setQuery] = useState('');
  const [result, setResult] = useState({ key: null, data: null });
  const [failed, setFailed] = useState(false);
  const [soon, setSoon] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [reload, setReload] = useState(0);
  const cache = useRef(new Map());
  // The kinds of events the site has (types): no live classes without the Zoom feature.
  const known = useRef({ courses: [], canCreate: false, types: TYPES });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const range = useMemo(() => visibleRange(view, date, weekStart), [view, date, weekStart]);
  const rangeKey = `${range.start.toISOString()}|${range.end.toISOString()}`;

  useEffect(() => {
    let alive = true;
    setFailed(false);
    if (cache.current.has(rangeKey)) {
      setResult({ key: rangeKey, data: cache.current.get(rangeKey) });
      return undefined;
    }
    api.fetchEvents(audience, range.start, range.end)
      .then((data) => {
        const ready = { ...data, events: data.events.map(prepare) };
        cache.current.set(rangeKey, ready);
        if (alive) { setResult({ key: rangeKey, data: ready }); }
      })
      // 403: the calendar is not part of the site's plan (sold feature "calendar").
      .catch((error) => { if (alive) { setFailed(error?.response?.status === 403 ? 'unavailable' : true); } });
    return () => { alive = false; };
  }, [audience, rangeKey, reload]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const today = startOfDay(new Date());
    api.fetchEvents(audience, today, addDays(today, 8))
      .then((data) => setSoon(data.events.map(prepare)))
      .catch(() => setSoon([]));
  }, [audience, reload]);

  const data = result.key === rangeKey ? result.data : null;
  if (data) {
    known.current = {
      courses: data.courses,
      canCreate: data.can_create,
      types: TYPES.filter((type) => !data.types || data.types.includes(type)),
    };
  }
  const { courses, canCreate } = known.current;
  const availableKey = known.current.types.join(',');
  const available = useMemo(() => availableKey.split(','), [availableKey]);

  const types = useMemo(
    () => new Set(available.filter((type) => !hiddenTypes.has(type))),
    [available, hiddenTypes],
  );
  const shown = useMemo(
    () => (data ? filterEvents(data.events, { course, types, query }) : []),
    [data, course, types, query],
  );
  const byDay = useMemo(() => eventsByDay(shown, range.start, range.end), [shown, range]);
  const busyDays = useMemo(() => new Set(byDay.keys()), [byDay]);
  const today = startOfDay(now);
  const next = useMemo(
    () => (soon ? upcoming(filterEvents(soon, { course, types }), now) : null),
    [soon, course, types, now],
  );

  const changeView = (value) => { setView(value); rememberView(value); };
  const goTo = (day) => { setDate(startOfDay(day)); setMiniMonth(day); };
  const openDay = (day) => { goTo(day); changeView('day'); };
  const move = (direction) => goTo(step(view, date, direction));
  const refresh = useCallback(() => { cache.current.clear(); setReload((value) => value + 1); }, []);
  const toggleType = (type) => setHiddenTypes((current) => {
    const nextTypes = new Set(current);
    if (nextTypes.has(type)) { nextTypes.delete(type); } else { nextTypes.add(type); }
    return nextTypes;
  });
  const filtered = Boolean(course || hiddenTypes.size || query.trim());
  const clear = () => { setCourse(''); setHiddenTypes(new Set()); setQuery(''); };
  const openEvent = (event) => setDialog({ kind: 'event', event });
  const download = () => api.downloadIcs(audience, range.start, range.end, {
    course, query, types: hiddenTypes.size ? [...types] : null,
  });

  let period;
  if (view === 'month') {
    period = intl.formatDate(date, { month: 'long', year: 'numeric' });
  } else if (view === 'day') {
    period = longDate(date);
  } else {
    period = dayRange(range.start, addDays(range.end, -1));
  }

  const title = intl.formatMessage(audience === 'instructor' ? messages.titleInstructor : messages.titleLearner);
  const intro = intl.formatMessage(audience === 'instructor' ? messages.introInstructor : messages.introLearner);

  let body;
  if (failed) {
    body = (
      <div className="tcal-state" role="alert">
        <p>{intl.formatMessage(messages.error)}</p>
        <Button variant="outline-primary" onClick={refresh}>{intl.formatMessage(messages.retry)}</Button>
      </div>
    );
  } else if (!data) {
    body = <Skeleton view={view} label={intl.formatMessage(messages.loading)} />;
  } else {
    let notice = null;
    if (!shown.length) {
      notice = data.events.length ? (
        <div className="tcal-empty">
          <p>{intl.formatMessage(messages.noMatch)}</p>
          <Button variant="link" size="inline" onClick={clear}>{intl.formatMessage(messages.clearFilters)}</Button>
        </div>
      ) : (
        <div className="tcal-empty">
          <Icon src={EventNote} className="tcal-empty__icon" />
          <div>
            <h3>{intl.formatMessage(messages.emptyTitle)}</h3>
            <p>{intl.formatMessage(audience === 'instructor' ? messages.emptyInstructor : messages.emptyLearner)}</p>
          </div>
        </div>
      );
    }
    let content;
    if (view === 'month') {
      content = (
        <MonthView
          date={date}
          weekStart={weekStart}
          byDay={byDay}
          today={today}
          onOpenEvent={openEvent}
          onOpenDay={openDay}
        />
      );
    } else if (view === 'week') {
      content = (
        <WeekView start={range.start} byDay={byDay} today={today} onOpenEvent={openEvent} onOpenDay={openDay} />
      );
    } else if (view === 'day') {
      content = shown.length ? (
        <AgendaView start={range.start} days={1} byDay={byDay} today={today} onOpenEvent={openEvent} showEmptyDays />
      ) : null;
    } else {
      content = shown.length ? (
        <AgendaView start={range.start} days={AGENDA_DAYS} byDay={byDay} today={today} onOpenEvent={openEvent} />
      ) : null;
    }
    body = <>{notice}{content}</>;
  }

  // Not part of the site's plan: the title and why, without the tools.
  if (failed === 'unavailable') {
    return (
      <div className={`tcal-page tcal-page--${audience}`}>
        <Helmet>
          <title>{title}</title>
          <link rel="shortcut icon" href={getConfig().FAVICON_URL} type="image/x-icon" />
        </Helmet>
        <Container fluid size="xl" className="tcal-container">
          <header className="tcal-head">
            <div><h1>{title}</h1></div>
          </header>
          <div className="tcal-state tcal-card" role="alert">
            <p>{intl.formatMessage(messages.unavailable)}</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className={`tcal-page tcal-page--${audience}`}>
      <Helmet>
        <title>{title}</title>
        <link rel="shortcut icon" href={getConfig().FAVICON_URL} type="image/x-icon" />
      </Helmet>
      <Container fluid size="xl" className="tcal-container">
        <header className="tcal-head">
          <div>
            <h1>{title}</h1>
            <p>{intro}</p>
          </div>
          <div className="tcal-head__actions">
            {canCreate && (
              <Button variant="primary" iconBefore={Add} onClick={() => setDialog({ kind: 'form', event: null })}>
                {intl.formatMessage(messages.newEvent)}
              </Button>
            )}
            <Button variant="outline-primary" iconBefore={RssFeed} onClick={() => setDialog({ kind: 'subscribe' })}>
              {intl.formatMessage(messages.subscribe)}
            </Button>
          </div>
        </header>

        <div className="tcal-toolbar">
          <div className="tcal-nav">
            <Button variant="outline-primary" onClick={() => goTo(new Date())}>{intl.formatMessage(messages.today)}</Button>
            <IconButton
              src={ChevronLeft}
              iconAs={Icon}
              alt={intl.formatMessage(messages.previous)}
              onClick={() => move(-1)}
              className="tcal-flip"
            />
            <IconButton
              src={ChevronRight}
              iconAs={Icon}
              alt={intl.formatMessage(messages.next)}
              onClick={() => move(1)}
              className="tcal-flip"
            />
            <h2 className="tcal-period" aria-live="polite">{period}</h2>
          </div>
          <div className="tcal-tools">
            <Form.Group controlId="tcal-search" className="tcal-search">
              <Form.Label className="sr-only">{intl.formatMessage(messages.search)}</Form.Label>
              <Form.Control
                type="search"
                value={query}
                placeholder={intl.formatMessage(messages.search)}
                leadingElement={<Icon src={Search} />}
                onChange={(event) => setQuery(event.target.value)}
              />
            </Form.Group>
            <div className="tcal-views" role="group" aria-label={intl.formatMessage(messages.viewLabel)}>
              {VIEWS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={view === value ? 'is-on' : ''}
                  aria-pressed={view === value}
                  onClick={() => changeView(value)}
                >
                  {intl.formatMessage(VIEW_LABELS[value])}
                </button>
              ))}
            </div>
            <Button
              variant="outline-primary"
              className="tcal-panel-toggle"
              iconBefore={FilterList}
              aria-expanded={panelOpen}
              aria-controls="tcal-side"
              onClick={() => setPanelOpen(!panelOpen)}
            >
              {intl.formatMessage(messages.filtersToggle)}
            </Button>
          </div>
        </div>

        <div className="tcal-layout">
          <aside id="tcal-side" className={`tcal-side ${panelOpen ? 'is-open' : ''}`}>
            <div className="tcal-card">
              <MiniMonth
                month={miniMonth}
                weekStart={weekStart}
                selected={date}
                today={today}
                busyDays={busyDays}
                onPick={goTo}
                onMonth={(direction) => setMiniMonth(
                  new Date(miniMonth.getFullYear(), miniMonth.getMonth() + direction, 1),
                )}
              />
            </div>

            <section className="tcal-card tcal-upcoming" aria-labelledby="tcal-upcoming-title">
              <h2 id="tcal-upcoming-title">{intl.formatMessage(messages.upcomingTitle)}</h2>
              {next === null && <Skeleton view="list" label={intl.formatMessage(messages.loading)} />}
              {next && next.length === 0 && <p className="tcal-hint">{intl.formatMessage(messages.upcomingEmpty)}</p>}
              {next && next.length > 0 && (
                <ul className="tcal-list">
                  {next.slice(0, UPCOMING_SHOWN).map((event) => (
                    <li key={event.id}><EventRow event={event} onOpen={openEvent} compact withDate /></li>
                  ))}
                </ul>
              )}
              {next && next.length > UPCOMING_SHOWN && (
                <Button variant="link" size="inline" onClick={() => { goTo(new Date()); changeView('agenda'); }}>
                  {intl.formatMessage(messages.upcomingMore, { count: next.length - UPCOMING_SHOWN })}
                </Button>
              )}
            </section>

            <section className="tcal-card tcal-filters">
              <Form.Group controlId="tcal-course">
                <Form.Label>{intl.formatMessage(messages.filterCourse)}</Form.Label>
                <Form.Control as="select" value={course} onChange={(event) => setCourse(event.target.value)}>
                  <option value="">{intl.formatMessage(messages.filterAllCourses)}</option>
                  {courses.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
                </Form.Control>
              </Form.Group>
              <fieldset>
                <legend>{intl.formatMessage(messages.filterTypes)}</legend>
                <ul className="tcal-legend">
                  {available.map((type) => (
                    <li key={type}>
                      <label className={`tcal-legend__item tcal-type--${type}`} htmlFor={`tcal-type-${type}`}>
                        <input
                          id={`tcal-type-${type}`}
                          type="checkbox"
                          checked={!hiddenTypes.has(type)}
                          onChange={() => toggleType(type)}
                        />
                        <span className="tcal-legend__swatch" aria-hidden="true"><Icon src={TYPE_META[type].icon} size="xs" /></span>
                        <span>{intl.formatMessage(TYPE_META[type].label)}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
              {filtered && (
                <Button variant="link" size="inline" onClick={clear}>{intl.formatMessage(messages.clearFilters)}</Button>
              )}
            </section>
          </aside>

          <section className={`tcal-main tcal-card tcal-main--${view}`} aria-label={period} aria-busy={!data && !failed}>
            {body}
          </section>
        </div>
      </Container>

      {dialog && dialog.kind === 'event' && (
        <EventDialog
          event={dialog.event}
          audience={audience}
          now={now}
          onClose={() => setDialog(null)}
          onEdit={(event) => setDialog({ kind: 'form', event })}
          onDeleted={() => { setDialog(null); setToast(intl.formatMessage(messages.deleted)); refresh(); }}
        />
      )}
      {dialog && dialog.kind === 'form' && (
        <EventForm
          event={dialog.event}
          day={date < today ? today : date}
          courses={courses}
          course={course}
          onClose={() => setDialog(null)}
          onSaved={() => { setDialog(null); setToast(intl.formatMessage(messages.saved)); refresh(); }}
        />
      )}
      {dialog && dialog.kind === 'subscribe' && (
        <SubscribeDialog onClose={() => setDialog(null)} onDownload={download} />
      )}
      <Toast show={Boolean(toast)} onClose={() => setToast('')}>{toast || ' '}</Toast>
    </div>
  );
};

CalendarPage.propTypes = {
  audience: PropTypes.oneOf(['learner', 'instructor']),
};

CalendarPage.defaultProps = { audience: 'learner' };

export default CalendarPage;
