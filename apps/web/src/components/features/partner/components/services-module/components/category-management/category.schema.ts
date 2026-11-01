import { z } from 'zod';
import { AVAILABLE_COLORS } from '../../utils/colors';

export const categoryFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  color: z.enum(AVAILABLE_COLORS),
});

export type TCategoryFormData = z.infer<typeof categoryFormSchema>;
