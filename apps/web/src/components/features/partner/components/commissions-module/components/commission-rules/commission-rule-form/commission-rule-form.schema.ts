import { z } from 'zod';
import { parseMoneyInput } from '../../../../cash-module/cash-module.helpers';
import { MAX_FIXED_COMMISSION } from '../../../commissions-module.helpers';

/** Valor para "Todos" nos seletores de profissional e serviço. */
export const ALL_OPTION = 'all';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const commissionRuleSchema = z
  .object({
    storeMemberId: z.string(),
    serviceId: z.string(),
    type: z.enum(['percent', 'fixed']),
    value: z.string(),
    effectiveFrom: z.string().regex(DATE, 'Escolha a data'),
  })
  .superRefine((data, context) => {
    const value = parseMoneyInput(data.value);
    const max = data.type === 'percent' ? 100 : MAX_FIXED_COMMISSION;

    if (value === null || value < 0 || value > max) {
      context.addIssue({
        code: 'custom',
        path: ['value'],
        message:
          data.type === 'percent'
            ? 'Informe um percentual de 0 a 100'
            : 'Informe um valor válido',
      });
    }
  });

export type TCommissionRuleSchema = z.infer<typeof commissionRuleSchema>;
