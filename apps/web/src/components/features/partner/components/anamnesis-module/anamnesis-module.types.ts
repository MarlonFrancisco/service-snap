export type TAnamnesisStoreState = 'loading' | 'ready' | 'no-store' | 'error';

export type TAnamnesisServiceOption = {
  id: string;
  name: string;
};

/** Situação da ficha de um agendamento. */
export type TAnamnesisLinkStatus = 'pending' | 'submitted';
