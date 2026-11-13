import { useAgendaMemberRole } from '@/hooks/partner/use-agenda-member-role';
import { useStoreMembersQuery } from '@/hooks/use-query/use-store-members-query/use-store-members-query.hook';
import { usePartnerStore } from '@/store';
import {
  AGENDA_DAYS,
  AGENDA_WORKING_DAY_KEYS,
  useAgendaStore,
} from '@/store/admin/agenda';
import type { TDayHours } from '@/types/api/users.types';
import { useCallback, useMemo } from 'react';

const formatHours = ({
  openTime,
  closeTime,
  lunchStartTime,
  lunchEndTime,
}: TDayHours): string => {
  const hours = `${openTime}–${closeTime}`;
  return lunchStartTime && lunchEndTime
    ? `${hours} · pausa ${lunchStartTime}–${lunchEndTime}`
    : hours;
};

/**
 * "Meu horário" do profissional, só leitura: o expediente dele em cada dia
 * (ou o da loja, quando não tem um próprio) e as folgas fixas.
 */
export const useMyHoursDialog = () => {
  const store = usePartnerStore((state) => state.activeStore);
  const { ownMember } = useAgendaMemberRole();
  const { storeMembers } = useStoreMembersQuery({ storeId: store.id });
  const isOpen = useAgendaStore((state) => state.isHoursPanelOpen);
  const setIsHoursPanelOpen = useAgendaStore(
    (state) => state.setIsHoursPanelOpen,
  );

  const workingHours = storeMembers.find(
    (member) => member.id === ownMember?.id,
  )?.workingHours;

  const rows = useMemo(
    () =>
      AGENDA_WORKING_DAY_KEYS.map((dayKey, index) => {
        const label = AGENDA_DAYS[index] ?? dayKey;
        const own = workingHours?.[dayKey];

        if (!store.businessDays?.[dayKey]) {
          return { dayKey, label, value: 'Loja fechada', isOff: true };
        }

        if (own === null) {
          return { dayKey, label, value: 'Folga', isOff: true };
        }

        return {
          dayKey,
          label,
          value: formatHours(own ?? store),
          isOff: false,
        };
      }),
    [workingHours, store],
  );

  const handleClose = useCallback(() => {
    setIsHoursPanelOpen(false);
  }, [setIsHoursPanelOpen]);

  return { isOpen, rows, handleClose };
};
