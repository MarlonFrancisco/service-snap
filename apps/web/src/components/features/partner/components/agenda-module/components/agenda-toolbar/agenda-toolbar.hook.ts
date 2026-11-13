import { useAgendaMemberRole } from '@/hooks/partner/use-agenda-member-role';
import { useAnalytics } from '@/providers/analytics.provider';
import { usePartnerStore } from '@/store';
import type { TAgendaViewMode } from '@/store/admin/agenda';
import {
  formatMonthYear,
  formatWeekRange,
  getMonthOffsetForDate,
  getMonthStart,
  getTodayDayIndex,
  getWeekOffsetForDate,
  selectWeekDates,
  useAgendaStore,
} from '@/store/admin/agenda';
import type { IProfessional } from '@/types/api/users.types';
import { useIsMobile } from '@repo/ui';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { capitalizeFirst } from '../agenda-grid/agenda-grid.helpers';
import { AGENDA_VIEW_OPTIONS } from './agenda-toolbar.constants';
import type { TAgendaToolbarVariant } from './agenda-toolbar.types';

const EMPTY_PROFESSIONALS: IProfessional[] = [];
const LAST_DAY_INDEX = 6;

export function useAgendaToolbar(variant: TAgendaToolbarVariant) {
  const analytics = useAnalytics();
  const isMobile = useIsMobile();
  const { isProfessional } = useAgendaMemberRole();
  const weekDates = useAgendaStore(selectWeekDates);
  const currentWeek = useAgendaStore((state) => state.currentWeek);
  const setCurrentWeek = useAgendaStore((state) => state.setCurrentWeek);
  const currentMonth = useAgendaStore((state) => state.currentMonth);
  const setCurrentMonth = useAgendaStore((state) => state.setCurrentMonth);
  const selectedDayIndex = useAgendaStore((state) => state.selectedDayIndex);
  const setSelectedDayIndex = useAgendaStore(
    (state) => state.setSelectedDayIndex,
  );
  const isBlockMode = useAgendaStore((state) => state.isBlockMode);
  const setIsBlockMode = useAgendaStore((state) => state.setIsBlockMode);
  const setIsBlockDialogOpen = useAgendaStore(
    (state) => state.setIsBlockDialogOpen,
  );
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
  // O mobile e o modo foco são sempre por semana, com a faixa de dias.
  const effectiveViewMode: TAgendaViewMode =
    isMobile || isFocus ? 'week' : viewMode;
  const isDayNavigation = effectiveViewMode === 'day';
  const isMonthNavigation = effectiveViewMode === 'month';

  const periodLabel = useMemo(() => {
    if (isMonthNavigation) {
      return capitalizeFirst(formatMonthYear(getMonthStart(currentMonth)));
    }

    if (isMobile) {
      return capitalizeFirst(
        formatMonthYear(weekDates[selectedDayIndex] ?? weekDates[0]),
      );
    }

    return formatWeekRange(weekDates);
  }, [isMonthNavigation, isMobile, currentMonth, weekDates, selectedDayIndex]);

  const navigationLabels = useMemo(() => {
    if (isMonthNavigation) {
      return { previous: 'Mês anterior', next: 'Próximo mês' };
    }

    if (isDayNavigation) {
      return { previous: 'Dia anterior', next: 'Próximo dia' };
    }

    return isMobile
      ? { previous: 'Dias anteriores', next: 'Próximos dias' }
      : { previous: 'Semana anterior', next: 'Próxima semana' };
  }, [isMonthNavigation, isDayNavigation, isMobile]);

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

    if (isMonthNavigation) {
      setCurrentMonth(currentMonth - 1);
      return;
    }

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
    isMonthNavigation,
    isDayNavigation,
    currentMonth,
    currentWeek,
    selectedDayIndex,
    goToWeek,
    setCurrentMonth,
    setCurrentWeek,
    setSelectedDayIndex,
  ]);

  const handleNext = useCallback(() => {
    analytics.track('agenda_navigated', {
      direction: 'next',
      unit: navigationUnit,
    });

    if (isMonthNavigation) {
      setCurrentMonth(currentMonth + 1);
      return;
    }

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
    isMonthNavigation,
    isDayNavigation,
    currentMonth,
    currentWeek,
    selectedDayIndex,
    goToWeek,
    setCurrentMonth,
    setCurrentWeek,
    setSelectedDayIndex,
  ]);

  const handleToday = useCallback(() => {
    analytics.track('agenda_navigated', {
      direction: 'today',
      unit: navigationUnit,
    });
    setCurrentMonth(0);
    goToWeek(0);
  }, [analytics, navigationUnit, goToWeek, setCurrentMonth]);

  const handleToggleBlockMode = useCallback(() => {
    const newBlockMode = !isBlockMode;
    setIsBlockMode(newBlockMode);
    analytics.track('agenda_block_mode_toggled', { enabled: newBlockMode });
    toast.info(
      newBlockMode ? 'Modo de bloqueio ativado' : 'Modo de bloqueio desativado',
    );
  }, [analytics, isBlockMode, setIsBlockMode]);

  const handleOpenBlockDialog = useCallback(() => {
    setIsBlockDialogOpen(true);
  }, [setIsBlockDialogOpen]);

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

  /**
   * Trocar de visão mantém o período: a semana leva ao mês do dia escolhido;
   * o mês volta à semana de hoje (se for o mês atual) ou à do dia 1.
   */
  const handleViewModeChange = useCallback(
    (mode: TAgendaViewMode) => {
      if (mode === viewMode) return;

      analytics.track('agenda_view_changed', {
        view_mode: mode === 'week' ? 'grid' : mode,
      });

      if (mode === 'month') {
        const referenceDate = weekDates[selectedDayIndex] ?? weekDates[0];
        setCurrentMonth(
          referenceDate ? getMonthOffsetForDate(referenceDate) : 0,
        );
        setViewMode(mode);
        return;
      }

      if (viewMode === 'month') {
        const reference =
          currentMonth === 0 ? new Date() : getMonthStart(currentMonth);
        setCurrentWeek(getWeekOffsetForDate(reference));
        setSelectedDayIndex(getTodayDayIndex(reference));
      } else if (mode === 'day' && currentWeek === 0) {
        setSelectedDayIndex(getTodayDayIndex());
      }

      setViewMode(mode);
    },
    [
      analytics,
      viewMode,
      weekDates,
      selectedDayIndex,
      currentMonth,
      currentWeek,
      setViewMode,
      setCurrentMonth,
      setCurrentWeek,
      setSelectedDayIndex,
    ],
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
    isMonthNavigation,
    periodLabel,
    navigationLabels,
    isBlockMode,
    viewMode: effectiveViewMode,
    viewOptions: AGENDA_VIEW_OPTIONS,
    selectedProfessional,
    professionals,
    // O profissional só vê a própria agenda: o filtro não faz sentido.
    showProfessionalFilter: !isProfessional,

    // Actions
    handlePrevious,
    handleNext,
    handleToday,
    handleToggleBlockMode,
    handleOpenBlockDialog,
    handleEnterFocusMode,
    handleExitFocusMode,
    handleViewModeChange,
    handleOpenAddAppointment,
    handleProfessionalChange,
  };
}
