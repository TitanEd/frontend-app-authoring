import React, { useState } from 'react';
import {
  Button,
  Dropdown,
  Form,
  Icon,
  IconButton,
} from '@openedx/paragon';
import { Calendar, Close } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useAssignmentContext } from '../context/AssignmentContext';
import messages from '../data/messages';

const DateFilter = () => {
  const intl = useIntl();
  const {
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    setToday,
    setThisWeek,
    setThisMonth,
  } = useAssignmentContext();

  const [isOpen, setIsOpen] = useState(false);

  const getMaxToDate = () => {
    if (!fromDate) { return ''; }
    const from = new Date(fromDate);
    const max = new Date(from);
    max.setMonth(max.getMonth() + 3);
    return max.toISOString().split('T')[0];
  };

  const resetDates = () => {
    setFromDate('');
    setToDate('');
  };

  return (
    <Dropdown className="date-filter" autoClose="outside" onToggle={setIsOpen}>
      <Dropdown.Toggle
        id="assignment-date-filter-toggle"
        as={IconButton}
        iconAs={Icon}
        src={isOpen ? Close : Calendar}
        alt={intl.formatMessage(messages.dateFilterToggle)}
        variant="primary"
        size="sm"
      />
      <Dropdown.Menu className="date-filter-panel">
        <Form.Group>
          <Form.Label>{intl.formatMessage(messages.fromDateLabel)}</Form.Label>
          <Form.Control
            type="date"
            value={fromDate ? new Date(fromDate).toISOString().split('T')[0] : ''}
            onChange={(e) => {
              setFromDate(e.target.value);
              if (toDate) {
                const maxTo = new Date(e.target.value);
                maxTo.setMonth(maxTo.getMonth() + 3);
                if (new Date(toDate) > maxTo) {
                  setToDate('');
                }
              }
            }}
          />
        </Form.Group>

        <Form.Group className="mt-2">
          <Form.Label>{intl.formatMessage(messages.toDateLabel)}</Form.Label>
          <Form.Control
            type="date"
            value={toDate ? new Date(toDate).toISOString().split('T')[0] : ''}
            onChange={(e) => setToDate(e.target.value)}
            disabled={!fromDate}
            min={fromDate ? new Date(fromDate).toISOString().split('T')[0] : ''}
            max={getMaxToDate()}
          />
        </Form.Group>

        <div className="date-presets">
          <Button size="sm" variant="outline-primary" onClick={setToday}>
            {intl.formatMessage(messages.todayButton)}
          </Button>
          <Button size="sm" variant="outline-primary" onClick={setThisWeek}>
            {intl.formatMessage(messages.thisWeekButton)}
          </Button>
          <Button size="sm" variant="outline-primary" onClick={setThisMonth}>
            {intl.formatMessage(messages.thisMonthButton)}
          </Button>
          <Button size="sm" variant="outline-secondary" onClick={resetDates}>
            {intl.formatMessage(messages.resetButton)}
          </Button>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default DateFilter;
