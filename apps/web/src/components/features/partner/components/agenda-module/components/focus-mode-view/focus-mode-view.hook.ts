import { useAgendaStore } from '@/store/admin/agenda';
import { useCallback } from 'react';

export function useFocusModeView() {
  const setIsAddAppointmentOpen = useAgendaStore(
    (state) => state.setIsAddAppointmentOpen,
  );

  const handleOpenAddAppointment = useCallback(() => {
    setIsAddAppointmentOpen({ isAddAppointmentOpen: true });
  }, [setIsAddAppointmentOpen]);

  return {
    handleOpenAddAppointment,
  };
}
