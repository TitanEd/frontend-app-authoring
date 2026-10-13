/*
 * Studio home: the dashboard an administrator composed in Control Hub -> Dashboard Builder ->
 * Instructor dashboard (src/dashboardBoard), with the figures of the courses the signed-in
 * person teaches.
 */
import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import DashboardBoard from '../dashboardBoard';
import messages from './messages';
import './Dashboard.scss';

const BoardHome = () => {
  const intl = useIntl();
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-main-content">
        <h1 className="dashboard-header">{intl.formatMessage(messages.dashboardPageTitle)}</h1>
        <DashboardBoard audience="instructor" />
      </div>
    </div>
  );
};

export default BoardHome;
