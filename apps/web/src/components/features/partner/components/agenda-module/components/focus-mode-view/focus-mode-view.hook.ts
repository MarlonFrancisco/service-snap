import { useAnalytics } from '@/providers/analytics.provider';
import { useAgendaStore } from '@/store/admin/agenda';
import { useCallback } from 'react';

export function useFocusModeView() {
  const analytics = useAnalytics();
  const setIsAddAppointmentOpen = useAgendaStore(
    (state) => state.setIsAddAppointmentOpen,
  );

  const handleOpenAddAppointment = useCallback(() => {
    analytics.track('appointment_form_opened', { source: 'focus_mode' });
    setIsAddAppointmentOpen({ isAddAppointmentOpen: true });
  }, [analytics, setIsAddAppointmentOpen]);

  return {
    handleOpenAddAppointment,
  };
}
