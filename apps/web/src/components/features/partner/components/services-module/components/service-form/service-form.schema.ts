import { z } from 'zod';

export const SERVICE_MIN_DURATION_MINUTES = 5;
export const SERVICE_MIN_PRICE = 1;

export const serviceFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  duration: z
    .number()
    .int('Informe a duração em minutos inteiros')
    .min(
      SERVICE_MIN_DURATION_MINUTES,
      `A duração mínima é de ${SERVICE_MIN_DURATION_MINUTES} min`,
    ),
  price: z.number().min(SERVICE_MIN_PRICE, 'Preço é obrigatório'),
  category: z.object({
    id: z.string('Categoria é obrigatória').min(1, 'Categoria é obrigatória'),
  }),
  isActive: z.boolean(),
});

export type TServiceFormData = z.infer<typeof serviceFormSchema>;
