import { getTodayDayIndex, useAgendaStore } from '@/store/admin/agenda';
import { usePartnerStore } from '@/store/partner';
import { useEffect } from 'react';
import {
  useAgendaDataState,
  useAgendaSchedulesQuery,
} from './components/agenda-data-state/agenda-data-state.hook';

export const useAgendaModule = () => {
  const isFocusMode = useAgendaStore((state) => state.isFocusMode);
  const selectedProfessional = useAgendaStore(
    (state) => state.selectedProfessional,
  );
  const setSelectedProfessional = useAgendaStore(
    (state) => state.setSelectedProfessional,
  );
  const storeMembers = usePartnerStore(
    (state) => state.activeStore.storeMembers,
  );

  const { data: appointments } = useAgendaSchedulesQuery();
  const { status } = useAgendaDataState();

  useEffect(() => {
    if (appointments) {
      useAgendaStore.setState({
        appointments,
      });
    }
  }, [appointments]);

  // A store é global: ao voltar para a tela, a semana atual reabre no dia de hoje.
  useEffect(() => {
    const { currentWeek, setSelectedDayIndex } = useAgendaStore.getState();

    if (currentWeek === 0) {
      setSelectedDayIndex(getTodayDayIndex());
    }
  }, []);

  // O filtro pode apontar para um profissional de outra loja depois da troca.
  useEffect(() => {
    if (
      storeMembers?.length &&
      selectedProfessional !== 'all' &&
      !storeMembers.some((member) => member.id === selectedProfessional)
    ) {
      setSelectedProfessional('all');
    }
  }, [storeMembers, selectedProfessional, setSelectedProfessional]);

  return {
    isFocusMode,
    hasNoStore: status === 'no-store',
  };
};
