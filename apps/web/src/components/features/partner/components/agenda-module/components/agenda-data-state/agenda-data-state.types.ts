import type { ReactNode } from 'react';

export type TAgendaDataStatus = 'no-store' | 'loading' | 'error' | 'ready';

export type TAgendaDataStateConfig = {
  children: ReactNode;
};
