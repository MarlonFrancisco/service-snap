import { WHATSAPP_REMINDER_TEMPLATE } from './whatsapp-reminder-template';
import type { TWhatsappTemplateDefinition } from './whatsapp.types';

/**
 * Lembrete que pergunta se o cliente vem. Template aprovado não troca de corpo
 * nem ganha botão, então a confirmação é um template novo; o antigo continua
 * saindo até este ser aprovado. Mesmos parâmetros de {{1}} a {{8}} do antigo.
 */
export const WHATSAPP_CONFIRMATION_REMINDER_TEMPLATE = {
  name: 'servicesnap_lembrete_confirmacao',
  language: 'pt_BR',
  category: 'UTILITY',
  header: 'Lembrete do seu horário',
  body: [
    'Olá, {{1}}. Seu agendamento em {{2}} é {{3}} às {{4}}, com {{5}}.',
    '',
    'Serviço: {{6}}',
    'Local: {{7}}',
    '',
    '{{8}}',
    '',
    'Você confirma sua presença?',
  ].join('\n'),
  example: WHATSAPP_REMINDER_TEMPLATE.example,
  // A ordem é a do `index` do botão no envio: 0 confirma, 1 cancela
  quickReplies: ['Sim, confirmo', 'Não vou, cancelar'],
} as const satisfies TWhatsappTemplateDefinition;

/** Aviso da lista de espera: sai fora da janela de 24h, então precisa de template. */
export const WHATSAPP_WAITLIST_TEMPLATE = {
  name: 'servicesnap_vaga_liberada',
  language: 'pt_BR',
  category: 'UTILITY',
  header: 'Vagou um horário',
  body: [
    'Olá, {{1}}. Abriu horário em {{2}} no dia em que você está na lista de espera.',
    '',
    'Dia: {{3}}',
    'Serviço: {{4}}',
    'Profissional: {{5}}',
    '',
    'A vaga fica com quem reservar primeiro.',
  ].join('\n'),
  example: ['Ana', 'Studio Bela', 'Sábado, 7 de novembro', 'Corte', 'Bia'],
  quickReplies: ['Ver horários'],
} as const satisfies TWhatsappTemplateDefinition;

/** O que o painel cria na conta da loja. O lembrete antigo não entra: só é lido. */
export const WHATSAPP_STORE_TEMPLATES: readonly TWhatsappTemplateDefinition[] =
  [WHATSAPP_CONFIRMATION_REMINDER_TEMPLATE, WHATSAPP_WAITLIST_TEMPLATE];

/** Todos os nomes começam assim: uma consulta à Meta traz os três. */
export const WHATSAPP_TEMPLATE_PREFIX = 'servicesnap_';
