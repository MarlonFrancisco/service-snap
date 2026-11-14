import { z } from 'zod';

export const BookingFormSchema = z.object({
  selectedServices: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      // Serviço sem descrição ou categoria vem com `null` da API
      description: z.string().nullish(),
      price: z.number(),
      duration: z.number(),
      category: z
        .object({
          id: z.string(),
          name: z.string(),
          description: z.string().nullish(),
          color: z.string().nullish(),
        })
        .nullish(),
      quantity: z.number().min(1),
    }),
  ),

  selectedProfessional: z
    .object({
      id: z.string(),
      role: z.enum(['professional', 'manager', 'owner']),
      isActive: z.boolean(),
      schedules: z.array(
        z.object({
          id: z.string(),
          date: z.string(),
          startTime: z.string(),
          endTime: z.string(),
        }),
      ),
      blockedTimes: z.array(
        z.object({
          id: z.string(),
          date: z.string(),
          time: z.string(),
          isRecurring: z.boolean().optional(),
        }),
      ),
      user: z.object({
        id: z.string(),
        firstName: z.string(),
        // Conta sem sobrenome vem com `null`: barrar aqui travava a reserva calada
        lastName: z.string().nullish(),
        avatar: z.string().nullable().optional(),
      }),
      services: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().nullish(),
            price: z.number(),
            duration: z.number(),
          }),
        )
        .optional(),
    })
    .nullish(),
  isAnyProfessional: z.boolean(),
  assignedProfessionalId: z.string().nullish(),
  selectedDate: z.date().nullish(),
  selectedTime: z.string().nullish(),
});

export type TBookingFormData = z.infer<typeof BookingFormSchema>;
