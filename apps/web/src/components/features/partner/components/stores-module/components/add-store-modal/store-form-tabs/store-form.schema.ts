import { COUNTRY_CODES, CURRENCY_CODES } from '@repo/shared/constants';
import { z } from 'zod';

// Schema para validação de CEP
const zipCodeRegex = /^\d{5}-\d{3}$/;

// Schema para validação de email
const emailSchema = z
  .string()
  .email('Email inválido')
  .optional()
  .or(z.literal(''));

// Schema para validação de URL
const urlSchema = z.string().url('URL inválida').optional().or(z.literal(''));

/** Mesmo formato que a API aceita para o link curto. */
export const STORE_SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const slugSchema = z
  .string()
  .min(3, 'O link precisa ter de 3 a 60 caracteres')
  .max(60, 'O link precisa ter de 3 a 60 caracteres')
  .regex(STORE_SLUG_REGEX, 'Use só letras minúsculas, números e hífen')
  .optional()
  .or(z.literal(''));

/** Campo numérico livre: vazio vira NaN, que o zod recusa com a mesma mensagem. */
const wholeNumber = (min: number, max: number, unit: string) => {
  const message = `Use um número inteiro de ${min} a ${max} ${unit}`;

  return z.number({ message }).int(message).min(min, message).max(max, message);
};

// Schema principal do formulário de loja
export const storeFormSchema = z.object({
  id: z.string().optional(),

  slug: slugSchema,

  // Region & Currency
  country: z
    .string()
    .min(2, 'Selecione um país')
    .refine(
      (val) => COUNTRY_CODES.includes(val as (typeof COUNTRY_CODES)[number]),
      {
        message: 'País inválido',
      },
    ),
  currency: z
    .string()
    .min(3, 'Selecione uma moeda')
    .refine(
      (val) => CURRENCY_CODES.includes(val as (typeof CURRENCY_CODES)[number]),
      {
        message: 'Moeda inválida',
      },
    ),
  timezone: z.string().min(1, 'Timezone é obrigatório'),

  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),

  address: z
    .string()
    .min(5, 'Endereço deve ter no mínimo 5 caracteres')
    .max(200, 'Endereço deve ter no máximo 200 caracteres'),

  city: z
    .string()
    .min(2, 'Cidade deve ter no mínimo 2 caracteres')
    .max(100, 'Cidade deve ter no máximo 100 caracteres'),

  state: z
    .string()
    .length(2, 'Estado deve ter 2 caracteres (ex: SP, RJ)')
    .toUpperCase(),

  zipCode: z
    .string()
    .regex(zipCodeRegex, 'CEP inválido. Use o formato: 00000-000'),

  description: z
    .string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),

  telephone: z.string().min(1, 'Telefone é obrigatório'),

  email: emailSchema,

  website: urlSchema,

  instagram: z
    .string()
    .max(100, 'Instagram deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),

  facebook: z
    .string()
    .max(100, 'Facebook deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),

  amenities: z.array(
    z.string().max(30, 'Comodidade deve ter no máximo 30 caracteres'),
  ),

  isActive: z.boolean(),

  gallery: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
      isMain: z.boolean().optional(),
    }),
  ),

  storeMembers: z.array(
    z.object({
      id: z.string(),
      role: z.enum(['professional', 'manager', 'owner']),
      isActive: z.boolean(),
      createdAt: z.date().or(z.string()),
      user: z.object({
        id: z.string(),
        email: z.string().email('Email inválido'),
        firstName: z.string(),
        lastName: z.string(),
        telephone: z.string().nullable(),
        avatar: z.string().nullable(),
      }),
    }),
  ),

  openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato deve ser HH:MM'),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato deve ser HH:MM'),
  lunchStartTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato deve ser HH:MM')
    .optional()
    .or(z.literal('')),
  lunchEndTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato deve ser HH:MM')
    .optional()
    .or(z.literal('')),

  businessDays: z
    .object({
      monday: z.boolean(),
      tuesday: z.boolean(),
      wednesday: z.boolean(),
      thursday: z.boolean(),
      friday: z.boolean(),
      saturday: z.boolean(),
      sunday: z.boolean(),
    })
    .optional(),

  blockedTimes: z.array(z.unknown()).optional(),

  // Regras da agenda (os limites são os mesmos da API)
  slotIntervalMinutes: z.number().int(),
  bufferMinutes: wholeNumber(0, 240, 'min'),
  minAdvanceMinutes: z.number().int().min(0),
  maxAdvanceDays: z.number().int().min(0),
  cancellationNoticeHours: wholeNumber(0, 720, 'horas'),
  rescheduleNoticeHours: wholeNumber(0, 720, 'horas'),
});

// Type inference do schema
export type TStoreFormSchema = z.infer<typeof storeFormSchema>;
