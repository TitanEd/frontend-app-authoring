import React, { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import allLocales from '@fullcalendar/core/locales-all';
import { getLocale } from '@edx/frontend-platform/i18n';
import { useCalendarContext } from '../context/CalendarContext';

// Paragon has no calendar component; FullCalendar is themed with the design
// tokens in src/styles/styles-overrides.scss.
const CalendarView = () => {
  const {
    filteredEvents, setCurrentDateTitle, currentDate, currentView,
  } = useCalendarContext();
  const containerRef = useRef(null);
  const calendarRef = useRef(null);

  // FullCalendar only re-measures on window resize; keep the grid inside the
  // container when the layout (sidebar, scrollbar, styles) changes its width.
  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') { return undefined; }
    const observer = new ResizeObserver(() => calendarRef.current?.getApi().updateSize());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="calendar-container" ref={containerRef}>
      <FullCalendar
        ref={calendarRef}
        key={`${currentView}-${currentDate.getTime()}`}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView={currentView}
        headerToolbar={false}
        events={filteredEvents}
        locales={allLocales}
        locale={getLocale()}
        height="auto"
        selectable
        datesSet={(arg) => setCurrentDateTitle(arg.view.title)}
        initialDate={currentDate}
      />
    </div>
  );
};

export default CalendarView;
