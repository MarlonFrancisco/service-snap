import type { TAgendaViewMode } from '@/store/admin/agenda';

export const AGENDA_VIEW_OPTIONS: readonly {
  value: TAgendaViewMode;
  label: string;
}[] = [
  { value: 'day', label: 'Dia' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
];
