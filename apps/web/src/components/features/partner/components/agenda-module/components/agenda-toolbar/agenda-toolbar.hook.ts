import { useAnalytics } from '@/providers/analytics.provider';
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
  const analytics = useAnalytics();
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

  const navigationUnit = isDayNavigation ? 'day' : 'week';

  const handlePrevious = useCallback(() => {
    analytics.track('agenda_navigated', {
      direction: 'previous',
      unit: navigationUnit,
    });

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
    analytics,
    navigationUnit,
    isDayNavigation,
    currentWeek,
    selectedDayIndex,
    goToWeek,
    setCurrentWeek,
    setSelectedDayIndex,
  ]);

  const handleNext = useCallback(() => {
    analytics.track('agenda_navigated', {
      direction: 'next',
      unit: navigationUnit,
    });

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
    analytics,
    navigationUnit,
    isDayNavigation,
    currentWeek,
    selectedDayIndex,
    goToWeek,
    setCurrentWeek,
    setSelectedDayIndex,
  ]);

  const handleToday = useCallback(() => {
    analytics.track('agenda_navigated', {
      direction: 'today',
      unit: navigationUnit,
    });
    goToWeek(0);
  }, [analytics, navigationUnit, goToWeek]);

  const handleToggleBlockMode = useCallback(() => {
    const newBlockMode = !isBlockMode;
    setIsBlockMode(newBlockMode);
    analytics.track('agenda_block_mode_toggled', { enabled: newBlockMode });
    toast.info(
      newBlockMode ? 'Modo de bloqueio ativado' : 'Modo de bloqueio desativado',
    );
  }, [analytics, isBlockMode, setIsBlockMode]);

  const handleEnterFocusMode = useCallback(() => {
    setIsFocusMode(true);
    analytics.track('agenda_focus_mode_toggled', { enabled: true });
  }, [analytics, setIsFocusMode]);

  const handleExitFocusMode = useCallback(() => {
    setIsFocusMode(false);
    analytics.track('agenda_focus_mode_toggled', { enabled: false });

    if (isMobile) {
      setIsBlockMode(false);
    }
  }, [analytics, isMobile, setIsFocusMode, setIsBlockMode]);

  const handleViewModeChange = useCallback(
    (mode: TAgendaViewMode) => {
      if (mode !== viewMode) {
        analytics.track('agenda_view_changed', { view_mode: mode });
      }

      setViewMode(mode);

      if (mode === 'day' && currentWeek === 0) {
        setSelectedDayIndex(getTodayDayIndex());
      }
    },
    [analytics, viewMode, currentWeek, setViewMode, setSelectedDayIndex],
  );

  const handleOpenAddAppointment = useCallback(() => {
    analytics.track('appointment_form_opened', { source: 'toolbar' });
    setIsAddAppointmentOpen({ isAddAppointmentOpen: true });
  }, [analytics, setIsAddAppointmentOpen]);

  const handleProfessionalChange = useCallback(
    (professionalId: string) => {
      setSelectedProfessional(professionalId);
      analytics.track('agenda_professional_filtered', {
        is_all: professionalId === 'all',
      });
    },
    [analytics, setSelectedProfessional],
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
