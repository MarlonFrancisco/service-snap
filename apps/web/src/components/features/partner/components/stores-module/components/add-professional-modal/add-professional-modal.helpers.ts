import type {
  IProfessional,
  TDayHours,
  TMemberWorkingHours,
} from '@/types/api/users.types';
import { WEEK_DAY_KEYS } from './add-professional-modal.constants';
import type { TStoreHoursReference } from './add-professional-modal.types';
import type {
  TProfessionalDayHours,
  TProfessionalFormSchema,
} from './add-professional.schema';

/** "09:30" → 570. */
export const timeToMinutes = (time: string): number => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);

  return hours * 60 + minutes;
};

/** "Maria da Silva" → { firstName: "Maria", lastName: "da Silva" }. */
export const splitFullName = (fullName: string) => {
  const [firstName = '', ...rest] = fullName.trim().split(/\s+/);

  return { firstName, lastName: rest.join(' ') };
};

const toFormDay = (
  day: TProfessionalDayHours['day'],
  storeHours: TStoreHoursReference,
  memberDay: TDayHours | null | undefined,
): TProfessionalDayHours => {
  // Sem horário próprio no dia, a linha começa com o da loja.
  const source = memberDay ?? storeHours;

  return {
    day,
    isStoreClosed: !storeHours.businessDays?.[day],
    isWorking: memberDay !== null,
    openTime: source.openTime ?? '',
    closeTime: source.closeTime ?? '',
    lunchStartTime: source.lunchStartTime ?? '',
    lunchEndTime: source.lunchEndTime ?? '',
  };
};

export const toProfessionalFormValues = (
  professional: IProfessional,
  storeHours: TStoreHoursReference,
): TProfessionalFormSchema => {
  const workingHours = professional.workingHours ?? null;

  return {
    id: professional.id,
    role: professional.role || 'professional',
    user: {
      email: professional.user.email || '',
      name: '',
    },
    services: professional.services ?? [],
    hoursMode:
      workingHours && Object.keys(workingHours).length ? 'custom' : 'store',
    days: WEEK_DAY_KEYS.map((day) =>
      toFormDay(day, storeHours, workingHours?.[day]),
    ),
  };
};

/**
 * `null` segue a loja inteira. No horário próprio vão só os dias em que a loja
 * abre: `null` no dia é folga fixa e o dia fechado da loja continua fechado.
 */
export const toWorkingHoursPayload = ({
  hoursMode,
  days,
}: Pick<
  TProfessionalFormSchema,
  'hoursMode' | 'days'
>): TMemberWorkingHours | null => {
  if (hoursMode === 'store') return null;

  const entries = days
    .filter((day) => !day.isStoreClosed)
    .map((day) => [
      day.day,
      day.isWorking
        ? {
            openTime: day.openTime,
            closeTime: day.closeTime,
            lunchStartTime: day.lunchStartTime || null,
            lunchEndTime: day.lunchEndTime || null,
          }
        : null,
    ]);

  return entries.length ? Object.fromEntries(entries) : null;
};
