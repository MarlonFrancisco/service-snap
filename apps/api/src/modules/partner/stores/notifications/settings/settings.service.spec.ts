import { describe, expect, it, vi } from 'vitest';
import { NotificationsSettingsDto } from './dto/settings.dto';
import { NotificationsSettingsService } from './settings.service';

const setup = (current: { id: string } | null) => {
  const repository = {
    findOne: vi.fn().mockResolvedValue(current),
    save: vi.fn().mockResolvedValue(undefined),
  };

  return {
    repository,
    service: new NotificationsSettingsService(repository as never),
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
});
