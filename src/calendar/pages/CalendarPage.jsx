/*
 * Studio route /calendar: the teaching calendar (the courses of the person's course-team
 * roles). The page itself is ../CalendarPage.jsx, the same file as in the learner dashboard.
 *
 * context/, components/NavigationButton.jsx and data/ are what is left of the former mock
 * calendar: only the unused src/dashboard/Dashboard.jsx still imports them.
 */
import React from 'react';

import CalendarPage from '../CalendarPage';

const TeachingCalendarPage = () => <CalendarPage audience="instructor" />;

export default TeachingCalendarPage;
