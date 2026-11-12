import { useAgendaMemberRole } from '@/hooks/partner/use-agenda-member-role';
import { useAnalytics } from '@/providers/analytics.provider';
import { useAgendaStore } from '@/store/admin/agenda';
import { useIsMobile } from '@repo/ui';
import { useCallback } from 'react';

export function useAgendaDefaultView() {
  const analytics = useAnalytics();
  const isMobile = useIsMobile();
  const { isProfessional } = useAgendaMemberRole();
  const viewMode = useAgendaStore((state) => state.viewMode);
  const setIsAddAppointmentOpen = useAgendaStore(
    (state) => state.setIsAddAppointmentOpen,
  );

  const handleOpenAddAppointment = useCallback(() => {
    analytics.track('appointment_form_opened', { source: 'default_view' });
    setIsAddAppointmentOpen({ isAddAppointmentOpen: true });
  }, [analytics, setIsAddAppointmentOpen]);

  // No mobile a agenda já é por dia; dia e mês em grade só existem no desktop.
  const view = isMobile ? 'week' : viewMode;

  return {
    view,
    showProfessionalNote: isProfessional,
    handleOpenAddAppointment,
  };
}
