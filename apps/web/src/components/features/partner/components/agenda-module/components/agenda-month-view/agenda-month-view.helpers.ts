import type { TAgendaVisit } from '@/store/admin/agenda';
import type { TAgendaMonthDayCounts } from './agenda-month-view.types';

export const countVisitsByStatus = (
  visits: TAgendaVisit[],
): TAgendaMonthDayCounts =>
  visits.reduce<TAgendaMonthDayCounts>(
    (counts, visit) => ({
      scheduled: counts.scheduled + (visit.status === 'scheduled' ? 1 : 0),
      completed: counts.completed + (visit.status === 'completed' ? 1 : 0),
      noShow: counts.noShow + (visit.status === 'no-show' ? 1 : 0),
    }),
    { scheduled: 0, completed: 0, noShow: 0 },
  );

const plural = (count: number, singular: string, pluralLabel: string) =>
  `${count} ${count === 1 ? singular : pluralLabel}`;

export const formatScheduledCount = (count: number) =>
  plural(count, 'agendado', 'agendados');

export const formatCompletedCount = (count: number) =>
  plural(count, 'concluído', 'concluídos');

export const formatNoShowCount = (count: number) =>
  plural(count, 'falta', 'faltas');
