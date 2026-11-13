import { z } from 'zod';
import {
  MAX_PACKAGE_ITEMS,
  MAX_PACKAGE_QUANTITY,
  MAX_PACKAGE_VALIDITY_DAYS,
  parseMoney,
} from '../../packages-module.helpers';

const isWholeNumberBetween = (value: string, min: number, max: number) =>
  /^\d+$/.test(value) && Number(value) >= min && Number(value) <= max;

export const packageFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Use pelo menos 2 caracteres')
    .max(100, 'Use até 100 caracteres'),
  description: z.string().trim().max(500, 'Use até 500 caracteres'),
  price: z
    .string()
    .trim()
    .min(1, 'Informe o preço')
    .refine((value) => parseMoney(value) !== null, 'Informe um valor válido'),
  validityDays: z
    .string()
    .trim()
    .refine(
      (value) =>
        !value || isWholeNumberBetween(value, 1, MAX_PACKAGE_VALIDITY_DAYS),
      `Use de 1 a ${MAX_PACKAGE_VALIDITY_DAYS} dias`,
    ),
  isActive: z.boolean(),
  items: z
    .array(
      z.object({
        serviceId: z.string().min(1, 'Escolha o serviço'),
        quantity: z
          .string()
          .trim()
          .refine(
            (value) => isWholeNumberBetween(value, 1, MAX_PACKAGE_QUANTITY),
            `De 1 a ${MAX_PACKAGE_QUANTITY}`,
          ),
      }),
    )
    .min(1, 'Inclua pelo menos um serviço')
    .max(MAX_PACKAGE_ITEMS, `Até ${MAX_PACKAGE_ITEMS} serviços`),
});

export type TPackageFormSchema = z.infer<typeof packageFormSchema>;

export const PACKAGE_FORM_EMPTY_ITEM: TPackageFormSchema['items'][number] = {
  serviceId: '',
  quantity: '1',
};

export const PACKAGE_FORM_EMPTY_VALUES: TPackageFormSchema = {
  name: '',
  description: '',
  price: '',
  validityDays: '',
  isActive: true,
  items: [PACKAGE_FORM_EMPTY_ITEM],
};
