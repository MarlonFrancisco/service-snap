import { isApiHttpError } from '@/service/api';
import type { TCreateCampaign } from '@/types/api/campaigns.types';
import type { IWhatsappTemplateSummary } from '@/types/api/whatsapp.types';
import {
  CHANNEL_LABEL,
  getChannels,
  isMarketingTemplate,
  toBodyParam,
} from '../../campaigns-module.helpers';
import type { TCampaignAudience } from '../../campaigns-module.types';
import type { TNewCampaignSchema } from './new-campaign-form.schema';
import type { TTemplateOption } from './new-campaign-form.types';

const TEMPLATE_KEY_SEPARATOR = '::';

export const toTemplateOptions = (
  templates: IWhatsappTemplateSummary[],
): TTemplateOption[] =>
  templates.filter(isMarketingTemplate).map((template) => ({
    key: `${template.name}${TEMPLATE_KEY_SEPARATOR}${template.language}`,
    name: template.name,
    language: template.language,
    label: `${template.name} (${template.language})`,
  }));

const parseTemplateKey = (key: string) => {
  const [name = '', language = ''] = key.split(TEMPLATE_KEY_SEPARATOR);

  return { name, language };
};

/** Uma campanha por canal, cada uma só com quem tem aquele contato. */
export const toCampaignPayloads = (
  values: TNewCampaignSchema,
  audience: TCampaignAudience,
): TCreateCampaign[] =>
  getChannels(audience.channel)
    .map<TCreateCampaign>((channel) => {
      const base = {
        name: values.name.trim(),
        channel,
        inactiveDays: audience.inactiveDays,
      };

      if (channel === 'whatsapp') {
        return {
          ...base,
          customerIds: audience.whatsappIds,
          template: {
            ...parseTemplateKey(values.templateKey),
            bodyParams: values.variables.map(toBodyParam),
          },
        };
      }

      return {
        ...base,
        customerIds: audience.emailIds,
        message: values.message.trim(),
      };
    })
    .filter((payload) => payload.customerIds?.length);

const API_MESSAGES: Record<string, string> = {
  'Template not approved by Meta': 'O template não está aprovado pela Meta.',
  'Campaigns need a MARKETING template':
    'Campanha precisa de um template da categoria Marketing.',
  'No customer can receive this campaign':
    'Nenhum cliente escolhido pode receber por este canal.',
};

export const getCreateCampaignError = (
  error: unknown,
  channel: TCreateCampaign['channel'],
) => {
  const prefix = `${CHANNEL_LABEL[channel]}: `;

  if (isApiHttpError(error)) {
    if (error.status === 503) {
      return `${prefix}o envio em segundo plano não está disponível agora. Tente mais tarde.`;
    }
    if (error.status === 403) {
      return `${prefix}seu plano ou seu papel na loja não permite enviar esta campanha.`;
    }
    if (API_MESSAGES[error.message]) {
      return `${prefix}${API_MESSAGES[error.message]}`;
    }
    if (error.status === 400) {
      return `${prefix}confira o template, as variáveis e o texto.`;
    }
  }

  return `${prefix}não foi possível criar a campanha. Tente de novo.`;
};
