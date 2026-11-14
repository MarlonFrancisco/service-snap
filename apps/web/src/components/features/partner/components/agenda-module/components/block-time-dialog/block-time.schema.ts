import { z } from 'zod';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Férias longas cabem; um intervalo maior quase sempre é erro de digitação. */
export const BLOCK_MAX_DAYS = 62;

const daysBetween = (from: string, to: string) =>
  Math.round(
    (new Date(`${to}T12:00:00`).getTime() -
      new Date(`${from}T12:00:00`).getTime()) /
      (24 * 60 * 60 * 1000),
  );

export const blockTimeSchema = z
  .object({
    storeMemberId: z.string().min(1, 'Escolha o profissional'),
    from: z.string().min(1, 'Informe o primeiro dia'),
    to: z.string(),
    isFullDay: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
    isRecurring: z.boolean(),
    /** Só visual: a API ainda não guarda o motivo. */
    reason: z.string().max(80, 'Use até 80 caracteres'),
  })
  .superRefine((values, context) => {
    if (values.to && values.from && values.to < values.from) {
      context.addIssue({
        code: 'custom',
        path: ['to'],
        message: 'O último dia vem depois do primeiro',
      });
    }

    if (
      values.to &&
      values.from &&
      daysBetween(values.from, values.to) >= BLOCK_MAX_DAYS
    ) {
      context.addIssue({
        code: 'custom',
        path: ['to'],
        message: `Bloqueie até ${BLOCK_MAX_DAYS} dias de uma vez`,
      });
    }

    if (values.isFullDay) return;

    if (!TIME_PATTERN.test(values.startTime)) {
      context.addIssue({
        code: 'custom',
        path: ['startTime'],
        message: 'Informe o início',
      });
    }

    if (!TIME_PATTERN.test(values.endTime)) {
      context.addIssue({
        code: 'custom',
        path: ['endTime'],
        message: 'Informe o fim',
      });
      return;
    }

    if (values.endTime <= values.startTime) {
      context.addIssue({
        code: 'custom',
        path: ['endTime'],
        message: 'O fim vem depois do início',
      });
    }
  });

export type TBlockTimeSchema = z.infer<typeof blockTimeSchema>;
