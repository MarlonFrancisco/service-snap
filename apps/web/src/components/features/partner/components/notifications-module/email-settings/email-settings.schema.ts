import { z } from 'zod';

export const EMAIL_TIMING_VALUES = ['48h', '24h', '12h', '2h', '1h'] as const;

export const emailSettingsSchema = z.object({
  emailReminderEnabled: z.boolean('Campo obrigatório').optional(),
  emailReminderAdvanceHours: z.string('Selecione o tempo de antecedência'),
  emailReminderCustomMessage: z
    .string()
    .max(200, 'Mensagem deve ter no máximo 200 caracteres')
    .optional(),
});

export type TEmailSettingsFormData = z.infer<typeof emailSettingsSchema>;
