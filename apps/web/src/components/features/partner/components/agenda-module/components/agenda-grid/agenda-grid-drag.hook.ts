import { useAgendaStore } from '@/store/admin/agenda';
import { usePartnerStore } from '@/store/partner';
import type { TAgendaDropTarget, TAgendaVisit } from '@/store/admin/agenda';
import type { DragEvent } from 'react';
import { useCallback } from 'react';
import type { TAgendaDragHandlers } from './agenda-grid-drag.types';
import { getVisitItems } from './agenda-grid.helpers';

/**
 * Arrastar para remarcar (desktop). O bloco sai com o arrasto nativo do
 * navegador; a linha livre que recebe o soltar abre o popover de confirmação,
 * que é quem chama a API.
 */
export const useAgendaGridDrag = ({
  isEnabled,
}: {
  isEnabled: boolean;
}): TAgendaDragHandlers => {
  const draggedVisit = useAgendaStore((state) => state.draggedVisit);
  const dropTargetKey = useAgendaStore((state) => state.dropTargetKey);
  const pendingReschedule = useAgendaStore((state) => state.pendingReschedule);
  const setDraggedVisit = useAgendaStore((state) => state.setDraggedVisit);
  const setDropTargetKey = useAgendaStore((state) => state.setDropTargetKey);
  const setPendingReschedule = useAgendaStore(
    (state) => state.setPendingReschedule,
  );

  const canDrag = useCallback(
    (visit: TAgendaVisit) => isEnabled && visit.status === 'scheduled',
    [isEnabled],
  );

  const handleBlockDragStart = useCallback(
    (visit: TAgendaVisit, event: DragEvent<HTMLElement>) => {
      event.dataTransfer.effectAllowed = 'move';
      // O Firefox só inicia o arrasto com algum dado.
      event.dataTransfer.setData('text/plain', visit.id);
      setPendingReschedule(undefined);
      // Mudar o bloco antes de o navegador tirar a imagem do arrasto a estragaria.
      setTimeout(() => setDraggedVisit(visit), 0);
    },
    [setDraggedVisit, setPendingReschedule],
  );

  const handleBlockDragEnd = useCallback(() => {
    setDraggedVisit(undefined);
    setDropTargetKey(undefined);
  }, [setDraggedVisit, setDropTargetKey]);

  /** Outro profissional só recebe a visita se faz todos os serviços dela. */
  const canDropOn = useCallback(
    (target: TAgendaDropTarget, visit: TAgendaVisit) => {
      if (!target.storeMemberId || target.storeMemberId === visit.storeMember.id)
        return true;

      const member = usePartnerStore
        .getState()
        .activeStore.storeMembers?.find(({ id }) => id === target.storeMemberId);

      return (
        !member?.services ||
        getVisitItems(visit).every((item) =>
          member.services?.some(({ id }) => id === item.service.id),
        )
      );
    },
    [],
  );

  const handleRowDragOver = useCallback(
    (target: TAgendaDropTarget, event: DragEvent<HTMLElement>) => {
      const visit = useAgendaStore.getState().draggedVisit;
      if (!visit || !canDropOn(target, visit)) return;

      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      if (useAgendaStore.getState().dropTargetKey !== target.key) {
        setDropTargetKey(target.key);
      }
    },
    [canDropOn, setDropTargetKey],
  );

  const handleRowDragLeave = useCallback(
    (target: TAgendaDropTarget, event: DragEvent<HTMLElement>) => {
      // Passar para o botão dentro da linha também dispara o `dragleave`.
      if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
        return;
      }

      if (useAgendaStore.getState().dropTargetKey === target.key) {
        setDropTargetKey(undefined);
      }
    },
    [setDropTargetKey],
  );

  const handleRowDrop = useCallback(
    (target: TAgendaDropTarget, event: DragEvent<HTMLElement>) => {
      const visit = useAgendaStore.getState().draggedVisit;
      if (!visit || !canDropOn(target, visit)) return;

      event.preventDefault();

      const storeMemberId =
        target.storeMemberId && target.storeMemberId !== visit.storeMember.id
          ? target.storeMemberId
          : undefined;

      if (
        !storeMemberId &&
        target.date === visit.date &&
        target.time === visit.startTime
      ) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();

      setPendingReschedule({
        ...target,
        storeMemberId,
        professionalName: storeMemberId ? target.professionalName : undefined,
        visit,
        anchor: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
      });
    },
    [canDropOn, setPendingReschedule],
  );

  return {
    canDrag,
    movingVisitId: pendingReschedule?.visit.id ?? draggedVisit?.id,
    activeDropKey: dropTargetKey ?? pendingReschedule?.key,
    isDragging: !!draggedVisit,
    handleBlockDragStart,
    handleBlockDragEnd,
    handleRowDragOver,
    handleRowDragLeave,
    handleRowDrop,
  };
};
