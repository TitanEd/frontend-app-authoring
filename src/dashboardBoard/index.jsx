/*
 * The dashboard an administrator composed in Control Hub -> Dashboard Builder, drawn for the
 * person who is signed in: a row of metrics and a grid of widgets.
 *
 * <DashboardBoard audience="learner" />      learner dashboard
 * <DashboardBoard audience="instructor" />   Studio home
 *
 * Data: GET {LMS}/titaned/api/v2/dashboard/<audience>/ (control-hub dashboards/board.py).
 *
 * "Customize" lets the person arrange their own copy: drag a card (or use its arrows) to move
 * it, the eye to hide or show it. PUT stores {order, hidden} for that person, DELETE goes back
 * to the administrator's layout. What is on the board stays the administrator's choice.
 *
 * This folder is the same in frontend-app-learner-dashboard and frontend-app-authoring: change
 * one, copy to the other.
 */
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Icon, Spinner } from '@openedx/paragon';
import {
  ArrowBack, ArrowForward, DragIndicator, TrendingDown, TrendingUp, Tune, Visibility, VisibilityOff,
} from '@openedx/paragon/icons';

import messages from './messages';
import { ICONS, WIDGETS } from './widgets';
import './style.scss';

const Metric = ({ metric }) => {
  const intl = useIntl();
  const hasTrend = typeof metric.previous === 'number';
  const difference = hasTrend ? metric.value - metric.previous : 0;
  let unit = '';
  if (metric.unit === '%') { unit = '%'; }
  if (metric.unit === 'days') { unit = ` ${intl.formatMessage(messages.days, { count: metric.value })}`; }
  return (
    <div className={`tb-metric tb-tone-${metric.tone}`} title={metric.description}>
      <span className="tb-metric__icon"><Icon src={ICONS[metric.icon] || ICONS.book} /></span>
      <div className="tb-metric__body">
        <span className="tb-metric__title">{metric.title}</span>
        <strong className="tb-metric__value">
          {intl.formatNumber(metric.value)}<small>{unit}</small>
        </strong>
        {hasTrend && difference !== 0 && (
          <span
            className={`tb-metric__trend ${difference > 0 ? 'is-up' : 'is-down'}`}
            title={intl.formatMessage(messages.versusBefore, { difference: intl.formatNumber(difference, { signDisplay: 'always' }) })}
          >
            <Icon src={difference > 0 ? TrendingUp : TrendingDown} size="xs" />
            {intl.formatNumber(difference, { signDisplay: 'always' })}
          </span>
        )}
      </div>
    </div>
  );
};

Metric.propTypes = {
  metric: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    icon: PropTypes.string,
    tone: PropTypes.string,
    value: PropTypes.number.isRequired,
    previous: PropTypes.number,
    unit: PropTypes.string,
  }).isRequired,
};

// The tools of one card while the board is being customized.
const CardTools = ({
  title, hidden, first, last, onMove, onToggle,
}) => {
  const intl = useIntl();
  const label = (message) => intl.formatMessage(message, { title });
  return (
    <div className="tb-tools">
      <span className="tb-tools__grip" aria-hidden="true"><Icon src={DragIndicator} /></span>
      <button
        type="button"
        className="tb-tools__btn tb-tools__btn--arrow"
        disabled={first}
        onClick={() => onMove(-1)}
        title={label(messages.moveEarlier)}
        aria-label={label(messages.moveEarlier)}
      >
        <Icon src={ArrowBack} />
      </button>
      <button
        type="button"
        className="tb-tools__btn tb-tools__btn--arrow"
        disabled={last}
        onClick={() => onMove(1)}
        title={label(messages.moveLater)}
        aria-label={label(messages.moveLater)}
      >
        <Icon src={ArrowForward} />
      </button>
      <button
        type="button"
        className={`tb-tools__btn tb-tools__btn--eye ${hidden ? 'is-off' : ''}`}
        onClick={onToggle}
        aria-pressed={!hidden}
        title={label(hidden ? messages.show : messages.hide)}
        aria-label={label(hidden ? messages.show : messages.hide)}
      >
        <Icon src={hidden ? VisibilityOff : Visibility} />
        <span>{intl.formatMessage(hidden ? messages.hiddenLabel : messages.shownLabel)}</span>
      </button>
    </div>
  );
};

CardTools.propTypes = {
  title: PropTypes.string.isRequired,
  hidden: PropTypes.bool.isRequired,
  first: PropTypes.bool.isRequired,
  last: PropTypes.bool.isRequired,
  onMove: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
};

const KINDS = ['metrics', 'widgets'];

const DashboardBoard = ({ audience }) => {
  const intl = useIntl();
  const [board, setBoard] = useState(null);
  const [failed, setFailed] = useState(false);
  // While customizing: { metrics: [uid], widgets: [uid], hidden: [uid] }.
  const [draft, setDraft] = useState(null);
  const [dragged, setDragged] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const url = `${getConfig().LMS_BASE_URL}/titaned/api/v2/dashboard/${audience}/`;

  const load = useCallback(() => {
    setFailed(false);
    getAuthenticatedHttpClient()
      .get(url)
      .then(({ data }) => setBoard(data))
      .catch(() => setFailed(true));
  }, [url]);

  useEffect(() => { load(); }, [load]);

  // Every card of the board by uid, with its kind; a hidden one has no figures.
  const cards = useMemo(() => {
    const all = {};
    if (board) {
      board.metrics.forEach((item) => { all[item.uid] = { ...item, kind: 'metrics', loaded: true }; });
      board.widgets.forEach((item) => { all[item.uid] = { ...item, kind: 'widgets', loaded: true }; });
      (board.hidden || []).forEach((item) => {
        all[item.uid] = { ...item, kind: item.kind === 'metric' ? 'metrics' : 'widgets', loaded: false };
      });
    }
    return all;
  }, [board]);

  const startCustomizing = () => {
    const order = (board.order || Object.keys(cards)).filter((uid) => cards[uid]);
    setNotice(null);
    setDraft({
      metrics: order.filter((uid) => cards[uid].kind === 'metrics'),
      widgets: order.filter((uid) => cards[uid].kind === 'widgets'),
      hidden: (board.hidden || []).map((item) => item.uid),
    });
  };

  const place = (kind, uid, index) => setDraft((current) => {
    const list = current[kind].filter((other) => other !== uid);
    list.splice(Math.max(0, Math.min(index, list.length)), 0, uid);
    return { ...current, [kind]: list };
  });

  const toggle = (uid) => setDraft((current) => ({
    ...current,
    hidden: current.hidden.includes(uid) ? current.hidden.filter((other) => other !== uid) : [...current.hidden, uid],
  }));

  const store = (request) => {
    setSaving(true);
    setNotice(null);
    request
      .then(({ data }) => {
        setBoard(data);
        setDraft(null);
        setNotice({ tone: 'success', text: intl.formatMessage(messages.saved) });
      })
      .catch(() => setNotice({ tone: 'danger', text: intl.formatMessage(messages.saveError) }))
      .finally(() => setSaving(false));
  };

  const save = () => store(getAuthenticatedHttpClient().put(url, {
    order: [...draft.metrics, ...draft.widgets],
    hidden: draft.hidden,
  }));
  const reset = () => store(getAuthenticatedHttpClient().delete(url));

  if (failed) {
    return (
      <div className="tb-state" role="alert">
        <p>{intl.formatMessage(messages.error)}</p>
        <Button variant="outline-primary" onClick={load}>{intl.formatMessage(messages.retry)}</Button>
      </div>
    );
  }
  if (!board) {
    return (
      <div className="tb-state">
        <Spinner animation="border" variant="primary" screenReaderText={intl.formatMessage(messages.loading)} />
      </div>
    );
  }

  const editing = draft !== null;
  const hiddenCount = (board.hidden || []).length;
  const total = Object.keys(cards).length;

  // What a card needs to be moved and hidden; nothing outside "Customize".
  const editProps = (kind, uid, index) => {
    if (!editing) { return {}; }
    return {
      draggable: true,
      onDragStart: (event) => {
        event.dataTransfer.effectAllowed = 'move'; // eslint-disable-line no-param-reassign
        event.dataTransfer.setData('text/plain', uid);
        setDragged({ kind, uid });
      },
      onDragEnter: () => {
        if (dragged && dragged.kind === kind && dragged.uid !== uid) { place(kind, dragged.uid, index); }
      },
      onDragOver: (event) => { if (dragged && dragged.kind === kind) { event.preventDefault(); } },
      onDrop: (event) => event.preventDefault(),
      onDragEnd: () => setDragged(null),
    };
  };

  const stateClass = (uid) => [
    editing ? 'is-editing' : '',
    editing && draft.hidden.includes(uid) ? 'is-hidden' : '',
    dragged && dragged.uid === uid ? 'is-dragged' : '',
  ].join(' ');

  const tools = (kind, uid, index) => editing && (
    <CardTools
      title={cards[uid].title}
      hidden={draft.hidden.includes(uid)}
      first={index === 0}
      last={index === draft[kind].length - 1}
      onMove={(step) => place(kind, uid, index + step)}
      onToggle={() => toggle(uid)}
    />
  );

  const [metricIds, widgetIds] = KINDS.map((kind) => (editing ? draft[kind] : board[kind].map((item) => item.uid)));

  return (
    <div className={`tb-board tb-board--${audience} ${editing ? 'tb-board--editing' : ''}`}>
      <div className="tb-bar-top">
        {editing ? (
          <>
            <p className="tb-bar-top__hint">{intl.formatMessage(messages.customizeHint)}</p>
            <div className="tb-bar-top__actions">
              {board.customized && (
                <Button variant="link" disabled={saving} onClick={reset}>
                  {intl.formatMessage(messages.reset)}
                </Button>
              )}
              <Button variant="outline-primary" disabled={saving} onClick={() => setDraft(null)}>
                {intl.formatMessage(messages.cancel)}
              </Button>
              <Button variant="primary" disabled={saving} onClick={save}>
                {intl.formatMessage(saving ? messages.saving : messages.save)}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="tb-bar-top__hint" role="status">
              {notice && notice.tone === 'success' && notice.text}
              {!notice && hiddenCount > 0 && intl.formatMessage(messages.hiddenCount, { count: hiddenCount })}
            </p>
            {total > 0 && board.can_customize !== false && (
              <div className="tb-bar-top__actions">
                <Button variant="outline-primary" iconBefore={Tune} onClick={startCustomizing}>
                  {intl.formatMessage(messages.customize)}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      {notice && notice.tone === 'danger' && <p className="tb-notice" role="alert">{notice.text}</p>}
      {!editing && total > 0 && hiddenCount === total && (
        <p className="tb-empty">{intl.formatMessage(messages.allHidden)}</p>
      )}
      {metricIds.length > 0 && (
        <div className="tb-metrics">
          {metricIds.map((uid, index) => {
            const metric = cards[uid];
            return (
              <div key={uid} className={`tb-slot ${stateClass(uid)}`} {...editProps('metrics', uid, index)}>
                {metric.loaded ? <Metric metric={metric} /> : (
                  <div className={`tb-metric tb-tone-${metric.tone}`}>
                    <span className="tb-metric__icon"><Icon src={ICONS[metric.icon] || ICONS.book} /></span>
                    <div className="tb-metric__body">
                      <span className="tb-metric__title">{metric.title}</span>
                    </div>
                  </div>
                )}
                {tools('metrics', uid, index)}
              </div>
            );
          })}
        </div>
      )}
      <div className="tb-widgets">
        {widgetIds.map((uid, index) => {
          const widget = cards[uid];
          const Body = WIDGETS[widget.type];
          if (!Body) { return null; }
          return (
            <section
              key={uid}
              className={`tb-widget tb-widget--${widget.size} tb-widget--${widget.type} ${stateClass(uid)}`}
              {...editProps('widgets', uid, index)}
            >
              <header className="tb-widget__head">
                <span className="tb-widget__icon"><Icon src={ICONS[widget.icon] || ICONS.book} /></span>
                <h2>{widget.title}</h2>
                {tools('widgets', uid, index)}
              </header>
              {widget.loaded
                ? <div className="tb-widget__body"><Body data={widget.data} /></div>
                : <p className="tb-empty">{intl.formatMessage(messages.afterSave)}</p>}
            </section>
          );
        })}
      </div>
    </div>
  );
};

DashboardBoard.propTypes = {
  audience: PropTypes.oneOf(['learner', 'instructor']).isRequired,
};

export default DashboardBoard;
