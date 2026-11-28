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
import { TeamController } from '../team/team.controller';
import { ApiKeysController } from '../api-keys/api-keys.controller';
import { AuditLogsController } from '../audit-logs/audit-logs.controller';
import { CampaignsController } from '../campaigns/campaigns.controller';
import { CommissionsController } from '../commissions/commissions.controller';
import { LoyaltyController } from '../loyalty/loyalty.controller';
import { WebhooksController } from '../webhooks/webhooks.controller';
import { PLAN_FEATURES_KEY, PlanFeatureGuard } from './plan-feature.guard';
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

const planFeaturesOf = (controller: TController, method: string) =>
  Reflect.getMetadata(
    PLAN_FEATURES_KEY,
    controller.prototype[method as never] as object,
  ) ?? Reflect.getMetadata(PLAN_FEATURES_KEY, controller);

describe('partner store routes', () => {
  // Matriz de acesso por plano: a flag e o guard em todas as rotas do módulo
  it.each([
    [CommissionsController, 'COMMISSIONS_ACCESS'],
    [AuditLogsController, 'AUDIT_LOG_ACCESS'],
    [LoyaltyController, 'LOYALTY_ACCESS'],
    [ApiKeysController, 'API_ACCESS'],
    [WebhooksController, 'API_ACCESS'],
  ])('%o requires %s on every route', (controller, flag) => {
    for (const method of methodsOf(controller)) {
      const guards = guardsOf(controller, method);

      expect(guards, method).toContain(PlanFeatureGuard);
      // O plano só é lido depois do acesso à loja
      expect(guards.indexOf(PlanFeatureGuard), method).toBeGreaterThan(0);
      expect(planFeaturesOf(controller, method), method).toEqual([flag]);
    }
  });

  it('keeps the customer marketing opt-out open on every plan', () => {
    expect(planFeaturesOf(CampaignsController, 'optOut')).toBeUndefined();
    expect(planFeaturesOf(CampaignsController, 'optIn')).toBeUndefined();
    for (const method of ['inactiveCustomers', 'list', 'findOne', 'create']) {
      expect(guardsOf(CampaignsController, method)).toContain(PlanFeatureGuard);
      expect(planFeaturesOf(CampaignsController, method), method).toEqual([
        'CAMPAIGNS_ACCESS',
      ]);
    }
  });

  it.each([
    [CategoryController],
    [ServiceController],
    [GalleryController],
    [BlockedTimeController],
  ])('%o requires store access on every route', (controller) => {
    for (const method of methodsOf(controller)) {
      expect(guardsOf(controller, method), method).toContain(StoreAccessGuard);
    }
  });

  // Gestão da loja: o papel vem no controller inteiro
  it.each([
    [NotificationsHistoryController],
    [NotificationsSettingsController],
    [MetricsController],
  ])('%o requires owner or manager on every route', (controller) => {
    for (const method of methodsOf(controller)) {
      expect(guardsOf(controller, method), method).toContain(StoreRoleGuard);
    }
    expect(Reflect.getMetadata(REQUIRED_ROLES_KEY, controller)).toEqual([
      'owner',
      'manager',
    ]);
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

  // Entrar na equipe fica em `TeamController`, que manda o convite
  it.each([
    [TeamController, 'create'],
    [StoreMemberController, 'update'],
    [StoreMemberController, 'delete'],
  ] as const)(
    '%o requires owner or manager to %s a member',
    (controller, method) => {
      const handler = controller.prototype[method as never] as object;

      expect(guardsOf(controller, method)).toEqual([StoreRoleGuard]);
      expect(Reflect.getMetadata(REQUIRED_ROLES_KEY, handler)).toEqual([
        'owner',
        'manager',
      ]);
    },
  );
});
