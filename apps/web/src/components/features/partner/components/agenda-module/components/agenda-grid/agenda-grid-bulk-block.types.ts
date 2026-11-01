import { IBlockedTime } from '@/types/api/blocked-times.types';

/**
 * ANCR-FA Types for Bulk Block Selection
 * Represents a unique time slot identifier
 */
export type TSlotId = `${string}-${number}-${string}`; // professionalId-dayIndex-time

/**
 * Slot selection data
 */
export type TSelectedSlot = {
  id?: string;
  professionalId: string;
  dayIndex: number;
  time: string;
  date: string;
  isBlocked: boolean;
};

/**
 * Bulk block hook configuration
 */
export type TUseBulkBlockConfig = {
  isBlockMode: boolean;
  onBulkBlock: (slots: TSelectedSlot[]) => void;
};

/**
 * Bulk block hook return type
 */
export type TUseBulkBlockReturn = {
  selectedSlots: Set<TSlotId>;
  isDragging: boolean;
  isSlotSelected: (
    professionalId: string,
    dayIndex: number,
    time: string,
  ) => boolean;
  handleSlotMouseDown: (
    blockedTime: IBlockedTime | undefined,
    professionalId: string,
    dayIndex: number,
    time: string,
    date: string,
  ) => void;
  handleSlotMouseEnter: (
    blockedTime: IBlockedTime | undefined,
    professionalId: string,
    dayIndex: number,
    time: string,
    date: string,
  ) => void;
  handleSlotMouseUp: () => void;
  clearSelection: () => void;
  executeBlockAction: () => void;
  selectedSlotsArray: TSelectedSlot[];
  bulkActionLabel: string;
  removeSlotFromSelection: (
    professionalId: string,
    dayIndex: number,
    time: string,
  ) => void;
  shouldIgnoreSlotClick: (clickDetail: number) => boolean;
};

/**
 * Bulk action toolbar configuration
 */
export type TBulkActionToolbarConfig = {
  selectedCount: number;
  actionLabel: string;
  onBlock: () => void;
  onClear: () => void;
};
