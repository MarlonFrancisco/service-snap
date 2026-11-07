import type {
  IWhatsappCheck,
  IWhatsappIdsSuggestion,
} from '@/types/api/whatsapp.types';
import type { ReactNode } from 'react';

export interface IWhatsappConnectionChecksProps {
  checks: IWhatsappCheck[];
  /** Ação de cada item com problema: link ou botão para a etapa do guia que resolve. */
  renderReview?: (step: number) => ReactNode;
  /** Troca os IDs salvos pelos da sugestão; sem ele, as sugestões não aparecem. */
  onUseSuggestion?: (suggestion: IWhatsappIdsSuggestion) => void;
  isApplyingSuggestion?: boolean;
}
