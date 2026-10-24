import { z } from 'zod';

export const BookingFormSchema = z.object({
  selectedServices: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      price: z.number(),
      duration: z.number(),
      category: z
        .object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          color: z.string(),
        })
        .optional(),
      quantity: z.number().min(1),
    }),
  ),

  selectedProfessional: z
    .object({
      id: z.string(),
      role: z.enum(['professional', 'manager', 'owner']),
      isActive: z.boolean(),
      schedules: z
        .array(
          z.object({
            id: z.string(),
            date: z.string(),
            startTime: z.string(),
            endTime: z.string(),
          }),
        )
        .optional(),
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
        lastName: z.string(),
        avatar: z.string().nullable().optional(),
      }),
      services: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            price: z.number(),
            duration: z.number(),
          }),
        )
        .optional(),
    })
    .nullish(),
  isAnyProfessional: z.boolean(),
  selectedDate: z.date().nullish(),
  selectedTime: z.string().nullish(),
});

export type TBookingFormData = z.infer<typeof BookingFormSchema>;
