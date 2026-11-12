import { Module } from '@nestjs/common';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { CashModule } from './cash/cash.module';
import { CheckoutModule } from './checkout/checkout.module';
import { CommissionsModule } from './commissions/commissions.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { PackagesModule } from './packages/packages.module';
import { ScheduleSeriesModule } from './schedule-series/schedule-series.module';
import { WebhooksModule } from './webhooks/webhooks.module';

/**
 * Gestão da loja da Fase 4 (caixa, comissões, pacotes, fidelidade...). Fica num
 * módulo próprio para não disputar a lista de imports de `StoresModule`.
 */
@Module({
  imports: [
    AuditLogsModule,
    ApiKeysModule,
    WebhooksModule,
    CashModule,
    PackagesModule,
    LoyaltyModule,
    CheckoutModule,
    CommissionsModule,
    ScheduleSeriesModule,
  ],
})
export class StoreManagementModule {}
