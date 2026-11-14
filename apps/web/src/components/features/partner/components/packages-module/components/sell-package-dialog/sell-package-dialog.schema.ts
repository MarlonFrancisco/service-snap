import { z } from 'zod';
import { parseMoney } from '../../packages-module.helpers';

const PAYMENT_METHODS = [
  'cash',
  'pix',
  'credit_card',
  'debit_card',
  'other',
] as const;

export const sellPackageSchema = z
  .object({
    customerMode: z.enum(['existing', 'new']),
    customerId: z.string(),
    newCustomer: z.object({
      firstName: z.string().trim().max(60, 'Use até 60 caracteres'),
      lastName: z.string().trim().max(60, 'Use até 60 caracteres'),
      telephone: z.string().trim().max(20, 'Telefone muito longo'),
      email: z
        .string()
        .trim()
        .refine((value) => !value || z.email().safeParse(value).success, {
          message: 'E-mail inválido',
        }),
    }),
    pricePaid: z
      .string()
      .trim()
      .min(1, 'Informe o valor cobrado')
      .refine((value) => parseMoney(value) !== null, 'Informe um valor válido'),
    payLater: z.boolean(),
    paymentMethod: z.enum(PAYMENT_METHODS),
    paymentAmount: z.string().trim(),
  })
  .superRefine((values, context) => {
    if (values.customerMode === 'existing' && !values.customerId) {
      context.addIssue({
        code: 'custom',
        path: ['customerId'],
        message: 'Escolha o cliente',
      });
    }

    if (values.customerMode === 'new') {
      if (!values.newCustomer.firstName) {
        context.addIssue({
          code: 'custom',
          path: ['newCustomer', 'firstName'],
          message: 'Informe o nome',
        });
      }
      if (!values.newCustomer.telephone && !values.newCustomer.email) {
        context.addIssue({
          code: 'custom',
          path: ['newCustomer', 'telephone'],
          message: 'Informe o telefone ou o e-mail',
        });
      }
    }

    const price = parseMoney(values.pricePaid) ?? 0;

    // Pacote de graça ou pago depois não registra nada no caixa
    if (values.payLater || price === 0) return;

    const amount = parseMoney(values.paymentAmount);

    if (amount === null || amount <= 0) {
      context.addIssue({
        code: 'custom',
        path: ['paymentAmount'],
        message: 'Informe o valor recebido',
      });
    } else if (amount > price) {
      context.addIssue({
        code: 'custom',
        path: ['paymentAmount'],
        message: 'Não pode passar do valor cobrado',
      });
    }
  });

export type TSellPackageSchema = z.infer<typeof sellPackageSchema>;
