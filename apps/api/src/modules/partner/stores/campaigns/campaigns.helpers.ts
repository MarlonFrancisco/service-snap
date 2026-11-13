import type { TCampaignTemplate } from './campaigns.types';

export const MAX_CAMPAIGN_RECIPIENTS = 1000;

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
