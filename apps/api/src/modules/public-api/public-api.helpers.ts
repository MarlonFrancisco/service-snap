import { toDateKey } from '../../utils/helpers/schedule.helpers';
import { getUserFullName } from '../../utils/helpers/user.helpers';
import type { Schedule } from '../partner/stores/schedule/schedule.entity';
import type { TPublicSchedule } from './public-api.types';

/** Relações que `toPublicSchedule` lê. */
export const PUBLIC_SCHEDULE_RELATIONS = [
  'service',
  'storeMember',
  'storeMember.user',
  'user',
];

/**
 * Lista fechada de campos: coluna nova em `User` ou `Schedule` não vaza para
 * integrações sozinha (ali estão código de login e dados internos).
 */
export const toPublicSchedule = (schedule: Schedule): TPublicSchedule => ({
  id: schedule.id,
  date: schedule.date ? toDateKey(schedule.date) : null,
  startTime: schedule.startTime ?? null,
  endTime: schedule.endTime ?? null,
  status: schedule.status,
  price: schedule.price ?? null,
  currency: schedule.currency ?? null,
  notes: schedule.notes ?? null,
  service: schedule.service
    ? { id: schedule.service.id, name: schedule.service.name }
    : null,
  professional: schedule.storeMember
    ? {
        id: schedule.storeMember.id,
        name: getUserFullName(schedule.storeMember.user),
      }
    : null,
  customer: schedule.user
    ? {
        id: schedule.user.id,
        firstName: schedule.user.firstName ?? null,
        lastName: schedule.user.lastName ?? null,
        email: schedule.user.email ?? null,
        telephone: schedule.user.telephone ?? null,
      }
    : null,
  createdAt: new Date(schedule.createdAt).toISOString(),
  updatedAt: new Date(schedule.updatedAt).toISOString(),
});
