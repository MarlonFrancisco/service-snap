import type {
  ICampaign,
  IInactiveCustomer,
  TCampaignChannel,
} from '@/types/api/campaigns.types';
import type { TRetentionChip } from '../packages-module/packages-module.types';

/** "Os dois" cria uma campanha por canal. */
export type TCampaignChannelChoice = TCampaignChannel | 'both';

export type TChannelOption = {
  value: TCampaignChannelChoice;
  label: string;
  disabled?: boolean;
};

export type TInactiveDaysOption = {
  value: number;
  label: string;
};

export type TTemplateVariableSource = 'name' | 'store' | 'text';

export type TTemplateVariableSourceOption = {
  value: TTemplateVariableSource;
  label: string;
};

/** Linha da tabela de quem sumiu, já formatada para o canal escolhido. */
export type TInactiveCustomerRow = {
  id: string;
  name: string;
  lastVisit: string;
  daysAway: string;
  chips: TRetentionChip[];
  canReceive: boolean;
  isSelected: boolean;
  source: IInactiveCustomer;
};

export type TCampaignRow = {
  id: string;
  name: string;
  channel: string;
  date: string;
  sent: string;
  failed: string;
  chip: TRetentionChip;
  source: ICampaign;
};

export type TCampaignRecipientRow = {
  id: string;
  name: string;
  chip: TRetentionChip;
  detail: string;
};

/** O que o formulário precisa saber de quem vai receber. */
export type TCampaignAudience = {
  channel: TCampaignChannelChoice;
  inactiveDays: number;
  /** Escolhidos que têm o contato de cada canal. */
  whatsappIds: string[];
  emailIds: string[];
  /** Clientes diferentes que recebem por algum canal. */
  total: number;
  /** Para a prévia: o primeiro escolhido. */
  sample: IInactiveCustomer | null;
};
