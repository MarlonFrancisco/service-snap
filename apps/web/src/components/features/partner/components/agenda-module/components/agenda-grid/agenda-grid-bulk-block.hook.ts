import { IBlockedTime } from '@/types/api/blocked-times.types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  TSelectedSlot,
  TSlotId,
  TUseBulkBlockConfig,
  TUseBulkBlockReturn,
} from './agenda-grid-bulk-block.types';
import { getBulkActionLabel } from './agenda-grid.helpers';

/**
 * Gesto do ponteiro em andamento:
 * - `single`: pressionou sem seleção pendente; se soltar no mesmo slot, é clique.
 * - `selection`: arrastou ou mexeu em uma seleção; o clique não aplica nada.
 */
type TPointerGesture = 'none' | 'single' | 'selection';

/**
 * Hook-Driven Architecture: Bulk Block Selection Logic
 * Clique aplica na hora; arrasto monta uma seleção aplicada pela barra flutuante.
 *
 * @param config - Configuration object with isBlockMode and onBulkBlock callback
 * @returns Object with selection state and handlers
 */
export const useAgendaGridBulkBlock = (
  config: TUseBulkBlockConfig,
): TUseBulkBlockReturn => {
  const { isBlockMode, onBulkBlock } = config;

  const [selectedSlots, setSelectedSlots] = useState<Set<TSlotId>>(new Set());
  const [isDragging, setIsDragging] = useState(false);

  const selectedSlotsDataRef = useRef<Map<TSlotId, TSelectedSlot>>(new Map());
  const pointerGestureRef = useRef<TPointerGesture>('none');
  const dragOriginRef = useRef<{ slotId: TSlotId; slot: TSelectedSlot } | null>(
    null,
  );

  const getSlotId = useCallback(
    (professionalId: string, dayIndex: number, time: string): TSlotId => {
      return `${professionalId}-${dayIndex}-${time}`;
    },
    [],
  );

  const isSlotSelected = useCallback(
    (professionalId: string, dayIndex: number, time: string): boolean => {
      return selectedSlots.has(getSlotId(professionalId, dayIndex, time));
    },
    [selectedSlots, getSlotId],
  );

  const addToSelection = useCallback((slotId: TSlotId, slot: TSelectedSlot) => {
    setSelectedSlots((prev) => new Set(prev).add(slotId));
    selectedSlotsDataRef.current.set(slotId, slot);
  }, []);

  const removeSlotFromSelection = useCallback(
    (professionalId: string, dayIndex: number, time: string) => {
      const slotId = getSlotId(professionalId, dayIndex, time);

      setSelectedSlots((prev) => {
        const next = new Set(prev);
        next.delete(slotId);
        return next;
      });

      selectedSlotsDataRef.current.delete(slotId);
    },
    [getSlotId],
  );

  const handleSlotMouseDown = useCallback(
    (
      blockedTime: IBlockedTime | undefined,
      professionalId: string,
      dayIndex: number,
      time: string,
      date: string,
    ) => {
      if (!isBlockMode) return;

      const slotId = getSlotId(professionalId, dayIndex, time);
      const slot: TSelectedSlot = {
        id: blockedTime?.id,
        professionalId,
        dayIndex,
        time,
        date,
        isBlocked: !!blockedTime,
      };

      setIsDragging(true);
      dragOriginRef.current = { slotId, slot };

      if (selectedSlots.size === 0) {
        pointerGestureRef.current = 'single';
        return;
      }

      pointerGestureRef.current = 'selection';

      if (selectedSlots.has(slotId)) {
        removeSlotFromSelection(professionalId, dayIndex, time);
      } else {
        addToSelection(slotId, slot);
      }
    },
    [
      isBlockMode,
      selectedSlots,
      getSlotId,
      addToSelection,
      removeSlotFromSelection,
    ],
  );

  const handleSlotMouseEnter = useCallback(
    (
      blockedTime: IBlockedTime | undefined,
      professionalId: string,
      dayIndex: number,
      time: string,
      date: string,
    ) => {
      if (!isBlockMode || !isDragging) return;

      const slotId = getSlotId(professionalId, dayIndex, time);
      const origin = dragOriginRef.current;

      if (pointerGestureRef.current === 'single' && origin) {
        if (origin.slotId === slotId) return;
        addToSelection(origin.slotId, origin.slot);
      }

      pointerGestureRef.current = 'selection';

      if (!selectedSlots.has(slotId)) {
        addToSelection(slotId, {
          id: blockedTime?.id,
          professionalId,
          dayIndex,
          time,
          date,
          isBlocked: !!blockedTime,
        });
      }
    },
    [isBlockMode, isDragging, selectedSlots, getSlotId, addToSelection],
  );

  const handleSlotMouseUp = useCallback(() => {
    setIsDragging(false);
    dragOriginRef.current = null;
  }, []);

  /**
   * Teclado gera clique com `detail` 0 e nunca passa pelo ponteiro: sempre aplica.
   * Com o ponteiro, o clique só aplica quando o gesto foi um clique simples.
   */
  const shouldIgnoreSlotClick = useCallback((clickDetail: number) => {
    const gesture = pointerGestureRef.current;
    pointerGestureRef.current = 'none';
    return clickDetail !== 0 && gesture === 'selection';
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSlots(new Set());
    selectedSlotsDataRef.current.clear();
    dragOriginRef.current = null;
    pointerGestureRef.current = 'none';
  }, []);

  const executeBlockAction = useCallback(() => {
    const slotsArray = Array.from(selectedSlotsDataRef.current.values());

    if (slotsArray.length > 0) {
      onBulkBlock(slotsArray);
      clearSelection();
    }
  }, [onBulkBlock, clearSelection]);

  // `selectedSlots` é o gatilho: os dados ficam no ref para não duplicar estado.
  const selectedSlotsArray = useMemo(() => {
    return selectedSlots.size > 0
      ? Array.from(selectedSlotsDataRef.current.values())
      : [];
  }, [selectedSlots]);

  const bulkActionLabel = useMemo(
    () => getBulkActionLabel(selectedSlotsArray),
    [selectedSlotsArray],
  );

  useEffect(() => {
    if (!isBlockMode) {
      clearSelection();
    }
  }, [isBlockMode, clearSelection]);

  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener('mouseup', handleSlotMouseUp);
    return () => window.removeEventListener('mouseup', handleSlotMouseUp);
  }, [isDragging, handleSlotMouseUp]);

  return {
    selectedSlots,
    isDragging,
    isSlotSelected,
    handleSlotMouseDown,
    handleSlotMouseEnter,
    handleSlotMouseUp,
    clearSelection,
    executeBlockAction,
    selectedSlotsArray,
    bulkActionLabel,
    removeSlotFromSelection,
    shouldIgnoreSlotClick,
  };
};
