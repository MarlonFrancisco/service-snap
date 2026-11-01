import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type TModuleStatePanelConfig = {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: 'neutral' | 'danger';
  /** `h2` quando o painel é a página inteira; `h3` quando vem depois de um título. */
  headingLevel?: 'h2' | 'h3';
  role?: 'alert' | 'status';
  children?: ReactNode;
};

export type TModuleErrorStateConfig = Pick<
  TModuleStatePanelConfig,
  'headingLevel'
> & {
  onRetry: () => void;
  isRetrying?: boolean;
};

export type TNoStoreStateConfig = Pick<TModuleStatePanelConfig, 'headingLevel'>;
