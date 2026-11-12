import type { TCampaignTemplate } from './campaigns.types';

export const MAX_CAMPAIGN_RECIPIENTS = 1000;
// Limite de mensagens por chamada de lote do QStash
export const QSTASH_BATCH_SIZE = 100;
export const CAMPAIGN_MESSAGE_PATH = '/queue/campaign-messages';
export const CAMPAIGN_MESSAGE_RETRIES = 3;

/** Parâmetro de template da Meta não aceita vazio, quebra de linha nem tab. */
const toTemplateParam = (value: string) =>
  value
    .replace(/[\n\t]+/g, ' ')
    .replace(/ {4,}/g, '   ')
    .trim() || '-';

/** `{nome}` e `{loja}` no texto de cada parâmetro do template. */
export const buildCampaignParams = (
  template: TCampaignTemplate,
  values: { customerName: string; storeName: string },
) =>
  template.bodyParams.map((param) =>
    toTemplateParam(
      param
        .replace(/\{nome\}/gi, values.customerName)
        .replace(/\{loja\}/gi, values.storeName),
    ),
  );

/** Repartir em lotes para as chamadas ao QStash. */
export const chunk = <T>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size),
  );
