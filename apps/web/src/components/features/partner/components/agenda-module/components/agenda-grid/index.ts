export { AgendaGrid } from './agenda-grid';
export {
  BREAKPOINTS,
  GRID_CONSTANTS,
  GRID_SCROLL_CLASS,
  STATUS_CONFIG,
  STATUS_LEGEND,
} from './agenda-grid.constants';
export {
  dateToISOString,
  formatDateBR,
  formatDuration,
  formatShortDay,
  getClientName,
  getProfessionalFullName,
  getProfessionalInitials,
  getVisitDuration,
  getVisitItems,
  getVisitServiceNames,
  groupVisits,
  isToday,
} from './agenda-grid.helpers';
export { useAgendaGrid } from './agenda-grid.hook';
export type {
  TAgendaBlockedBlock,
  TAgendaClosedNotice,
  TAgendaColumn,
  TAgendaColumnBlock,
  TAgendaColumnRow,
  TAgendaSlot,
  TAgendaSlotHandlers,
  TAgendaSlotState,
  TDayViewData,
  TPositionedAppointment,
  TSelectedProfessionalData,
} from './agenda-grid.types';

export { useAgendaGridDrag } from './agenda-grid-drag.hook';
export type { TAgendaDragHandlers } from './agenda-grid-drag.types';

// Bulk block exports
export { useAgendaGridBulkBlock } from './agenda-grid-bulk-block.hook';
export type {
  TSelectedSlot,
  TSlotId,
  TUseBulkBlockConfig,
  TUseBulkBlockReturn,
} from './agenda-grid-bulk-block.types';
export { BulkActionToolbar } from './components/bulk-action-toolbar';
export type { TBulkActionToolbarConfig } from './components/bulk-action-toolbar';
