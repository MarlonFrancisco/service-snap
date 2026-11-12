import { z } from 'zod';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const addAppointmentSchema = z
  .object({
    /** `store`: cliente que já é da loja; `new`: contato novo, mesmo sem conta. */
    customerMode: z.enum(['store', 'new']),
    customerId: z.string(),
    newCustomer: z.object({
      firstName: z.string().trim().max(60, 'Use até 60 caracteres'),
      lastName: z.string().trim().max(60, 'Use até 60 caracteres'),
      telephone: z.string().trim().max(20, 'Telefone muito longo'),
      email: z.string().trim(),
    }),
    serviceIds: z.array(z.string()).min(1, 'Escolha ao menos um serviço'),
    storeMemberId: z.string().min(1, 'Escolha o profissional'),
    date: z.string().min(1, 'Escolha a data'),
    startTime: z.string(),
    /** Encaixe: hora digitada, fora dos horários oferecidos. */
    isFitIn: z.boolean(),
    fitInTime: z.string(),
    notes: z.string().max(1000, 'Use até 1000 caracteres'),
  })
  .superRefine((data, ctx) => {
    if (data.customerMode === 'store' && !data.customerId) {
      ctx.addIssue({
        code: 'custom',
        path: ['customerId'],
        message: 'Escolha o cliente',
      });
    }

    if (data.customerMode === 'new') {
      if (!data.newCustomer.firstName) {
        ctx.addIssue({
          code: 'custom',
          path: ['newCustomer', 'firstName'],
          message: 'Informe o nome',
        });
      }
      if (!data.newCustomer.telephone) {
        ctx.addIssue({
          code: 'custom',
          path: ['newCustomer', 'telephone'],
          message: 'Informe o telefone',
        });
      }
      if (
        data.newCustomer.email &&
        !z.email().safeParse(data.newCustomer.email).success
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['newCustomer', 'email'],
          message: 'E-mail inválido',
        });
      }
    }

    if (data.isFitIn && !TIME_PATTERN.test(data.fitInTime)) {
      ctx.addIssue({
        code: 'custom',
        path: ['fitInTime'],
        message: 'Informe o horário do encaixe',
      });
    }

    if (!data.isFitIn && !data.startTime) {
      ctx.addIssue({
        code: 'custom',
        path: ['startTime'],
        message: 'Escolha um horário',
      });
    }
  });

export type TAddAppointmentSchema = z.infer<typeof addAppointmentSchema>;

export const ADD_APPOINTMENT_EMPTY_VALUES: TAddAppointmentSchema = {
  customerMode: 'store',
  customerId: '',
  newCustomer: { firstName: '', lastName: '', telephone: '', email: '' },
  serviceIds: [],
  storeMemberId: '',
  date: '',
  startTime: '',
  isFitIn: false,
  fitInTime: '',
  notes: '',
};
