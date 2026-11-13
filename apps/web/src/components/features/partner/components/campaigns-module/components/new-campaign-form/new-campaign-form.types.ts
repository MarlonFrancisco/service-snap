import type {
  TCampaignAudience,
  TCampaignChannelChoice,
  TChannelOption,
} from '../../campaigns-module.types';

export type TNewCampaignFormConfig = {
  storeId: string;
  storeName: string;
  audience: TCampaignAudience;
  channelOptions: TChannelOption[];
  onChannelChange: (channel: TCampaignChannelChoice) => void;
  hasWhatsappPlan: boolean;
};

export type TUseNewCampaignFormConfig = TNewCampaignFormConfig;

/** Situação do WhatsApp para a campanha. */
export type TWhatsappCampaignState =
  | 'no-plan'
  | 'loading'
  | 'not-connected'
  | 'no-template'
  | 'ready';

export type TTemplateOption = {
  key: string;
  name: string;
  language: string;
  label: string;
};

export type TTemplatePreviewParam = {
  position: number;
  value: string;
};
