import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryService } from '../category/category.service';
import { ServiceService } from '../category/service/service.service';
import { GalleryService } from '../gallery/gallery.service';
import { NotificationsHistoryService } from '../notifications/history/history.service';
import { NotificationsSettingsService } from '../notifications/settings/settings.service';
import { ReviewService } from '../review/review.service';
import { ScheduleService } from '../schedule/schedule.service';
import { BlockedTimeService } from '../store-member/blocked-time/blocked-time.service';
import { StoreMemberService } from '../store-member/store-member.service';

const STORE = 'store-1';
const scoped = { id: 'foreign-id', store: { id: STORE } };

const createRepository = () => ({
  update: vi.fn().mockResolvedValue({ affected: 0 }),
  delete: vi.fn().mockResolvedValue({ affected: 0 }),
  save: vi.fn().mockImplementation(async (value) =>
    Array.isArray(value)
      ? value.map((item) => ({ ...item, id: 'new' }))
      : { ...value, id: 'new' },
  ),
  create: vi.fn().mockImplementation((value) => value),
  find: vi.fn().mockResolvedValue([]),
  findOne: vi.fn().mockResolvedValue(null),
  exists: vi.fn().mockResolvedValue(true),
});

describe('store-scoped services with an id from another store', () => {
  let repository: ReturnType<typeof createRepository>;
  let related: ReturnType<typeof createRepository>;

  beforeEach(() => {
    repository = createRepository();
    related = createRepository();
  });

  describe('CategoryService', () => {
    const create = () => new CategoryService(repository as never);

    it('findOne filters by store and returns 404', async () => {
      await expect(create().findOne(STORE, 'foreign-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repository.findOne.mock.calls[0][0].where).toEqual(scoped);
    });

    it('update filters by store and returns 404', async () => {
      await expect(
        create().update({ ...scoped, name: 'x' } as never),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.update.mock.calls[0][0]).toEqual(scoped);
    });

    it('delete filters by store and returns 404', async () => {
      await expect(create().delete(STORE, 'foreign-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repository.delete).toHaveBeenCalledWith(scoped);
    });

    it('create ignores an id sent in the body', async () => {
      await create().create({ ...scoped, name: 'x' } as never);
      expect(repository.save.mock.calls[0][0].id).toBeUndefined();
    });
  });

  describe('ServiceService', () => {
    const create = () =>
      new ServiceService(repository as never, related as never);
    const dto = { ...scoped, category: { id: 'category-1' } } as never;

    it('findOneInStore filters by store and returns 404', async () => {
      await expect(
        create().findOneInStore(STORE, 'foreign-id'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.findOne.mock.calls[0][0].where).toEqual(scoped);
    });

    it('update filters by store and returns 404', async () => {
      await expect(create().update(dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repository.update.mock.calls[0][0]).toEqual(scoped);
    });

    it('delete filters by store and returns 404', async () => {
      await expect(create().delete(STORE, 'foreign-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repository.delete).toHaveBeenCalledWith(scoped);
    });

    it.each(['create', 'update'] as const)(
      '%s rejects a category from another store',
      async (method) => {
        related.exists.mockResolvedValue(false);

        await expect(create()[method](dto)).rejects.toBeInstanceOf(
          NotFoundException,
        );
        expect(related.exists).toHaveBeenCalledWith({
          where: { id: 'category-1', store: { id: STORE } },
        });
        expect(repository.save).not.toHaveBeenCalled();
        expect(repository.update).not.toHaveBeenCalled();
      },
    );

    it('create ignores an id sent in the body', async () => {
      await create().create(dto);
      expect(repository.save.mock.calls[0][0].id).toBeUndefined();
    });
  });

  describe('ScheduleService', () => {
    const manager = {
      save: vi.fn(async (_entity, rows) => rows),
      transaction: vi.fn(async (callback) => callback(manager)),
    };
    const create = () =>
      new ScheduleService(
        { ...repository, manager } as never,
        related as never,
        {
          find: vi.fn().mockResolvedValue([{ id: 'service-1', duration: 30 }]),
        } as never,
        {} as never,
        {} as never,
        { upsert: vi.fn().mockResolvedValue({ id: 'user-1' }) } as never,
      );

    it('update filters by store and returns 404', async () => {
      await expect(create().update(scoped as never)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repository.update.mock.calls[0][0]).toEqual(scoped);
    });

    it('delete filters by store and returns 404', async () => {
      await expect(create().delete(STORE, 'foreign-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repository.update).toHaveBeenCalledWith(scoped, {
        status: 'cancelled',
      });
    });

    it('delete cancels a schedule from the URL store', async () => {
      repository.update.mockResolvedValue({ affected: 1 });

      await expect(create().delete(STORE, 'schedule-1')).resolves.toEqual({
        id: 'schedule-1',
      });
    });

    it('create ignores an id sent in the body', async () => {
      related.findOne.mockResolvedValue({ id: STORE });

      await create().create({
        id: 'foreign-id',
        store: { id: STORE },
        startTime: '10:00',
        user: { email: 'ana@example.com' },
        services: [{ id: 'service-1', duration: 30 }],
      } as never);

      expect(manager.save.mock.calls[0][1][0].id).toBeUndefined();
    });
  });

  describe('StoreMemberService', () => {
    const create = () =>
      new StoreMemberService(
        repository as never,
        related as never,
        {} as never,
      );

    it('update filters by store and returns 404', async () => {
      await expect(create().update(scoped as never)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repository.findOne.mock.calls[0][0].where).toEqual(scoped);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('delete filters by store and returns 404', async () => {
      await expect(create().delete(STORE, 'foreign-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repository.delete).toHaveBeenCalledWith(scoped);
    });
  });

  describe('BlockedTimeService', () => {
    const MEMBER = 'member-1';
    const memberScoped = { id: 'foreign-id', storeMember: { id: MEMBER } };
    const create = () =>
      new BlockedTimeService(repository as never, related as never);

    const calls = (service: BlockedTimeService) => [
      () => service.findAll(STORE, MEMBER),
      () => service.create(STORE, memberScoped as never),
      () => service.createBulk(STORE, MEMBER, { blockedTimes: [] }),
      () => service.update(STORE, memberScoped as never),
      () => service.delete(STORE, MEMBER, 'foreign-id'),
      () => service.deleteBulk(STORE, MEMBER, { blockedTimes: [] }),
    ];

    it('rejects every route when the member is from another store', async () => {
      related.exists.mockResolvedValue(false);
      const service = create();

      for (const call of calls(service)) {
        await expect(call()).rejects.toBeInstanceOf(NotFoundException);
      }

      expect(related.exists).toHaveBeenCalledWith({
        where: { id: MEMBER, store: { id: STORE } },
      });
      expect(repository.update).not.toHaveBeenCalled();
      expect(repository.delete).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('update filters by member and returns 404', async () => {
      await expect(
        create().update(STORE, memberScoped as never),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.update.mock.calls[0][0]).toEqual(memberScoped);
    });

    it('delete filters by member and returns 404', async () => {
      await expect(
        create().delete(STORE, MEMBER, 'foreign-id'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.delete).toHaveBeenCalledWith(memberScoped);
    });

    it('deleteBulk filters by member with plain criteria', async () => {
      await create().deleteBulk(STORE, MEMBER, {
        blockedTimes: [{ id: 'foreign-id' }],
      });

      const [criteria] = repository.delete.mock.calls[0];

      expect(Array.isArray(criteria)).toBe(false);
      expect(criteria.storeMember).toEqual({ id: MEMBER });
    });

    it('createBulk ignores ids sent in the body', async () => {
      await create().createBulk(STORE, MEMBER, {
        blockedTimes: [{ id: 'foreign-id', date: new Date(), time: '10:00' }],
      });

      expect(repository.save.mock.calls[0][0][0].id).toBeUndefined();
    });
  });

  describe('GalleryService', () => {
    const storage = { deleteFile: vi.fn(), uploadFile: vi.fn() };
    const create = () =>
      new GalleryService(repository as never, storage as never);

    beforeEach(() => storage.deleteFile.mockClear());

    it('delete filters by store, returns 404 and keeps the file', async () => {
      await expect(create().delete(STORE, 'foreign-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repository.delete).toHaveBeenCalledWith(scoped);
      expect(storage.deleteFile).not.toHaveBeenCalled();
    });

    it('updateMainImage returns 404 before touching the main image', async () => {
      repository.exists.mockResolvedValue(false);

      await expect(
        create().updateMainImage(scoped as never),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.exists).toHaveBeenCalledWith({ where: scoped });
      expect(repository.save).not.toHaveBeenCalled();
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('NotificationsHistoryService', () => {
    const create = () => new NotificationsHistoryService(repository as never);

    it('update filters by store, returns 404 and pins id and store', async () => {
      await expect(
        create().update(STORE, 'foreign-id', {
          id: 'other-id',
          store: { id: 'other-store' },
          read: true,
        } as never),
      ).rejects.toBeInstanceOf(NotFoundException);

      const [criteria, values] = repository.update.mock.calls[0];

      expect(criteria).toEqual(scoped);
      expect(values).toEqual({ ...scoped, read: true });
    });

    it('delete filters by store and returns 404', async () => {
      await expect(create().delete(STORE, 'foreign-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repository.delete).toHaveBeenCalledWith(scoped);
    });
  });

  describe('NotificationsSettingsService', () => {
    it('update ignores an id sent in the body', async () => {
      repository.findOne.mockResolvedValue({ id: 'own-settings' });

      await new NotificationsSettingsService(repository as never).update(
        scoped as never,
      );

      expect(repository.save.mock.calls[0][0].id).toBe('own-settings');
    });
  });

  describe('ReviewService', () => {
    const USER = 'user-1';
    const authored = { ...scoped, user: { id: USER } };
    const create = () => new ReviewService(repository as never);

    it('findOneInStore returns 404 for a review from another store', async () => {
      repository.findOne.mockResolvedValue({
        id: 'foreign-id',
        store: { id: 'other-store' },
      });

      await expect(
        create().findOneInStore(STORE, 'foreign-id'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('update filters by store and author, and only changes rating and comment', async () => {
      await expect(
        create().update(STORE, 'foreign-id', USER, {
          rating: 5,
          comment: 'ok',
          user: { id: 'other-user' },
          store: { id: 'other-store' },
        }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(repository.update).toHaveBeenCalledWith(authored, {
        rating: 5,
        comment: 'ok',
      });
    });

    it('delete filters by store and author and returns 404', async () => {
      await expect(
        create().delete(STORE, 'foreign-id', USER),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.delete).toHaveBeenCalledWith(authored);
    });

    it('create ignores an id sent in the body', async () => {
      await create().create(authored as never);
      expect(repository.save.mock.calls[0][0].id).toBeUndefined();
    });
  });
});
