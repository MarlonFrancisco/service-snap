import { z } from 'zod';

export const newCustomerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'Informe o nome')
      .max(60, 'Use até 60 caracteres'),
    lastName: z.string().trim().max(60, 'Use até 60 caracteres'),
    telephone: z.string().trim().max(20, 'Telefone muito longo'),
    email: z
      .string()
      .trim()
      .refine((value) => !value || z.email().safeParse(value).success, {
        message: 'E-mail inválido',
      }),
  })
  .refine((data) => !!data.telephone || !!data.email, {
    message: 'Informe o telefone ou o e-mail',
    path: ['telephone'],
  });

export type TNewCustomerSchema = z.infer<typeof newCustomerSchema>;

export const NEW_CUSTOMER_EMPTY_VALUES: TNewCustomerSchema = {
  firstName: '',
  lastName: '',
  telephone: '',
  email: '',
};
