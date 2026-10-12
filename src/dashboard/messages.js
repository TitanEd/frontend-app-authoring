import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  dashboardPageTitle: {
    id: 'dashboard.page.title',
    defaultMessage: 'Dashboard',
    description: 'Title of the dashboard page',
  },
  placeholderTitle: {
    id: 'dashboard.widget.placeholder.title',
    defaultMessage: 'Placeholder',
    description: 'Title of the empty widget column placeholder',
  },
  placeholderText: {
    id: 'dashboard.widget.placeholder.text',
    defaultMessage: 'Drag widgets here',
    description: 'Text of the empty widget column placeholder',
  },
  dragToReorder: {
    id: 'dashboard.widget.drag.to.reorder',
    defaultMessage: 'Drag to reorder',
    description: 'Accessible label of the widget drag handle',
  },
  loading: {
    id: 'dashboard.loading',
    defaultMessage: 'Loading...',
    description: 'Shown while the dashboard loads',
  },
  overview: {
    id: 'dashboard.overview.title',
    defaultMessage: 'Overview',
    description: 'Heading of the dashboard overview section',
  },
  cancel: {
    id: 'dashboard.widgets.modal.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button of the widget selection modal',
  },
  update: {
    id: 'dashboard.widgets.modal.update',
    defaultMessage: 'Update',
    description: 'Save button of the widget selection modal',
  },
  aiSuggestionTitle: {
    id: 'dashboard.ai.suggestion.title',
    defaultMessage: 'Titan AI suggestion',
    description: 'Heading of the AI suggestions card',
  },
  aiSuggestionIconAlt: {
    id: 'dashboard.ai.suggestion.icon.alt',
    defaultMessage: 'AI suggestion',
    description: 'Alt text of the stars icon next to AI suggestions',
  },
  noSuggestions: {
    id: 'dashboard.ai.suggestion.empty',
    defaultMessage: 'No suggestions yet.',
    description: 'Shown when there are no AI suggestions',
  },
  todoListTitle: {
    id: 'dashboard.todo.title',
    defaultMessage: 'Todo List',
    description: 'Heading of the todo list card',
  },
  noTasks: {
    id: 'dashboard.todo.empty',
    defaultMessage: 'No tasks added.',
    description: 'Shown when the todo list is empty',
  },
  chartWidget: {
    id: 'dashboard.widget.chart.type',
    defaultMessage: 'Chart type: {chartType}',
    description: 'Description of a chart widget in the widget selection modal',
  },
  textWidget: {
    id: 'dashboard.widget.text',
    defaultMessage: 'Text widget',
    description: 'Description of a text widget in the widget selection modal',
  },
  calendarWidgetFrameTitle: {
    id: 'dashboard.widget.calendar.frame.title',
    defaultMessage: 'Calendar',
    description: 'Accessible title of the embedded calendar in the calendar widget',
  },
  calendarWidgetNoEvents: {
    id: 'dashboard.widget.calendar.no.events',
    defaultMessage: 'No events today.',
    description: 'Shown in the calendar widget when there are no events for the day',
  },
  widgetModalTitle: {
    id: 'dashboard.widget.modal.title',
    defaultMessage: 'Add/Remove Widgets',
    description: 'Title of the dialog used to choose and reorder dashboard widgets',
  },
  youtubeWidgetFrameTitle: {
    id: 'dashboard.widget.youtube.frame.title',
    defaultMessage: 'YouTube video',
    description: 'Accessible title of the embedded video in the YouTube widget',
  },
  placeholderWidgetTitle: {
    id: 'dashboard.widget.placeholder.title',
    defaultMessage: 'Placeholder',
    description: 'Title of the empty drop area of a dashboard column',
  },
  placeholderWidgetContent: {
    id: 'dashboard.widget.placeholder.content',
    defaultMessage: 'Drag widgets here',
    description: 'Text of the empty drop area of a dashboard column',
  },
});

export default messages;
