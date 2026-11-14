import type { PANEL_CHIP_TONE_CLASS } from './audit-logs-module.styles';

export type TPanelChipTone = keyof typeof PANEL_CHIP_TONE_CLASS;

/** O que a tela mostra de uma ação: frase, área e o selo de quem fez. */
export type TAuditActionDescriptor = {
  label: string;
  area: string;
};

export type TAuditActorBadge = {
  label: string;
  tone: TPanelChipTone;
};

export type TAuditAreaOption = {
  value: string;
  label: string;
};

/** Linha pronta da tabela de histórico. */
export type TAuditLogRow = {
  id: string;
  when: string;
  whenFull: string;
  actorName: string;
  actorBadge: TAuditActorBadge;
  action: string;
  area: string;
  origin: string;
  payload: string | null;
  isFailure: boolean;
};

export type TAuditActorOption = {
  value: string;
  label: string;
};
