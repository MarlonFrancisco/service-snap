import { GRID_CONSTANTS } from '../../agenda-grid.constants';
import type { useAgendaGrid } from '../../agenda-grid.hook';

/**
 * Hook para a semana no desktop
 */
export const useAgendaGridDesktopView = (
  gridHook: ReturnType<typeof useAgendaGrid>,
) => {
  const {
    dayData,
    filteredProfessionals,
    getMergedDayColumn,
    getProfessionalColumn,
    isBlockMode,
  } = gridHook;

  const professionalCount = filteredProfessionals.length;
  const isCompactLanes = isBlockMode && professionalCount > 1;

  // Bloquear exige escolher o profissional: cada um ganha sua faixa no dia.
  const minColumnWidth = isCompactLanes
    ? Math.max(
        GRID_CONSTANTS.WEEK_MIN_COLUMN_WIDTH,
        professionalCount * GRID_CONSTANTS.BLOCK_LANE_MIN_WIDTH,
      )
    : GRID_CONSTANTS.WEEK_MIN_COLUMN_WIDTH;

  const dayColumns = dayData.flatMap((day) => {
    if (!day) return [];

    const mergedColumn = isBlockMode ? null : getMergedDayColumn(day.dayIndex);
    const laneColumns = isBlockMode
      ? filteredProfessionals.flatMap((professional) => {
          const column = getProfessionalColumn(professional, day.dayIndex, {
            isCompact: isCompactLanes,
          });
          return column ? [{ id: professional.id, column }] : [];
        })
      : [];

    return [
      {
        ...day,
        shortLabel: day.label.substring(0, 3),
        columns: mergedColumn
          ? [{ id: 'merged', column: mergedColumn }]
          : laneColumns,
      },
    ];
  });

  return {
    dayColumns,
    gridStyle: {
      gridTemplateColumns: `${GRID_CONSTANTS.TIME_COLUMN_WIDTH}px repeat(7, minmax(${minColumnWidth}px, 1fr))`,
      minWidth: GRID_CONSTANTS.TIME_COLUMN_WIDTH + 7 * minColumnWidth,
    },
  };
};
