import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { IS_PUBLIC_KEY } from '../../../auth/guards/jwt-auth.guard';
import { MetricsController } from '../../metrics/metrics.controller';
import { CategoryController } from '../category/category.controller';
import { ServiceController } from '../category/service/service.controller';
import { GalleryController } from '../gallery/gallery.controller';
import { NotificationsHistoryController } from '../notifications/history/history.controller';
import { NotificationsSettingsController } from '../notifications/settings/settings.controller';
import { ReviewController } from '../review/review.controller';
import { ScheduleCancelGuard } from '../schedule/schedule-cancel.guard';
import { ScheduleController } from '../schedule/schedule.controller';
import { BlockedTimeController } from '../store-member/blocked-time/blocked-time.controller';
import { StoreMemberController } from '../store-member/store-member.controller';
import { StoreAccessGuard } from './store-access.guard';
import { REQUIRED_ROLES_KEY, StoreRoleGuard } from './store-role.guard';

type TController = { prototype: object; name: string };

const guardsOf = (controller: TController, method: string) => {
  const handler = controller.prototype[method as never] as object;

  return [
    ...(Reflect.getMetadata(GUARDS_METADATA, controller) ?? []),
    ...(Reflect.getMetadata(GUARDS_METADATA, handler) ?? []),
  ];
};

const methodsOf = (controller: TController) =>
  Object.getOwnPropertyNames(controller.prototype).filter(
    (name) => name !== 'constructor',
  );

describe('partner store routes', () => {
  it.each([
    [CategoryController],
    [ServiceController],
    [GalleryController],
    [BlockedTimeController],
    [NotificationsHistoryController],
    [NotificationsSettingsController],
    [MetricsController],
  ])('%o requires store access on every route', (controller) => {
    for (const method of methodsOf(controller)) {
      expect(guardsOf(controller, method), method).toContain(StoreAccessGuard);
    }
  });

  it('requires store access to read or edit schedules', () => {
    expect(guardsOf(ScheduleController, 'findAll')).toContain(StoreAccessGuard);
    expect(guardsOf(ScheduleController, 'update')).toContain(StoreAccessGuard);
  });

  it('lets the customer cancel a booking through the cancel guard', () => {
    expect(guardsOf(ScheduleController, 'delete')).toEqual([
      ScheduleCancelGuard,
    ]);
  });

  it('keeps booking open to customers with no link to the store', () => {
    expect(guardsOf(ScheduleController, 'create')).toEqual([]);
  });

  it('keeps availability public for the booking flow', () => {
    expect(guardsOf(ScheduleController, 'getAvailability')).toEqual([]);
    expect(
      Reflect.getMetadata(
        IS_PUBLIC_KEY,
        ScheduleController.prototype.getAvailability,
      ),
    ).toBe(true);
  });

  it('keeps writing and reading reviews open to customers', () => {
    expect(guardsOf(ReviewController, 'create')).toEqual([]);
    expect(guardsOf(ReviewController, 'findAll')).toEqual([]);
    expect(
      Reflect.getMetadata(IS_PUBLIC_KEY, ReviewController.prototype.findAll),
    ).toBe(true);
  });

  it('requires store access to list members', () => {
    expect(guardsOf(StoreMemberController, 'findAll')).toEqual([
      StoreAccessGuard,
    ]);
  });

  it.each(['create', 'update', 'delete'])(
    'requires owner or manager to %s a member',
    (method) => {
      const handler = StoreMemberController.prototype[
        method as keyof StoreMemberController
      ] as object;

      expect(guardsOf(StoreMemberController, method)).toEqual([StoreRoleGuard]);
      expect(Reflect.getMetadata(REQUIRED_ROLES_KEY, handler)).toEqual([
        'owner',
        'manager',
      ]);
    },
  );
});
