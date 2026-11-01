import { z } from 'zod';
import { MAX_MONTHLY_GOAL } from '../utils/metrics.constants';
import { parseMoneyInput } from '../utils/metrics.helpers';

export const salesGoalSchema = z.object({
  monthlyGoal: z
    .string()
    .trim()
    .min(1, { message: 'Informe o valor da meta.' })
    .refine(
      (value) => {
        const amount = parseMoneyInput(value);
        return amount !== null && amount > 0 && amount <= MAX_MONTHLY_GOAL;
      },
      { message: 'Informe um valor maior que zero.' },
    )
    .refine((value) => Number.isInteger(parseMoneyInput(value)), {
      message: 'Use um valor sem centavos.',
    }),
});

export type TSalesGoalFormData = z.infer<typeof salesGoalSchema>;
