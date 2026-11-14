import { PAYMENT_METHODS } from '@/types/api/cash.types';
import { z } from 'zod';
import { isValidMoneyInput } from '../../../cash-module/cash-module.helpers';
import { MAX_CHECKOUT_PAYMENTS } from '../../checkout-module.helpers';

export const checkoutSchema = z.object({
  usePackages: z.boolean(),
  /** Recompensa escolhida; vazio é nenhuma. */
  rewardId: z.string(),
  discount: z
    .string()
    .refine((value) => isValidMoneyInput(value), 'Informe um desconto válido'),
  payments: z
    .array(
      z.object({
        method: z.enum(PAYMENT_METHODS),
        amount: z
          .string()
          .refine((value) => isValidMoneyInput(value), 'Valor inválido'),
      }),
    )
    .max(MAX_CHECKOUT_PAYMENTS),
});

export type TCheckoutSchema = z.infer<typeof checkoutSchema>;

export const CHECKOUT_EMPTY_VALUES: TCheckoutSchema = {
  usePackages: true,
  rewardId: '',
  discount: '',
  payments: [{ method: 'pix', amount: '' }],
};
