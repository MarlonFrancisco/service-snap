import { useMemo } from 'react';
import {
  capitalizeFirst,
  getAppointmentCardAriaLabel,
} from '../../agenda-grid.helpers';
import type { useAgendaGrid } from '../../agenda-grid.hook';
import type {
  TMobileBlockItem,
  TMobileDayAppointment,
} from './agenda-grid-mobile-view.types';

/**
 * Hook para a agenda no mobile: lista do dia ou, em modo de bloqueio, os
 * horários de cada profissional no dia escolhido.
 */
export const useAgendaGridMobileView = (
  gridHook: ReturnType<typeof useAgendaGrid>,
) => {
  const {
    filteredProfessionals,
    getProfessionalColumn,
    getSelectedDayAppointments,
    getPresence,
    isBlockMode,
    selectedDayData,
  } = gridHook;

  const dayTitle = useMemo(
    () =>
      selectedDayData
        ? capitalizeFirst(
            selectedDayData.date.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }),
          )
        : '',
    [selectedDayData],
  );

  const blockSections =
    isBlockMode && selectedDayData?.isWorkingDay
      ? filteredProfessionals.flatMap((professional) => {
          const column = getProfessionalColumn(
            professional,
            selectedDayData.dayIndex,
          );

          if (!column) return [];

          // O arrasto e a barra de seleção não existem aqui: toque aplica na hora.
          const items = column.rows.flatMap<TMobileBlockItem>(
            ({ time, slot }, rowIndex) => {
              const blocks = column.blocks.filter(
                ({ rowStart }) => rowStart === rowIndex,
              );

              if (blocks.length > 0) {
                return blocks.map(({ appointment }) => ({
                  key: appointment.id,
                  appointment,
                }));
              }

              return slot
                ? [
                    {
                      key: time,
                      slot: {
                        ...slot,
                        handlers: { onClick: slot.handlers.onClick },
                      },
                    },
                  ]
                : [];
            },
          );

          return [{ professional, items }];
        })
      : [];

  const dayAppointments: TMobileDayAppointment[] = isBlockMode
    ? []
    : getSelectedDayAppointments().map((appointment) => {
        const presence = getPresence(appointment);

        return {
          appointment,
          presence,
          ariaLabel: getAppointmentCardAriaLabel(appointment, presence),
        };
      });

  return {
    dayTitle,
    blockSections,
    dayAppointments,
  };
};
