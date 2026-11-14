import type {
  ICampaign,
  ICampaignRecipient,
  IInactiveCustomer,
  TCampaignChannel,
  TCampaignRecipientStatus,
  TCampaignStatus,
} from '@/types/api/campaigns.types';
import type { IWhatsappTemplateSummary } from '@/types/api/whatsapp.types';
import { formatDay } from '../customers-module/customers-module.helpers';
import { formatShortDate } from '../packages-module/packages-module.helpers';
import type { TRetentionChip } from '../packages-module/packages-module.types';
import type {
  TCampaignChannelChoice,
  TCampaignRecipientRow,
  TCampaignRow,
  TInactiveCustomerRow,
  TInactiveDaysOption,
  TTemplateVariableSource,
  TTemplateVariableSourceOption,
} from './campaigns-module.types';

export const DEFAULT_INACTIVE_DAYS = 60;
export const MAX_TEMPLATE_VARIABLES = 10;
export const MIN_EMAIL_MESSAGE = 10;
export const MAX_EMAIL_MESSAGE = 1000;

/** Campanha só traz o nome: mesmo texto da ficha para quem não tem nome. */
export const getPersonName = ({
  firstName,
  lastName,
}: {
  firstName: string | null;
  lastName: string | null;
}) =>
  [firstName, lastName].filter(Boolean).join(' ').trim() || 'Cliente sem nome';

export const INACTIVE_DAYS_OPTIONS: readonly TInactiveDaysOption[] = [
  { value: 60, label: '60 dias' },
  { value: 90, label: '90 dias' },
  { value: 180, label: '180 dias' },
];

export const TEMPLATE_VARIABLE_SOURCES: readonly TTemplateVariableSourceOption[] =
  [
    { value: 'name', label: 'Nome do cliente' },
    { value: 'store', label: 'Nome da loja' },
    { value: 'text', label: 'Texto fixo' },
  ];

export const CHANNEL_LABEL: Record<TCampaignChannel, string> = {
  whatsapp: 'WhatsApp',
  email: 'E-mail',
};

const NO_CONTACT_LABEL: Record<TCampaignChannel, string> = {
  whatsapp: 'Sem WhatsApp',
  email: 'Sem e-mail',
};

/** Canais que a escolha cobre, na ordem de envio. */
export const getChannels = (
  choice: TCampaignChannelChoice,
): TCampaignChannel[] => (choice === 'both' ? ['whatsapp', 'email'] : [choice]);

export const canReceiveBy = (
  customer: Pick<IInactiveCustomer, 'hasWhatsapp' | 'hasEmail'>,
  channel: TCampaignChannel,
) => (channel === 'whatsapp' ? customer.hasWhatsapp : customer.hasEmail);

export const canReceive = (
  customer: Pick<IInactiveCustomer, 'hasWhatsapp' | 'hasEmail'>,
  choice: TCampaignChannelChoice,
) => getChannels(choice).some((channel) => canReceiveBy(customer, channel));

const getContactChips = (
  customer: IInactiveCustomer,
  choice: TCampaignChannelChoice,
): TRetentionChip[] => {
  if (choice !== 'both') {
    return canReceiveBy(customer, choice)
      ? [{ label: CHANNEL_LABEL[choice], tone: 'ok' }]
      : [{ label: NO_CONTACT_LABEL[choice], tone: 'neutral' }];
  }

  const chips = getChannels(choice)
    .filter((channel) => canReceiveBy(customer, channel))
    .map<TRetentionChip>((channel) => ({
      label: CHANNEL_LABEL[channel],
      tone: 'ok',
    }));

  return chips.length ? chips : [{ label: 'Sem contato', tone: 'neutral' }];
};

export const formatDaysAway = (days: number) =>
  `${days} ${days === 1 ? 'dia' : 'dias'}`;

export const formatCustomersCount = (count: number) =>
  `${count} ${count === 1 ? 'cliente' : 'clientes'}`;

export const toInactiveCustomerRow = (
  customer: IInactiveCustomer,
  choice: TCampaignChannelChoice,
  deselectedIds: ReadonlySet<string>,
): TInactiveCustomerRow => {
  const isReachable = canReceive(customer, choice);

  return {
    id: customer.id,
    name: getPersonName(customer),
    lastVisit: formatDay(customer.lastVisit),
    daysAway: formatDaysAway(customer.daysAway),
    chips: getContactChips(customer, choice),
    canReceive: isReachable,
    isSelected: isReachable && !deselectedIds.has(customer.id),
    source: customer,
  };
};

const CAMPAIGN_STATUS_CHIP: Record<TCampaignStatus, TRetentionChip> = {
  queued: { label: 'Na fila', tone: 'neutral' },
  sending: { label: 'Enviando', tone: 'info' },
  done: { label: 'Concluída', tone: 'ok' },
};

export const toCampaignRow = (
  campaign: ICampaign,
  timeZone?: string,
): TCampaignRow => ({
  id: campaign.id,
  name: campaign.name,
  channel: CHANNEL_LABEL[campaign.channel] ?? campaign.channel,
  date: formatShortDate(campaign.createdAt, timeZone),
  sent: `${campaign.sentCount ?? 0} de ${campaign.recipientsCount}`,
  failed: String(campaign.failedCount ?? 0),
  chip: CAMPAIGN_STATUS_CHIP[campaign.status] ?? CAMPAIGN_STATUS_CHIP.queued,
  source: campaign,
});

const RECIPIENT_STATUS_CHIP: Record<TCampaignRecipientStatus, TRetentionChip> =
  {
    queued: { label: 'Na fila', tone: 'neutral' },
    sent: { label: 'Enviada', tone: 'ok' },
    failed: { label: 'Falhou', tone: 'error' },
    skipped: { label: 'Ficou de fora', tone: 'warn' },
  };

const SKIP_REASON: Record<string, string> = {
  'opt-out': 'Pediu para não receber',
  'no-phone': 'Sem WhatsApp',
  'no-email': 'Sem e-mail',
};

const getRecipientDetail = (
  recipient: ICampaignRecipient,
  timeZone?: string,
) => {
  if (recipient.status === 'sent') {
    return recipient.sentAt
      ? `Em ${formatShortDate(recipient.sentAt, timeZone)}`
      : '';
  }
  if (!recipient.error) return '';

  return SKIP_REASON[recipient.error] ?? recipient.error;
};

export const toRecipientRow = (
  recipient: ICampaignRecipient,
  timeZone?: string,
): TCampaignRecipientRow => ({
  id: recipient.id,
  name: getPersonName(recipient.customer),
  chip: RECIPIENT_STATUS_CHIP[recipient.status] ?? RECIPIENT_STATUS_CHIP.queued,
  detail: getRecipientDetail(recipient, timeZone),
});

/** Fora da janela de 24h a Meta só entrega template aprovado de marketing. */
export const isMarketingTemplate = (template: IWhatsappTemplateSummary) =>
  template.status === 'APPROVED' &&
  (!template.category || template.category === 'MARKETING');

/** Valor que a API troca pelo dado de cada cliente. */
export const toBodyParam = (variable: {
  source: TTemplateVariableSource;
  text: string;
}) => {
  if (variable.source === 'name') return '{nome}';
  if (variable.source === 'store') return '{loja}';
  return variable.text.trim();
};

/** Como a variável sai para um cliente de exemplo. */
export const previewBodyParam = (
  variable: { source: TTemplateVariableSource; text: string },
  values: { customerName: string; storeName: string },
) => {
  if (variable.source === 'name') return values.customerName;
  if (variable.source === 'store') return values.storeName;
  return variable.text.trim() || '-';
};
