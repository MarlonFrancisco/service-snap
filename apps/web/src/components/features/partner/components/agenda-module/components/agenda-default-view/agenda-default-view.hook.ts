import { useAnalytics } from '@/providers/analytics.provider';
import { useAgendaStore } from '@/store/admin/agenda';
import { useIsMobile } from '@repo/ui';
import { useCallback } from 'react';

export function useAgendaDefaultView() {
  const analytics = useAnalytics();
  const isMobile = useIsMobile();
  const viewMode = useAgendaStore((state) => state.viewMode);
  const setIsAddAppointmentOpen = useAgendaStore(
    (state) => state.setIsAddAppointmentOpen,
  );

  const handleOpenAddAppointment = useCallback(() => {
    analytics.track('appointment_form_opened', { source: 'default_view' });
    setIsAddAppointmentOpen({ isAddAppointmentOpen: true });
  }, [analytics, setIsAddAppointmentOpen]);

  return {
    // No mobile a agenda já é por dia; a visão de colunas só existe no desktop.
    showDayView: viewMode === 'day' && !isMobile,
    handleOpenAddAppointment,
  };
}
