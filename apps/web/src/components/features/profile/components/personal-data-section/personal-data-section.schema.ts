import { z } from 'zod';

const NAME_MAX_LENGTH = 60;

export const PersonalNameSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'Digite seu nome.')
    .max(NAME_MAX_LENGTH, `Use até ${NAME_MAX_LENGTH} caracteres.`),
  lastName: z
    .string()
    .trim()
    .max(NAME_MAX_LENGTH, `Use até ${NAME_MAX_LENGTH} caracteres.`),
});
