import { getTodayDayIndex, useAgendaStore } from '@/store/admin/agenda';
import { usePartnerStore } from '@/store/partner';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import {
  useAgendaDataState,
  useAgendaSchedulesQuery,
} from './components/agenda-data-state/agenda-data-state.hook';
import { AGENDA_PANEL_PARAM, AGENDA_PANELS } from './agenda-module.constants';

/**
 * "Meus bloqueios" e "Meu horário" do menu do profissional abrem a agenda com
 * `?painel=`. O diálogo abre pelo parâmetro e, ao fechar, a URL volta limpa.
 */
const useAgendaPanelParam = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const panel = searchParams.get(AGENDA_PANEL_PARAM);
  const isBlockDialogOpen = useAgendaStore((state) => state.isBlockDialogOpen);
  const isHoursPanelOpen = useAgendaStore((state) => state.isHoursPanelOpen);
  const openedPanelRef = useRef<string | null>(null);

  useEffect(() => {
    const { setIsBlockDialogOpen, setIsHoursPanelOpen } =
      useAgendaStore.getState();

    if (panel === AGENDA_PANELS.blocks) {
      openedPanelRef.current = panel;
      setIsHoursPanelOpen(false);
      setIsBlockDialogOpen(true);
    }

    if (panel === AGENDA_PANELS.hours) {
      openedPanelRef.current = panel;
      setIsBlockDialogOpen(false);
      setIsHoursPanelOpen(true);
    }
  }, [panel]);

  useEffect(() => {
    const openedPanel = openedPanelRef.current;
    if (!openedPanel || openedPanel !== panel) return;

    // Lido da store: no mesmo commit, o efeito acima acabou de abrir o diálogo.
    const state = useAgendaStore.getState();
    const isStillOpen =
      openedPanel === AGENDA_PANELS.blocks
        ? state.isBlockDialogOpen
        : state.isHoursPanelOpen;

    if (!isStillOpen) {
      openedPanelRef.current = null;
      router.replace(pathname, { scroll: false });
    }
  }, [panel, isBlockDialogOpen, isHoursPanelOpen, router, pathname]);
};

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

  useAgendaPanelParam();

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
