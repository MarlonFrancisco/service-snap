import { formatDateBR } from '../agenda-grid/agenda-grid.helpers';
import { useAgendaGrid } from '../agenda-grid/agenda-grid.hook';
import { GRID_CONSTANTS } from '../agenda-grid/agenda-grid.constants';

/**
 * Hook da visão de dia: mesma lógica da semana, com uma coluna por profissional.
 */
export const useAgendaDayView = () => {
  const gridHook = useAgendaGrid();
  const { filteredProfessionals, getProfessionalColumn, selectedDayData } =
    gridHook;

  const professionalColumns = selectedDayData
    ? filteredProfessionals.flatMap((professional) => {
        const column = getProfessionalColumn(
          professional,
          selectedDayData.dayIndex,
        );
        return column ? [{ professional, column }] : [];
      })
    : [];

  return {
    ...gridHook,
    professionalColumns,
    dayTitle: selectedDayData
      ? `${selectedDayData.label}, ${formatDateBR(selectedDayData.date)}`
      : '',
    gridStyle: {
      gridTemplateColumns: `${GRID_CONSTANTS.TIME_COLUMN_WIDTH}px repeat(${filteredProfessionals.length}, minmax(${GRID_CONSTANTS.DAY_MIN_COLUMN_WIDTH}px, 1fr))`,
      minWidth:
        GRID_CONSTANTS.TIME_COLUMN_WIDTH +
        filteredProfessionals.length * GRID_CONSTANTS.DAY_MIN_COLUMN_WIDTH,
    },
  };
};
