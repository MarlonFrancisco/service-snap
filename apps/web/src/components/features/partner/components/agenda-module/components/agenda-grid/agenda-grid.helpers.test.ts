import type { IAppointment } from '@/types/api/schedule.types';
import { describe, expect, it } from 'vitest';
import { getAppointmentAriaLabel, getClientName } from './agenda-grid.helpers';

const buildAppointment = (user: Partial<IAppointment['user']>) =>
  ({
    user,
    service: { name: 'Corte masculino' },
    storeMember: { user: { firstName: 'Ana', lastName: 'Souza' } },
    startTime: '09:30',
    endTime: '10:15',
  }) as unknown as IAppointment;

describe('getClientName', () => {
  it('joins first and last name', () => {
    expect(
      getClientName({ firstName: 'Maria', lastName: 'Lima' } as never),
    ).toBe('Maria Lima');
  });

  it('uses only the name that exists', () => {
    expect(getClientName({ firstName: 'Maria', lastName: null } as never)).toBe(
      'Maria',
    );
  });

  it('falls back when the client has no name', () => {
    expect(getClientName({ firstName: null, lastName: null } as never)).toBe(
      'Cliente sem nome',
    );
  });
});

describe('getAppointmentAriaLabel', () => {
  it('never prints null for a client without name', () => {
    const label = getAppointmentAriaLabel(
      buildAppointment({ firstName: null, lastName: null } as never),
    );

    expect(label).toBe(
      'Cliente sem nome, Corte masculino, 09:30 a 10:15, Ana Souza',
    );
    expect(label).not.toContain('null');
  });
});
