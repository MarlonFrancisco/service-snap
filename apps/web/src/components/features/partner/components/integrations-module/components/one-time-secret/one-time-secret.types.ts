import type { ReactNode } from 'react';

export type TOneTimeSecretConfig = {
  title: string;
  value: string;
  /** Aviso de "copie agora"; sem ele, só o valor e o botão de copiar. */
  warning?: ReactNode;
  children?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
};

export type TUseCopyToClipboardConfig = {
  successMessage?: string;
};
