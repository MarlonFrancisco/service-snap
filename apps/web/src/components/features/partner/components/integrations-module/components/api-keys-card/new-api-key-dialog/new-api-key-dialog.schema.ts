import { z } from 'zod';

export const newApiKeySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Use pelo menos 2 caracteres')
    .max(80, 'Use até 80 caracteres'),
});

export type TNewApiKeySchema = z.infer<typeof newApiKeySchema>;

export const NEW_API_KEY_EMPTY_VALUES: TNewApiKeySchema = { name: '' };
