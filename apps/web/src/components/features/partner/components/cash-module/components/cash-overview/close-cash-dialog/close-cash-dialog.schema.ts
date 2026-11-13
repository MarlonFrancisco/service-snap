import { z } from 'zod';
import { isValidMoneyInput } from '../../../cash-module.helpers';

export const MAX_CLOSE_NOTES_LENGTH = 500;

export const closeCashSchema = z.object({
  countedCash: z
    .string()
    .refine(
      (value) => isValidMoneyInput(value, { required: true }),
      'Informe quanto dinheiro tem na gaveta',
    ),
  notes: z
    .string()
    .trim()
    .max(
      MAX_CLOSE_NOTES_LENGTH,
      `Use até ${MAX_CLOSE_NOTES_LENGTH} caracteres`,
    ),
});

export type TCloseCashSchema = z.infer<typeof closeCashSchema>;

export const CLOSE_CASH_EMPTY_VALUES: TCloseCashSchema = {
  countedCash: '',
  notes: '',
};
