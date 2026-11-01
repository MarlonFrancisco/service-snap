import type { LucideIcon } from 'lucide-react';

export type TStatePanelConfig = {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: 'neutral' | 'error';
  actionLabel?: string;
  isActionDisabled?: boolean;
  onAction?: () => void;
};
