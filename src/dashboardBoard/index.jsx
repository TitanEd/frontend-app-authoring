/*
 * The dashboard an administrator composed in Control Hub -> Dashboard Builder, drawn for the
 * person who is signed in: a row of metrics and a grid of widgets.
 *
 * <DashboardBoard audience="learner" />      learner dashboard
 * <DashboardBoard audience="instructor" />   Studio home
 *
 * Data: GET {LMS}/titaned/api/v2/dashboard/<audience>/ (control-hub dashboards/board.py).
 * This folder is the same in frontend-app-learner-dashboard and frontend-app-authoring: change
 * one, copy to the other.
 */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Icon, Spinner } from '@openedx/paragon';
import { TrendingDown, TrendingUp } from '@openedx/paragon/icons';

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

const DashboardBoard = ({ audience }) => {
  const intl = useIntl();
  const [board, setBoard] = useState(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    setFailed(false);
    getAuthenticatedHttpClient()
      .get(`${getConfig().LMS_BASE_URL}/titaned/api/v2/dashboard/${audience}/`)
      .then(({ data }) => setBoard(data))
      .catch(() => setFailed(true));
  }, [audience]);

  useEffect(() => { load(); }, [load]);

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

  return (
    <div className={`tb-board tb-board--${audience}`}>
      {board.metrics.length > 0 && (
        <div className="tb-metrics">
          {board.metrics.map((metric) => <Metric key={metric.uid} metric={metric} />)}
        </div>
      )}
      <div className="tb-widgets">
        {board.widgets.map((widget) => {
          const Body = WIDGETS[widget.type];
          if (!Body) { return null; }
          return (
            <section key={widget.uid} className={`tb-widget tb-widget--${widget.size} tb-widget--${widget.type}`}>
              <header className="tb-widget__head">
                <span className="tb-widget__icon"><Icon src={ICONS[widget.icon] || ICONS.book} /></span>
                <h2>{widget.title}</h2>
              </header>
              <div className="tb-widget__body"><Body data={widget.data} /></div>
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
