import { z } from 'zod';
import { WEEK_DAY_KEYS } from './add-professional-modal.constants';
import { timeToMinutes } from './add-professional-modal.helpers';

const TIME_REGEX = /^\d{2}:\d{2}$/;

const dayHoursSchema = z.object({
  day: z.enum(WEEK_DAY_KEYS),
  /** Dia em que a loja não abre: fica fechado e não vai para a API. */
  isStoreClosed: z.boolean(),
  isWorking: z.boolean(),
  openTime: z.string(),
  closeTime: z.string(),
  lunchStartTime: z.string(),
  lunchEndTime: z.string(),
});

export const professionalFormSchema = z
  .object({
    id: z.string().optional(),
    user: z.object({
      email: z.string().trim().email('E-mail inválido'),
      /** Só vale para quem ainda não tem conta. */
      name: z.string().trim().max(100, 'Use até 100 caracteres'),
    }),
    role: z.enum(['professional', 'manager', 'owner']),
    services: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    ),
    hoursMode: z.enum(['store', 'custom']),
    days: z.array(dayHoursSchema),
  })
  .superRefine((values, context) => {
    if (values.hoursMode !== 'custom') return;

    values.days.forEach((day, index) => {
      if (day.isStoreClosed || !day.isWorking) return;

      const issue = (field: keyof typeof day, message: string) =>
        context.addIssue({
          code: 'custom',
          path: ['days', index, field],
          message,
        });

      if (!TIME_REGEX.test(day.openTime)) {
        issue('openTime', 'Informe o início');
        return;
      }

      if (!TIME_REGEX.test(day.closeTime)) {
        issue('closeTime', 'Informe o fim');
        return;
      }

      const open = timeToMinutes(day.openTime);
      const close = timeToMinutes(day.closeTime);

      if (close <= open) {
        issue('closeTime', 'O fim precisa ser depois do início');
        return;
      }

      const hasLunchStart = !!day.lunchStartTime;
      const hasLunchEnd = !!day.lunchEndTime;

      if (hasLunchStart !== hasLunchEnd) {
        issue(
          hasLunchStart ? 'lunchEndTime' : 'lunchStartTime',
          'Preencha o início e o fim do almoço',
        );
        return;
      }

      if (!hasLunchStart) return;

      const lunchStart = timeToMinutes(day.lunchStartTime);
      const lunchEnd = timeToMinutes(day.lunchEndTime);

      if (lunchEnd <= lunchStart || lunchStart < open || lunchEnd > close) {
        issue('lunchEndTime', 'O almoço precisa ficar dentro do horário');
      }
    });
  });

export type TProfessionalFormSchema = z.infer<typeof professionalFormSchema>;

export type TProfessionalDayHours = TProfessionalFormSchema['days'][number];
