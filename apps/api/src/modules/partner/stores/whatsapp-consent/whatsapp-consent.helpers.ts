import { signHmac } from '../../../../utils/helpers/crypto.helpers';
import { normalizeText } from '../../../../utils/helpers/whatsapp.helpers';
import type {
  TWhatsappConsentSource,
  TWhatsappConsentText,
  TWhatsappOptOutSubject,
} from './whatsapp-consent.types';

/** O link de sair vai no e-mail e fica na caixa do cliente: vale um ano. */
export const WHATSAPP_OPT_OUT_LINK_DAYS = 365;

type TLocale = 'pt-BR' | 'pt-PT';

/**
 * Textos aceitos, por versão. Mudar um texto é criar uma versão nova: a antiga
 * continua aqui para dizer o que cada cliente aceitou.
 */
const CONSENT_TEXTS: Record<
  string,
  { source: TWhatsappConsentSource[]; text: Record<TLocale, string> }
> = {
  'checkout-v1': {
    source: ['checkout', 'profile'],
    text: {
      'pt-BR':
        'Quero receber lembretes e avisos dos meus agendamentos desta loja por WhatsApp.',
      'pt-PT':
        'Quero receber lembretes e avisos das minhas marcações desta loja por WhatsApp.',
    },
  },
  // Igual ao v1 mais a frase de como sair, que a caixa já mostrava: o texto
  // guardado tem de ser exatamente o que o cliente viu (#37)
  'checkout-v2': {
    source: ['checkout', 'profile'],
    text: {
      'pt-BR':
        'Quero receber lembretes e avisos dos meus agendamentos desta loja por WhatsApp. Para deixar de receber, responda PARAR no WhatsApp.',
      'pt-PT':
        'Quero receber lembretes e avisos das minhas marcações desta loja por WhatsApp. Para deixar de receber, responda PARAR no WhatsApp.',
    },
  },
  'bot-v1': {
    source: ['bot'],
    text: {
      'pt-BR':
        'Você vai receber o lembrete aqui. Responda PARAR para deixar de receber.',
      'pt-PT':
        'Vai receber o lembrete aqui. Responda PARAR para deixar de receber.',
    },
  },
};

export const CHECKOUT_CONSENT_VERSION = 'checkout-v2';
export const BOT_CONSENT_VERSION = 'bot-v1';

const toLocale = (country?: string | null): TLocale =>
  country?.toUpperCase() === 'PT' ? 'pt-PT' : 'pt-BR';

/** Texto de uma versão no idioma da loja; `null` se a versão não vale para a origem. */
export const getConsentText = (
  version: string,
  source: TWhatsappConsentSource,
  country?: string | null,
): TWhatsappConsentText | null => {
  const entry = CONSENT_TEXTS[version];
  if (!entry || !entry.source.includes(source)) return null;

  return { version, text: entry.text[toLocale(country)] };
};

/** Sempre sai do WhatsApp da loja, com ou sem conversa aberta. */
const ALWAYS_OPT_OUT = [
  'parar lembretes',
  'parar mensagens',
  'parar de receber',
  'nao quero receber',
  'descadastrar',
  'stop',
];

/**
 * "PARAR" a um lembrete, sem conversa aberta, é opt-out. Dentro de uma conversa
 * com o bot, "parar" continua a encerrar a conversa; o bot então lembra que
 * "PARAR LEMBRETES" corta os lembretes.
 */
export const isWhatsappOptOutReply = (
  text: string,
  inConversation: boolean,
) => {
  const normalized = normalizeText(text).replace(/[!?.,]+$/g, '');

  if (ALWAYS_OPT_OUT.includes(normalized)) return true;

  return !inConversation && normalized === 'parar';
};

/** Segredo próprio do link, derivado da chave de dados (como o do marketing). */
export const deriveWhatsappOptOutSecret = (key: Buffer) =>
  signHmac(key.toString('base64'), 'whatsapp-opt-out-v1');

/** Sem ponto: o token assinado separa as partes por ponto. */
export const toWhatsappOptOutSubject = ({
  storeId,
  customerId,
}: TWhatsappOptOutSubject) => `${storeId}~${customerId}`;

export const parseWhatsappOptOutSubject = (
  subject: string,
): TWhatsappOptOutSubject | null => {
  const [storeId, customerId] = subject.split('~');

  return storeId && customerId ? { storeId, customerId } : null;
};
