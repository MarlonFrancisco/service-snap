import { z } from 'zod';

export const addAppointmentSchema = z.object({
  date: z.string('Data inválida').min(1, 'Data é obrigatório'),
  startTime: z
    .string('Hora inicial inválida')
    .min(1, 'Hora inicial é obrigatório'),
  notes: z.string().optional(),
  user: z.object({
    email: z
      .string('E-mail inválido')
      .email('E-mail inválido')
      .min(1, 'E-mail é obrigatório'),
  }),
  service: z.object({
    id: z.string('Serviço inválido').min(1, 'Serviço é obrigatório'),
    duration: z.number('Duração inválida').min(1, 'Duração é obrigatório'),
  }),
  storeMember: z.object({
    id: z.string('Profissional inválido').min(1, 'Profissional é obrigatório'),
  }),
});

export type TAddAppointmentSchema = z.infer<typeof addAppointmentSchema>;

export const ADD_APPOINTMENT_EMPTY_VALUES: TAddAppointmentSchema = {
  date: '',
  startTime: '',
  notes: '',
  user: { email: '' },
  service: { id: '', duration: 0 },
  storeMember: { id: '' },
};
