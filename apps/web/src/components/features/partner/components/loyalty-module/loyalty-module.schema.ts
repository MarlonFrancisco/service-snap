import { z } from 'zod';
import { parseMoney } from '../packages-module/packages-module.helpers';
import {
  MAX_REWARD_VALIDITY_DAYS,
  MAX_VISITS_REQUIRED,
} from './loyalty-module.helpers';

const isWholeNumberBetween = (value: string, min: number, max: number) =>
  /^\d+$/.test(value) && Number(value) >= min && Number(value) <= max;

export const loyaltyProgramSchema = z
  .object({
    isActive: z.boolean(),
    visitsRequired: z
      .string()
      .trim()
      .refine(
        (value) => isWholeNumberBetween(value, 1, MAX_VISITS_REQUIRED),
        `Use de 1 a ${MAX_VISITS_REQUIRED} visitas`,
      ),
    servicesScope: z.enum(['all', 'some']),
    eligibleServiceIds: z.array(z.string()),
    rewardType: z.enum(['percent', 'fixed', 'free_service']),
    rewardValue: z.string().trim(),
    rewardServiceId: z.string(),
    rewardValidityDays: z
      .string()
      .trim()
      .refine(
        (value) =>
          !value || isWholeNumberBetween(value, 1, MAX_REWARD_VALIDITY_DAYS),
        `Use de 1 a ${MAX_REWARD_VALIDITY_DAYS} dias`,
      ),
  })
  .superRefine((values, context) => {
    if (values.servicesScope === 'some' && !values.eligibleServiceIds.length) {
      context.addIssue({
        code: 'custom',
        path: ['eligibleServiceIds'],
        message: 'Escolha pelo menos um serviço',
      });
    }

    if (values.rewardType === 'free_service') {
      if (!values.rewardServiceId) {
        context.addIssue({
          code: 'custom',
          path: ['rewardServiceId'],
          message: 'Escolha o serviço grátis',
        });
      }
      return;
    }

    const value = parseMoney(values.rewardValue);

    if (value === null || value <= 0) {
      context.addIssue({
        code: 'custom',
        path: ['rewardValue'],
        message: 'Informe o desconto',
      });
    } else if (values.rewardType === 'percent' && value > 100) {
      context.addIssue({
        code: 'custom',
        path: ['rewardValue'],
        message: 'Use até 100%',
      });
    }
  });

export type TLoyaltyProgramSchema = z.infer<typeof loyaltyProgramSchema>;
