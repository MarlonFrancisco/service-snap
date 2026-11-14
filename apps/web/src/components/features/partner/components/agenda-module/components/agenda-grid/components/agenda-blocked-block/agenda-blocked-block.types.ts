import type { IBlockedTime } from '@/types/api/blocked-times.types';
import type { CSSProperties } from 'react';
import type { TAgendaBlockedBlock } from '../../agenda-grid.types';

export type TAgendaBlockedBlockConfig = {
  block: TAgendaBlockedBlock;
  style: CSSProperties;
  onClick: (blockedTime: IBlockedTime) => void;
};
