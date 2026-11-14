import type { z } from 'zod';
import type { PersonalNameSchema } from './personal-data-section.schema';

export type TPersonalNameForm = z.infer<typeof PersonalNameSchema>;
