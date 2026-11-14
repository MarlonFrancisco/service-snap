import { PAYMENT_METHODS } from '@/types/api/cash.types';
import { z } from 'zod';
import { parseMoneyInput, MAX_MONEY_VALUE } from '../../../cash-module.helpers';

export const MAX_PAYMENT_NOTES_LENGTH = 300;

export const registerPaymentSchema = z.object({
  method: z.enum(PAYMENT_METHODS),
  amount: z.string().refine((value) => {
    const parsed = parseMoneyInput(value);

    return parsed !== null && parsed >= 0.01 && parsed <= MAX_MONEY_VALUE;
  }, 'Informe um valor maior que zero'),
  notes: z
    .string()
    .trim()
    .max(
      MAX_PAYMENT_NOTES_LENGTH,
      `Use até ${MAX_PAYMENT_NOTES_LENGTH} caracteres`,
    ),
});

export type TRegisterPaymentSchema = z.infer<typeof registerPaymentSchema>;

export const REGISTER_PAYMENT_EMPTY_VALUES: TRegisterPaymentSchema = {
  method: 'pix',
  amount: '',
  notes: '',
};
