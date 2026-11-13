import { z } from 'zod';
import {
  MAX_EMAIL_MESSAGE,
  MAX_TEMPLATE_VARIABLES,
  MIN_EMAIL_MESSAGE,
} from '../../campaigns-module.helpers';

export const newCampaignSchema = z
  .object({
    channel: z.enum(['whatsapp', 'email', 'both']),
    name: z
      .string()
      .trim()
      .min(2, 'Use pelo menos 2 caracteres')
      .max(100, 'Use até 100 caracteres'),
    /** `nome::idioma` do template escolhido. */
    templateKey: z.string(),
    variables: z
      .array(
        z.object({
          source: z.enum(['name', 'store', 'text']),
          text: z.string().max(200, 'Use até 200 caracteres'),
        }),
      )
      .max(MAX_TEMPLATE_VARIABLES),
    message: z.string(),
  })
  .superRefine((values, context) => {
    const usesWhatsapp = values.channel !== 'email';
    const usesEmail = values.channel !== 'whatsapp';

    if (usesWhatsapp) {
      if (!values.templateKey) {
        context.addIssue({
          code: 'custom',
          path: ['templateKey'],
          message: 'Escolha o template',
        });
      }

      values.variables.forEach((variable, index) => {
        if (variable.source === 'text' && !variable.text.trim()) {
          context.addIssue({
            code: 'custom',
            path: ['variables', index, 'text'],
            message: 'Escreva o texto da variável',
          });
        }
      });
    }

    const message = values.message.trim();

    if (usesEmail && message.length < MIN_EMAIL_MESSAGE) {
      context.addIssue({
        code: 'custom',
        path: ['message'],
        message: `Escreva pelo menos ${MIN_EMAIL_MESSAGE} caracteres`,
      });
    } else if (usesEmail && message.length > MAX_EMAIL_MESSAGE) {
      context.addIssue({
        code: 'custom',
        path: ['message'],
        message: `Use até ${MAX_EMAIL_MESSAGE} caracteres`,
      });
    }
  });

export type TNewCampaignSchema = z.infer<typeof newCampaignSchema>;

export const NEW_CAMPAIGN_VARIABLE: TNewCampaignSchema['variables'][number] = {
  source: 'text',
  text: '',
};

export const NEW_CAMPAIGN_EMPTY_VALUES: TNewCampaignSchema = {
  channel: 'whatsapp',
  name: '',
  templateKey: '',
  variables: [
    { source: 'name', text: '' },
    { source: 'store', text: '' },
  ],
  message: '',
};
