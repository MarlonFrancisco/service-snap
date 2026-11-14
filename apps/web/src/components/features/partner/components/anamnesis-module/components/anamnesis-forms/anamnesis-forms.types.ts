/** Ficha na lista lateral da tela de fichas. */
export type TAnamnesisFormListItem = {
  id: string;
  name: string;
  /** "Versão 2 · 4 perguntas" */
  meta: string;
  isActive: boolean;
  isSelected: boolean;
};

/** Ficha aberta no editor: uma salva (`id`) ou uma nova. */
export type TAnamnesisFormSelection = string | 'new' | null;
