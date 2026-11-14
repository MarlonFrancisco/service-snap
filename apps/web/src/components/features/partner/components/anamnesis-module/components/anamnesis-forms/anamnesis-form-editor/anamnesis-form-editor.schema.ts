import { ANAMNESIS_FIELD_TYPES } from '@/types/api/anamnesis.types';
import { z } from 'zod';
import {
  ANAMNESIS_MAX_DESCRIPTION,
  ANAMNESIS_MAX_FIELDS,
  ANAMNESIS_MAX_NAME,
} from '../../../anamnesis-module.helpers';

export const anamnesisFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Use ao menos 2 letras')
    .max(ANAMNESIS_MAX_NAME, `Use até ${ANAMNESIS_MAX_NAME} caracteres`),
  description: z
    .string()
    .max(
      ANAMNESIS_MAX_DESCRIPTION,
      `Use até ${ANAMNESIS_MAX_DESCRIPTION} caracteres`,
    ),
  serviceIds: z.array(z.string()),
  isActive: z.boolean(),
  fields: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(ANAMNESIS_FIELD_TYPES),
        required: z.boolean(),
        options: z.array(z.string()).optional(),
      }),
    )
    .min(1, 'Adicione ao menos uma pergunta')
    .max(ANAMNESIS_MAX_FIELDS, `Use até ${ANAMNESIS_MAX_FIELDS} perguntas`),
});

export type TAnamnesisFormSchema = z.infer<typeof anamnesisFormSchema>;
