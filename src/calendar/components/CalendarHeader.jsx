import React, { useMemo } from 'react';
import { SearchField } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useCalendarContext } from '../context/CalendarContext';
import FilterDropdown from './FilterDropdown';
import NavigationButton from './NavigationButton';
import Dropdown from './Dropdown';
import messages from '../data/messages';

const CalendarHeader = () => {
  const intl = useIntl();
  const {
    events,
    prev,
    next,
    today,
    changeView,
    currentDateTitle,
    searchEvents,
    currentView,
  } = useCalendarContext();

  const types = useMemo(() => {
    const s = new Set(events.map((e) => e.type));
    return Array.from(s).filter(Boolean);
  }, [events]);

  const viewOptions = [
    { value: 'dayGridMonth', messageId: 'month' },
    { value: 'timeGridWeek', messageId: 'week' },
    { value: 'timeGridDay', messageId: 'day' },
    { value: 'listWeek', messageId: 'list' },
  ];

  return (
    <div className="calendar-header">
      <div className="top-row">
        <h2>{intl.formatMessage(messages.calendarTitle)}</h2>
      </div>
      <div className="controls-row">
        <div className="left-controls">
          <NavigationButton type="prev" onClick={prev} />
          <NavigationButton type="today" onClick={today} />
          <NavigationButton type="next" onClick={next} />
          <Dropdown
            id="calendar-view-select"
            className="view-select"
            options={viewOptions}
            value={currentView}
            onChange={changeView}
          />
        </div>
        <div className="center-title">{currentDateTitle}</div>
        <div className="right-controls">
          <SearchField
            className="search-input"
            onSubmit={searchEvents}
            onClear={() => searchEvents('')}
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
            screenReaderText={{
              label: intl.formatMessage(messages.searchPlaceholder),
              submitButton: intl.formatMessage(messages.searchSubmit),
              clearButton: intl.formatMessage(messages.searchClear),
            }}
          />
          <FilterDropdown types={types} />
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
