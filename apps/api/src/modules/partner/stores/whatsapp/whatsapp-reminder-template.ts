import { toE164 } from '../../../../utils/helpers/region.helpers';

/**
 * Template do lembrete criado na WABA de cada loja. Fora da janela de 24h a Meta
 * só entrega mensagem iniciada pela empresa se ela usar um template aprovado.
 * Mudar o texto exige um nome novo: um template aprovado não troca de corpo.
 */
export const WHATSAPP_REMINDER_TEMPLATE = {
  name: 'servicesnap_lembrete_agendamento',
  language: 'pt_BR',
  category: 'UTILITY',
  header: 'Lembrete do seu horário',
  // A Meta recusa corpo que começa ou termina em variável
  body: [
    'Olá, {{1}}. Seu agendamento em {{2}} é {{3}} às {{4}}, com {{5}}.',
    '',
    'Serviço: {{6}}',
    'Local: {{7}}',
    '',
    '{{8}}',
    '',
    'Se precisar remarcar ou cancelar, fale com a loja.',
  ].join('\n'),
  example: [
    'Ana',
    'Studio Bela',
    'Terça-feira, 3 de novembro',
    '09:30',
    'Bia',
    'Corte',
    'Rua das Flores, 120',
    'Chegue 10 minutos antes.',
  ],
} as const;

export const WHATSAPP_REMINDER_DEFAULT_MESSAGE = 'Até breve!';

export type TWhatsappReminderTemplateParams = {
  customerName: string;
  storeName: string;
  scheduleDay: string;
  scheduleTime: string;
  professionalName: string;
  serviceName: string;
  storeAddress: string;
  customMessage?: string;
};

/**
 * Telefone do cliente no formato da Meta (só dígitos, com DDI). Número sem DDI
 * é lido como do país da loja. Inválido não tem para onde enviar.
 */
export const toWhatsappRecipient = (
  telephone?: string | null,
  storeCountry?: string | null,
) => toE164(telephone, storeCountry)?.slice(1) ?? null;

// Parâmetro de template não aceita vazio, quebra de linha, tab nem 4+ espaços
const toParam = (value: string | undefined, fallback: string) =>
  (value ?? '').replace(/\s+/g, ' ').trim() || fallback;

/** Valores na ordem de {{1}} a {{8}} do corpo. */
export const buildReminderTemplateParams = ({
  customerName,
  storeName,
  scheduleDay,
  scheduleTime,
  professionalName,
  serviceName,
  storeAddress,
  customMessage,
}: TWhatsappReminderTemplateParams) => [
  toParam(customerName, 'Cliente'),
  toParam(storeName, 'Loja'),
  toParam(scheduleDay, '-'),
  toParam(scheduleTime, '-'),
  toParam(professionalName, 'Profissional'),
  toParam(serviceName, 'Serviço'),
  toParam(storeAddress, toParam(storeName, 'Loja')),
  toParam(customMessage, WHATSAPP_REMINDER_DEFAULT_MESSAGE),
];
