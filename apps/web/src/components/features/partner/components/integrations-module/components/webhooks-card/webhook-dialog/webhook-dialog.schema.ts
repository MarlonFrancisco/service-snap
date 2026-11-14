import type { IWebhookEndpoint } from '@/types/api/webhooks.types';
import { z } from 'zod';
import { ALL_WEBHOOK_EVENTS } from '../../../integrations-module.helpers';

const WEBHOOK_EVENT_VALUES = [
  'schedule.created',
  'schedule.updated',
  'schedule.cancelled',
] as const;

const isHttpUrl = (value: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

export const webhookSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'Informe o endereço')
    .max(500, 'Use até 500 caracteres')
    .refine(isHttpUrl, 'Use um endereço completo, com https://'),
  description: z.string().trim().max(120, 'Use até 120 caracteres'),
  events: z
    .array(z.enum(WEBHOOK_EVENT_VALUES))
    .min(1, 'Escolha pelo menos um evento'),
  isActive: z.boolean(),
});

export type TWebhookSchema = z.infer<typeof webhookSchema>;

export const getWebhookFormValues = (
  endpoint?: IWebhookEndpoint | null,
): TWebhookSchema => ({
  url: endpoint?.url ?? '',
  description: endpoint?.description ?? '',
  events: endpoint?.events ?? [...ALL_WEBHOOK_EVENTS],
  isActive: endpoint?.isActive ?? true,
});
