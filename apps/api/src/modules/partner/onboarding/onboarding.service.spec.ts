import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { availableToIndexStore } from '../../../utils/helpers/search.helpers';
import {
  furthestStep,
  isStoreDraft,
  validateBusinessHours,
} from './onboarding.helpers';
import { OnboardingService } from './onboarding.service';

const USER_ID = 'owner-1';
const STORE_ID = 'store-1';
const SERVICE_ID = '7a2e8d2b-1f4e-4c68-8a4b-2d3e4f5a6b7c';

const makeDraft = (overrides = {}) => ({
  id: STORE_ID,
  name: 'Espaço de teste',
  openTime: '09:00',
  businessDays: { monday: true },
  onboarding: { id: 'ob-1', step: 'services', completedAt: null },
  ...overrides,
});

const PROFESSIONAL = {
  id: 'm1',
  role: 'professional',
  isActive: true,
  isDeleted: false,
  services: [{ id: SERVICE_ID }],
};

const makeService = () => {
  const manager = {
    save: vi.fn(async (_entity, row) => ({ ...row, id: STORE_ID })),
    update: vi.fn(),
  };
  const repository = () => ({
    find: vi.fn().mockResolvedValue([]),
    findOne: vi.fn().mockResolvedValue(null),
    save: vi.fn(async (row) => ({ ...row, id: 'new-id' })),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn().mockResolvedValue(1),
  });
  const onboardingRepository = repository();
  const storeRepository = {
    ...repository(),
    manager: {
      transaction: vi.fn(async (callback) => callback(manager)),
    },
  };
  const categoryRepository = repository();
  const serviceRepository = repository();
  const storeMemberRepository = repository();
  const galleryRepository = repository();
  const subscriptionRepository = repository();
  subscriptionRepository.findOne.mockResolvedValue({ id: 'sub', features: {} });
  const storeMemberService = {
    getProfessionalUsage: vi.fn().mockResolvedValue({ count: 0, limit: 1 }),
    createForUser: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const storesService = { syncSearchIndex: vi.fn() };
  const usersService = { findByOne: vi.fn().mockResolvedValue(null) };

  const service = new OnboardingService(
    onboardingRepository as never,
    storeRepository as never,
    categoryRepository as never,
    serviceRepository as never,
    storeMemberRepository as never,
    galleryRepository as never,
    subscriptionRepository as never,
    storeMemberService as never,
    storesService as never,
    usersService as never,
  );

  return {
    service,
    manager,
    onboardingRepository,
    storeRepository,
    categoryRepository,
    serviceRepository,
    storeMemberRepository,
    subscriptionRepository,
    storeMemberService,
    storesService,
    usersService,
  };
};

const SPACE = {
  businessType: 'Barbearia',
  name: 'Espaço de teste',
  description: 'Descrição de teste',
  zipCode: '01001-000',
  address: 'Rua de teste, 1',
  city: 'São Paulo',
  state: 'sp',
  telephone: '(11) 90000-0000',
};

describe('OnboardingService', () => {
  let ctx: ReturnType<typeof makeService>;

  beforeEach(() => {
    ctx = makeService();
  });

  describe('getState', () => {
    it('sends a paying partner without stores to the welcome screen', async () => {
      const state = await ctx.service.getState(USER_ID);

      expect(state.status).toBe('welcome');
      expect(state.step).toBe('space');
    });

    it('resumes a draft on the saved step', async () => {
      ctx.storeRepository.find.mockResolvedValue([makeDraft()]);

      const state = await ctx.service.getState(USER_ID);

      expect(state.status).toBe('in_progress');
      expect(state.step).toBe('services');
    });

    it('leaves partners who already have a store alone', async () => {
      // Loja antiga: sem linha de onboarding, mesmo estando inativa.
      ctx.storeRepository.find.mockResolvedValue([
        { id: STORE_ID, isActive: false },
      ]);

      const state = await ctx.service.getState(USER_ID);

      expect(state.status).toBe('not_needed');
      expect(state.step).toBeNull();
    });
  });

  describe('saveSpace', () => {
    it('creates the store inactive, with its progress row', async () => {
      await ctx.service.saveSpace(USER_ID, SPACE);

      const [, storeRow] = ctx.manager.save.mock.calls[0]!;
      expect(storeRow).toMatchObject({
        isActive: false,
        state: 'SP',
        owner: { id: USER_ID },
      });
      expect(storeRow).not.toHaveProperty('businessType');

      const [, progressRow] = ctx.manager.save.mock.calls[1]!;
      expect(progressRow).toMatchObject({
        store: { id: STORE_ID },
        businessType: 'Barbearia',
        step: 'hours',
      });
    });

    it('updates the draft instead of creating a second store', async () => {
      ctx.storeRepository.find.mockResolvedValue([makeDraft()]);

      await ctx.service.saveSpace(USER_ID, SPACE);

      expect(ctx.manager.save).not.toHaveBeenCalled();
      expect(ctx.storeRepository.update).toHaveBeenCalledWith(
        STORE_ID,
        expect.objectContaining({ name: SPACE.name }),
      );
      // Corrigir o espaço não pode recuar quem já estava em Serviços.
      expect(ctx.onboardingRepository.update).toHaveBeenCalledWith(
        'ob-1',
        expect.objectContaining({ step: 'services' }),
      );
    });

    it('refuses without an active subscription', async () => {
      ctx.subscriptionRepository.findOne.mockResolvedValue(null);

      await expect(ctx.service.saveSpace(USER_ID, SPACE)).rejects.toThrow(
        'Assinatura ativa',
      );
      expect(ctx.manager.save).not.toHaveBeenCalled();
    });

    it('refuses when the partner already has a finished store', async () => {
      ctx.storeRepository.find.mockResolvedValue([{ id: STORE_ID }]);

      await expect(
        ctx.service.saveSpace(USER_ID, SPACE),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('saveHours', () => {
    const HOURS = {
      businessDays: { monday: true },
      openTime: '09:00',
      closeTime: '18:00',
    };

    beforeEach(() => {
      ctx.storeRepository.find.mockResolvedValue([makeDraft()]);
    });

    it('stores null lunch when the partner has no break', async () => {
      await ctx.service.saveHours(USER_ID, HOURS);

      expect(ctx.storeRepository.update).toHaveBeenCalledWith(
        STORE_ID,
        expect.objectContaining({
          lunchStartTime: null,
          lunchEndTime: null,
          businessDays: expect.objectContaining({
            monday: true,
            sunday: false,
          }),
        }),
      );
    });

    it('needs at least one working day', async () => {
      await expect(
        ctx.service.saveHours(USER_ID, { ...HOURS, businessDays: {} }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('addService', () => {
    const DTO = {
      categoryName: 'Barbearia',
      name: 'Corte',
      duration: 30,
      price: 50,
    };

    beforeEach(() => {
      ctx.storeRepository.find.mockResolvedValue([makeDraft()]);
    });

    it('fills the category fields the wizard does not ask for', async () => {
      await ctx.service.addService(USER_ID, DTO);

      expect(ctx.categoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Barbearia',
          description: 'Serviços de Barbearia',
          color: 'purple',
        }),
      );
      expect(ctx.serviceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ description: '', isActive: true }),
      );
    });

    it('reuses a category regardless of case', async () => {
      ctx.categoryRepository.find.mockResolvedValue([
        { id: 'c1', name: 'BARBEARIA' },
      ]);

      await ctx.service.addService(USER_ID, DTO);

      expect(ctx.categoryRepository.save).not.toHaveBeenCalled();
      expect(ctx.serviceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ category: { id: 'c1' } }),
      );
    });

    it('refuses a duplicated service in the same category', async () => {
      ctx.categoryRepository.find.mockResolvedValue([
        { id: 'c1', name: 'Barbearia' },
      ]);
      ctx.serviceRepository.find.mockResolvedValueOnce([{ name: 'corte' }]);

      await expect(ctx.service.addService(USER_ID, DTO)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  describe('team', () => {
    beforeEach(() => {
      ctx.storeRepository.find.mockResolvedValue([makeDraft()]);
    });

    it('registers the owner as a professional, not as an owner', async () => {
      await ctx.service.saveOwner(USER_ID, {
        enabled: true,
        serviceIds: [SERVICE_ID],
      });

      expect(ctx.storeMemberService.createForUser).toHaveBeenCalledWith({
        userId: USER_ID,
        storeId: STORE_ID,
        ownerUserId: USER_ID,
        role: 'professional',
        services: [{ id: SERVICE_ID }],
      });
    });

    it('updates the owner services instead of duplicating the member', async () => {
      ctx.storeMemberRepository.findOne.mockResolvedValue({ id: 'm1' });

      await ctx.service.saveOwner(USER_ID, {
        enabled: true,
        serviceIds: [SERVICE_ID],
      });

      expect(ctx.storeMemberService.createForUser).not.toHaveBeenCalled();
      expect(ctx.storeMemberService.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'm1', role: 'professional' }),
      );
    });

    it('removes the owner when "Eu mesmo atendo" is turned off', async () => {
      ctx.storeMemberRepository.findOne.mockResolvedValue({ id: 'm1' });

      await ctx.service.saveOwner(USER_ID, { enabled: false, serviceIds: [] });

      expect(ctx.storeMemberService.delete).toHaveBeenCalledWith(
        STORE_ID,
        'm1',
      );
    });

    it('rejects services from another store', async () => {
      ctx.serviceRepository.count.mockResolvedValue(0);

      await expect(
        ctx.service.saveOwner(USER_ID, {
          enabled: true,
          serviceIds: [SERVICE_ID],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(ctx.storeMemberService.createForUser).not.toHaveBeenCalled();
    });

    it('reports an unknown e-mail without creating a pending invite', async () => {
      await expect(
        ctx.service.addMember(USER_ID, {
          email: 'pessoa@example.com',
          serviceIds: [SERVICE_ID],
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(ctx.storeMemberService.createForUser).not.toHaveBeenCalled();
    });

    it('does not let the owner be added by e-mail', async () => {
      ctx.usersService.findByOne.mockResolvedValue({ id: USER_ID });

      await expect(
        ctx.service.addMember(USER_ID, {
          email: 'dono@example.com',
          serviceIds: [SERVICE_ID],
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('setStep', () => {
    beforeEach(() => {
      ctx.storeRepository.find.mockResolvedValue([makeDraft()]);
    });

    it('blocks the team step without a service', async () => {
      await expect(
        ctx.service.setStep(USER_ID, { step: 'team' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('blocks the photos step when only a manager exists', async () => {
      ctx.serviceRepository.find.mockResolvedValue([{ id: SERVICE_ID }]);
      ctx.storeMemberRepository.find.mockResolvedValue([
        { ...PROFESSIONAL, role: 'manager' },
      ]);

      await expect(
        ctx.service.setStep(USER_ID, { step: 'photos' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('complete', () => {
    beforeEach(() => {
      ctx.storeRepository.find.mockResolvedValue([makeDraft()]);
      ctx.serviceRepository.find.mockResolvedValue([
        { id: SERVICE_ID, name: 'Corte', price: 50 },
      ]);
      ctx.storeMemberRepository.find.mockResolvedValue([PROFESSIONAL]);
    });

    it('activates the store and indexes it, without photos', async () => {
      const result = await ctx.service.complete(USER_ID);

      expect(ctx.manager.update).toHaveBeenCalledWith(
        expect.anything(),
        'ob-1',
        expect.objectContaining({ completedAt: expect.any(Date) }),
      );
      expect(ctx.manager.update).toHaveBeenCalledWith(
        expect.anything(),
        STORE_ID,
        { isActive: true },
      );
      expect(ctx.storesService.syncSearchIndex).toHaveBeenCalledWith(STORE_ID);
      expect(result.store.id).toBe(STORE_ID);
    });

    it.each([
      ['no service', () => ctx.serviceRepository.find.mockResolvedValue([]), 'services'],
      [
        'only a manager',
        () =>
          ctx.storeMemberRepository.find.mockResolvedValue([
            { ...PROFESSIONAL, role: 'manager' },
          ]),
        'team',
      ],
      [
        'a professional without services',
        () =>
          ctx.storeMemberRepository.find.mockResolvedValue([
            { ...PROFESSIONAL, services: [] },
          ]),
        'team',
      ],
    ])('keeps the store hidden with %s', async (_label, arrange, step) => {
      arrange();

      const error = await ctx.service.complete(USER_ID).catch((e) => e);

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toMatchObject({ step });
      expect(ctx.manager.update).not.toHaveBeenCalled();
      expect(ctx.storesService.syncSearchIndex).not.toHaveBeenCalled();
    });

    it('fails when there is nothing in progress', async () => {
      ctx.storeRepository.find.mockResolvedValue([]);

      await expect(ctx.service.complete(USER_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getChecklist', () => {
    const makeStore = (overrides = {}) => ({
      id: STORE_ID,
      monthlyGoal: 0,
      gallery: [],
      storeMembers: [
        { role: 'professional', user: { id: USER_ID } },
      ],
      notificationsSettings: null,
      whatsappConfig: null,
      onboarding: { completedAt: new Date(), linkSharedAt: null },
      ...overrides,
    });

    it('reads every item from real data', async () => {
      ctx.storeRepository.findOne.mockResolvedValue(
        makeStore({
          monthlyGoal: 1000,
          gallery: [{ id: 'g' }],
          notificationsSettings: { emailReminderEnabled: true },
          storeMembers: [
            { role: 'professional', user: { id: USER_ID } },
            { role: 'professional', user: { id: 'other' } },
          ],
          onboarding: { completedAt: new Date(), linkSharedAt: new Date() },
        }),
      );

      const { items, visible } = await ctx.service.getChecklist(
        USER_ID,
        STORE_ID,
      );

      expect(items.every((item) => item.done)).toBe(true);
      expect(visible).toBe(false);
    });

    it('does not count the owner as "another professional"', async () => {
      ctx.storeRepository.findOne.mockResolvedValue(makeStore());

      const { items } = await ctx.service.getChecklist(USER_ID, STORE_ID);

      expect(items.find((item) => item.id === 'team')?.done).toBe(false);
    });

    it('only offers WhatsApp to plans that include it', async () => {
      ctx.storeRepository.findOne.mockResolvedValue(makeStore());

      const without = await ctx.service.getChecklist(USER_ID, STORE_ID);
      expect(without.items.map((item) => item.id)).not.toContain('whatsapp');

      ctx.subscriptionRepository.findOne.mockResolvedValue({
        features: { WHATSAPP_INTEGRATION: true },
      });

      const withFeature = await ctx.service.getChecklist(USER_ID, STORE_ID);
      expect(withFeature.items.map((item) => item.id)).toContain('whatsapp');
    });

    it('stays hidden once dismissed', async () => {
      ctx.storeRepository.findOne.mockResolvedValue(
        makeStore({
          onboarding: {
            completedAt: new Date(),
            checklistDismissedAt: new Date(),
          },
        }),
      );

      const { visible } = await ctx.service.getChecklist(USER_ID, STORE_ID);

      expect(visible).toBe(false);
    });

    it('stays hidden for stores that never went through the wizard', async () => {
      ctx.storeRepository.findOne.mockResolvedValue(
        makeStore({ onboarding: null }),
      );

      const { visible } = await ctx.service.getChecklist(USER_ID, STORE_ID);

      expect(visible).toBe(false);
    });

    it('does not expose another partner store', async () => {
      await expect(
        ctx.service.getChecklist(USER_ID, 'other-store'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});

describe('onboarding helpers', () => {
  it('treats only unfinished wizard stores as drafts', () => {
    expect(isStoreDraft({ onboarding: null as never })).toBe(false);
    expect(
      isStoreDraft({ onboarding: { completedAt: null } as never }),
    ).toBe(true);
    expect(
      isStoreDraft({ onboarding: { completedAt: new Date() } as never }),
    ).toBe(false);
  });

  it('never moves the saved step backwards', () => {
    expect(furthestStep('team', 'hours')).toBe('team');
    expect(furthestStep('hours', 'services')).toBe('services');
  });

  it.each([
    [{ openTime: '18:00', closeTime: '09:00' }, 'fechamento'],
    [
      {
        openTime: '09:00',
        closeTime: '18:00',
        lunchStartTime: '12:00',
      },
      'início e o fim',
    ],
    [
      {
        openTime: '09:00',
        closeTime: '18:00',
        lunchStartTime: '13:00',
        lunchEndTime: '12:00',
      },
      'pausa',
    ],
    [
      {
        openTime: '09:00',
        closeTime: '18:00',
        lunchStartTime: '08:00',
        lunchEndTime: '10:00',
      },
      'pausa',
    ],
  ])('rejects incoherent hours %#', (hours, message) => {
    expect(validateBusinessHours(hours)).toContain(message);
  });

  it('accepts hours with or without lunch', () => {
    expect(
      validateBusinessHours({ openTime: '09:00', closeTime: '18:00' }),
    ).toBeNull();
    expect(
      validateBusinessHours({
        openTime: '09:00',
        closeTime: '18:00',
        lunchStartTime: '12:00',
        lunchEndTime: '13:00',
      }),
    ).toBeNull();
  });
});

describe('availableToIndexStore', () => {
  const STORE = {
    isActive: true,
    gallery: [],
    services: [{ isActive: true }],
    storeMembers: [PROFESSIONAL],
    onboarding: { completedAt: new Date() },
  };

  it('indexes a ready store without photos', () => {
    expect(availableToIndexStore(STORE as never)).toBe(true);
  });

  it('indexes an older store that has no onboarding row', () => {
    expect(
      availableToIndexStore({ ...STORE, onboarding: null } as never),
    ).toBe(true);
  });

  it.each([
    ['inactive', { isActive: false }],
    ['still a draft', { onboarding: { completedAt: null } }],
    ['without services', { services: [] }],
    ['with inactive services only', { services: [{ isActive: false }] }],
    ['without members', { storeMembers: [] }],
    ['with a manager only', { storeMembers: [{ ...PROFESSIONAL, role: 'manager' }] }],
    ['with a professional without services', { storeMembers: [{ ...PROFESSIONAL, services: [] }] }],
  ])('does not index a store %s', (_label, overrides) => {
    expect(availableToIndexStore({ ...STORE, ...overrides } as never)).toBe(
      false,
    );
  });
});
