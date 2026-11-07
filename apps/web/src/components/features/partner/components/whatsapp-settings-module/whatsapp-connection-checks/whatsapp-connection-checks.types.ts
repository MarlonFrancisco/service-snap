import type { IWhatsappCheck } from '@/types/api/whatsapp.types';
import type { ReactNode } from 'react';

export interface IWhatsappConnectionChecksProps {
  checks: IWhatsappCheck[];
  /** Ação de cada item com problema: link ou botão para a etapa do guia que resolve. */
  renderReview?: (step: number) => ReactNode;
}
