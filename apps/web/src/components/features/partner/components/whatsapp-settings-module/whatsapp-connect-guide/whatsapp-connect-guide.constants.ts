import type { IWhatsappSettingsSchema } from '../whatsapp-settings.schema';

export const WHATSAPP_GUIDE_STEPS = [
  { title: 'Antes de começar', hint: 'O que você precisa' },
  { title: 'Criar o app', hint: 'Meta for Developers' },
  { title: 'Adicionar o número', hint: 'Verificação por código' },
  { title: 'Copiar os IDs', hint: 'Número e conta' },
  { title: 'Gerar o token', hint: 'Usuário do sistema' },
  { title: 'Configurar o webhook', hint: 'Respostas e status' },
  { title: 'Testar', hint: 'Validar e ativar' },
] as const;

export const WHATSAPP_GUIDE_LAST_STEP = WHATSAPP_GUIDE_STEPS.length - 1;

/** Campos que precisam estar válidos para sair de cada etapa. */
export const WHATSAPP_GUIDE_STEP_FIELDS: Partial<
  Record<number, (keyof IWhatsappSettingsSchema)[]>
> = {
  3: ['phoneNumberId', 'businessAccountId'],
  4: ['accessToken'],
};

export const WHATSAPP_GUIDE_ROUTE = '/partner/settings/whatsapp/connect';
export const WHATSAPP_SETTINGS_ROUTE = '/partner/settings/whatsapp';

/** O mesmo endpoint atende todas as lojas: a Meta envia o ID do número em cada evento. */
export const WHATSAPP_WEBHOOK_URL = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/whatsapp/webhook`;

export const META_LINKS = {
  developers: 'https://developers.facebook.com/apps',
  systemUsers: 'https://business.facebook.com/settings/system-users',
} as const;
