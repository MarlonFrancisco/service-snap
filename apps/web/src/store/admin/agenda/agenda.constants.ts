import type { IAppointment } from '@/types/api/schedule.types';
import type { TWorkingDayKey } from './agenda.types';

export const AGENDA_DAYS: string[] = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
];

export const AGENDA_WORKING_DAY_KEYS: readonly TWorkingDayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export const INITIAL_APPOINTMENT_FORM: IAppointment = {
  id: '',
  startTime: '',
  endTime: '',
  date: '',
  status: 'scheduled',
  price: 0,
  notes: '',
  user: {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    avatar: '',
  },
  service: {
    id: '',
    name: '',
    duration: 0,
    price: 0,
    description: '',
    isActive: true,
  },
  storeMember: {
    id: '',
    role: 'professional',
    isActive: true,
    createdAt: new Date(),
    blockedTimes: [],
    user: {
      id: '',
      email: '',
      firstName: '',
      lastName: '',
      telephone: '',
      avatar: '',
    },
  },
};
