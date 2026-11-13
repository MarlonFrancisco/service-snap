import { z } from 'zod';
import { isValidMoneyInput } from '../../../cash-module.helpers';

export const openCashSchema = z.object({
  openingAmount: z
    .string()
    .refine((value) => isValidMoneyInput(value), 'Informe um valor válido'),
});

export type TOpenCashSchema = z.infer<typeof openCashSchema>;

export const OPEN_CASH_EMPTY_VALUES: TOpenCashSchema = { openingAmount: '' };
