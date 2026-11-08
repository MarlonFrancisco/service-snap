import type {
  IWhatsappCheck,
  IWhatsappIdsSuggestion,
} from '@/types/api/whatsapp.types';

export interface IWhatsappConnectGuideProps {
  /** Etapa aberta ao entrar, vinda de `?step=`. */
  initialStep: number;
}

export interface IGuideSummaryItem {
  label: string;
  /** Valor para exibir: o token vem mascarado. Vazio quando ainda falta. */
  value: string;
  step: number;
}

export interface IGuideSummaryProps {
  items: IGuideSummaryItem[];
  webhookTokenLabel: string;
  onGoToStep: (step: number) => void;
}

export interface IGuideWebhookStepProps {
  webhookUrl: string;
  webhookTokenLabel: string;
  hasWebhookToken: boolean;
  onCopyUrl: () => void;
  onCopyToken: () => void;
}

export interface IGuideVerifyStepProps {
  onVerify: () => void;
  isVerifying: boolean;
  hasResult: boolean;
  checks: IWhatsappCheck[];
  onReviewStep: (step: number) => void;
  onUseSuggestion: (suggestion: IWhatsappIdsSuggestion) => void;
}
