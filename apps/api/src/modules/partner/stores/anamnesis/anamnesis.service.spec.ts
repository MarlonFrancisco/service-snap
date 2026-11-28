import { randomBytes } from 'crypto';
import { describe, expect, it, vi } from 'vitest';
import { AnamnesisService } from './anamnesis.service';

const STORE = { id: 'store-1' };
const KEY = randomBytes(32).toString('base64');

const schedule = (id: string, serviceId: string, startTime: string) => ({
  id,
  date: '2099-11-10',
  startTime,
  status: 'scheduled',
  store: STORE,
  service: { id: serviceId },
  booking: { id: 'booking-1' },
});

const form = (id: string, serviceIds: string[] = []) => ({
  id,
  name: `Ficha ${id}`,
  serviceIds,
  isActive: true,
  store: STORE,
});

const makeService = ({
  key = KEY,
  forms = [form('general'), form('hair', ['cut'])],
  responses = [] as unknown[],
} = {}) => {
  const schedules = [
    schedule('s1', 'cut', '10:00'),
    schedule('s2', 'beard', '10:30'),
  ];
  const scheduleRepository = {
    find: vi.fn().mockResolvedValue(schedules),
  };
  const formRepository = { find: vi.fn().mockResolvedValue(forms) };
  const responseRepository = { find: vi.fn().mockResolvedValue(responses) };
  const config = {
    get: (name: string) =>
      ({ DATA_ENCRYPTION_KEY: key, FRONTEND_URL: 'https://app.test' })[name],
  };

  const service = new AnamnesisService(
    formRepository as never,
    responseRepository as never,
    scheduleRepository as never,
    {} as never,
    config as never,
    {} as never,
  );

  return { service, responseRepository };
};

describe('AnamnesisService.customerLinks', () => {
  it('asks each form once per booking, on the first service that needs it', async () => {
    const { service } = makeService();

    const links = await service.customerLinks(['s1', 's2']);

    expect(links).toHaveLength(1);
    expect(links[0]).toMatchObject({
      scheduleId: 's1',
      forms: [
        { id: 'general', name: 'Ficha general' },
        { id: 'hair', name: 'Ficha hair' },
      ],
    });
    expect(links[0]!.url).toMatch(/^https:\/\/app\.test\/anamnese\/.+/);
  });

  it('leaves out a form already answered anywhere in the booking', async () => {
    const { service } = makeService({
      responses: [{ form: { id: 'general' }, schedule: { id: 's2' } }],
    });

    const links = await service.customerLinks(['s2'], { onlyPending: true });

    expect(links).toHaveLength(1);
    expect(links[0]!.forms).toEqual([{ id: 'hair', name: 'Ficha hair' }]);
  });

  it('offers nothing when the store has no form for these services', async () => {
    const { service } = makeService({ forms: [form('nails', ['nails'])] });

    await expect(service.customerLinks(['s1', 's2'])).resolves.toEqual([]);
  });

  it('offers nothing, without failing, when encryption is not configured', async () => {
    const { service } = makeService({ key: '' });

    await expect(service.customerLinks(['s1'])).resolves.toEqual([]);
  });
});
