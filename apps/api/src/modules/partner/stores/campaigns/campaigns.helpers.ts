import { signHmac } from '../../../../utils/helpers/crypto.helpers';
import type {
  TCampaignChannel,
  TCampaignTemplate,
  TOptOutSubject,
} from './campaigns.types';

export const CAMPAIGN_CHANNELS: readonly TCampaignChannel[] = [
  'whatsapp',
  'email',
];
/** O link de sair da lista vale por um ano: o e-mail fica na caixa do cliente. */
export const OPT_OUT_LINK_DAYS = 365;

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

/** Segredo próprio do link, derivado da chave de dados (como o da anamnese). */
export const deriveOptOutLinkSecret = (key: Buffer) =>
  signHmac(key.toString('base64'), 'marketing-opt-out-v1');

/** Sem ponto: o token assinado separa as partes por ponto. */
export const toOptOutSubject = ({ storeId, customerId }: TOptOutSubject) =>
  `${storeId}~${customerId}`;

export const parseOptOutSubject = (subject: string): TOptOutSubject | null => {
  const [storeId, customerId] = subject.split('~');

  return storeId && customerId ? { storeId, customerId } : null;
};

/** Texto da loja em linhas: o template escapa cada uma e junta com `<br>`. */
export const toMessageLines = (message: string) =>
  message.replace(/\r\n?/g, '\n').split('\n');
