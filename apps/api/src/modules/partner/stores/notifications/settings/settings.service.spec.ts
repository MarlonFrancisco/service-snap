import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { NotificationsSettingsDto } from './dto/settings.dto';
import { NotificationsSettingsService } from './settings.service';

const setup = (
  current: { id: string } | null,
  {
    missingFeatures = [] as string[],
    isWhatsappConnected = true,
  }: { missingFeatures?: string[]; isWhatsappConnected?: boolean } = {},
) => {
  const repository = {
    findOne: vi.fn().mockResolvedValue(current),
    save: vi.fn().mockResolvedValue(undefined),
  };
  const whatsappConfigRepository = {
    exists: vi.fn().mockResolvedValue(isWhatsappConnected),
  };
  const planFeatureGuard = {
    getMissingFeatures: vi.fn().mockResolvedValue(missingFeatures),
  };

  return {
    repository,
    planFeatureGuard,
    service: new NotificationsSettingsService(
      repository as never,
      whatsappConfigRepository as never,
      planFeatureGuard as never,
    ),
  };
};

const dto = (fields: Partial<NotificationsSettingsDto>) =>
  ({ store: { id: 'store-1' }, ...fields }) as NotificationsSettingsDto;

describe('NotificationsSettingsService.update', () => {
  it('updates the row of the store, ignoring the id from the body', async () => {
    const { service, repository } = setup({ id: 'settings-1' });

    await service.update(
      dto({ id: 'other-store-settings', emailReminderEnabled: true }),
    );

    expect(repository.save).toHaveBeenCalledWith({
      store: { id: 'store-1' },
      emailReminderEnabled: true,
      id: 'settings-1',
    });
  });

  it('creates the row when the store has no settings yet', async () => {
    const { service, repository } = setup(null);

    await service.update(dto({ smsReminderEnabled: true }));

    expect(repository.save.mock.calls[0][0].id).toBeUndefined();
  });

  it('blocks WhatsApp reminders when the plan does not include them', async () => {
    const { service, repository } = setup(
      { id: 'settings-1' },
      { missingFeatures: ['WHATSAPP_INTEGRATION'] },
    );

    await expect(
      service.update(dto({ whatsappReminderEnabled: true })),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('blocks WhatsApp reminders until the store connects WhatsApp', async () => {
    const { service, repository } = setup(
      { id: 'settings-1' },
      { isWhatsappConnected: false },
    );

    await expect(
      service.update(dto({ whatsappReminderEnabled: true })),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('always lets WhatsApp reminders be turned off', async () => {
    const { service, repository, planFeatureGuard } = setup(
      { id: 'settings-1' },
      { missingFeatures: ['WHATSAPP_INTEGRATION'], isWhatsappConnected: false },
    );

    await service.update(dto({ whatsappReminderEnabled: false }));

    expect(planFeatureGuard.getMissingFeatures).not.toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalled();
  });
});
