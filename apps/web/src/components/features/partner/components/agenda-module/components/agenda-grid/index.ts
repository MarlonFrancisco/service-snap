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
  getProfessionalFullName,
  getProfessionalInitials,
  isToday,
} from './agenda-grid.helpers';
export { useAgendaGrid } from './agenda-grid.hook';
export type {
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
