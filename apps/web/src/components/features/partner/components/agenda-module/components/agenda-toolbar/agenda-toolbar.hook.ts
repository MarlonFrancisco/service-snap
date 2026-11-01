import { usePartnerStore } from '@/store';
import type { TAgendaViewMode } from '@/store/admin/agenda';
import {
  formatMonthYear,
  getTodayDayIndex,
  selectWeekDates,
  useAgendaStore,
} from '@/store/admin/agenda';
import type { IProfessional } from '@/types/api/users.types';
import { useIsMobile } from '@repo/ui';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { capitalizeFirst } from '../agenda-grid/agenda-grid.helpers';
import type { TAgendaToolbarVariant } from './agenda-toolbar.types';

const EMPTY_PROFESSIONALS: IProfessional[] = [];
const LAST_DAY_INDEX = 6;

export function useAgendaToolbar(variant: TAgendaToolbarVariant) {
  const isMobile = useIsMobile();
  const weekDates = useAgendaStore(selectWeekDates);
  const currentWeek = useAgendaStore((state) => state.currentWeek);
  const setCurrentWeek = useAgendaStore((state) => state.setCurrentWeek);
  const selectedDayIndex = useAgendaStore((state) => state.selectedDayIndex);
  const setSelectedDayIndex = useAgendaStore(
    (state) => state.setSelectedDayIndex,
  );
  const isBlockMode = useAgendaStore((state) => state.isBlockMode);
  const setIsBlockMode = useAgendaStore((state) => state.setIsBlockMode);
  const setIsFocusMode = useAgendaStore((state) => state.setIsFocusMode);
  const viewMode = useAgendaStore((state) => state.viewMode);
  const setViewMode = useAgendaStore((state) => state.setViewMode);
  const selectedProfessional = useAgendaStore(
    (state) => state.selectedProfessional,
  );
  const setSelectedProfessional = useAgendaStore(
    (state) => state.setSelectedProfessional,
  );
  const professionals = usePartnerStore(
    (state) => state.activeStore.storeMembers ?? EMPTY_PROFESSIONALS,
  );
  const setIsAddAppointmentOpen = useAgendaStore(
    (state) => state.setIsAddAppointmentOpen,
  );

  const isFocus = variant === 'focus';
  const isDayNavigation = viewMode === 'day' && !isMobile && !isFocus;

  const monthYear = useMemo(() => {
    const referenceDate =
      isMobile || isDayNavigation ? weekDates[selectedDayIndex] : weekDates[0];
    return capitalizeFirst(formatMonthYear(referenceDate ?? weekDates[0]));
  }, [weekDates, selectedDayIndex, isMobile, isDayNavigation]);

  const navigationLabels = useMemo(() => {
    if (isDayNavigation) {
      return { previous: 'Dia anterior', next: 'Próximo dia' };
    }

    return isMobile
      ? { previous: 'Dias anteriores', next: 'Próximos dias' }
      : { previous: 'Semana anterior', next: 'Próxima semana' };
  }, [isDayNavigation, isMobile]);

  const goToWeek = useCallback(
    (week: number) => {
      setCurrentWeek(week);

      if (week === 0) {
        setSelectedDayIndex(getTodayDayIndex());
      }
    },
    [setCurrentWeek, setSelectedDayIndex],
  );

  const handlePrevious = useCallback(() => {
    if (!isDayNavigation) {
      goToWeek(currentWeek - 1);
      return;
    }

    if (selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1);
      return;
    }

    setCurrentWeek(currentWeek - 1);
    setSelectedDayIndex(LAST_DAY_INDEX);
  }, [
    isDayNavigation,
    currentWeek,
    selectedDayIndex,
    goToWeek,
    setCurrentWeek,
    setSelectedDayIndex,
  ]);

  const handleNext = useCallback(() => {
    if (!isDayNavigation) {
      goToWeek(currentWeek + 1);
      return;
    }

    if (selectedDayIndex < LAST_DAY_INDEX) {
      setSelectedDayIndex(selectedDayIndex + 1);
      return;
    }

    setCurrentWeek(currentWeek + 1);
    setSelectedDayIndex(0);
  }, [
    isDayNavigation,
    currentWeek,
    selectedDayIndex,
    goToWeek,
    setCurrentWeek,
    setSelectedDayIndex,
  ]);

  const handleToday = useCallback(() => {
    goToWeek(0);
  }, [goToWeek]);

  const handleToggleBlockMode = useCallback(() => {
    const newBlockMode = !isBlockMode;
    setIsBlockMode(newBlockMode);
    toast.info(
      newBlockMode ? 'Modo de bloqueio ativado' : 'Modo de bloqueio desativado',
    );
  }, [isBlockMode, setIsBlockMode]);

  const handleEnterFocusMode = useCallback(() => {
    setIsFocusMode(true);
  }, [setIsFocusMode]);

  const handleExitFocusMode = useCallback(() => {
    setIsFocusMode(false);

    if (isMobile) {
      setIsBlockMode(false);
    }
  }, [isMobile, setIsFocusMode, setIsBlockMode]);

  const handleViewModeChange = useCallback(
    (mode: TAgendaViewMode) => {
      setViewMode(mode);

      if (mode === 'day' && currentWeek === 0) {
        setSelectedDayIndex(getTodayDayIndex());
      }
    },
    [currentWeek, setViewMode, setSelectedDayIndex],
  );

  const handleOpenAddAppointment = useCallback(() => {
    setIsAddAppointmentOpen({ isAddAppointmentOpen: true });
  }, [setIsAddAppointmentOpen]);

  const handleProfessionalChange = useCallback(
    (professionalId: string) => {
      setSelectedProfessional(professionalId);
    },
    [setSelectedProfessional],
  );

  return {
    // Data
    isMobile,
    isFocus,
    isDayNavigation,
    monthYear,
    navigationLabels,
    isBlockMode,
    viewMode,
    selectedProfessional,
    professionals,

    // Actions
    handlePrevious,
    handleNext,
    handleToday,
    handleToggleBlockMode,
    handleEnterFocusMode,
    handleExitFocusMode,
    handleViewModeChange,
    handleOpenAddAppointment,
    handleProfessionalChange,
  };
}
