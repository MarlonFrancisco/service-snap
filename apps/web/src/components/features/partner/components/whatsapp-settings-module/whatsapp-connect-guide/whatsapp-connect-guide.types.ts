import type {
  IWhatsappCheck,
  IWhatsappIdsSuggestion,
} from '@/types/api/whatsapp.types';

export interface IWhatsappConnectGuideProps {
  /** Etapa aberta ao entrar, vinda de `?step=`. */
  initialStep: number;
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
