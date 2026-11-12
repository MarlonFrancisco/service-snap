import { Module } from '@nestjs/common';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { WebhooksModule } from './webhooks/webhooks.module';

/**
 * Gestão da loja da Fase 4 (caixa, comissões, pacotes, fidelidade...). Fica num
 * módulo próprio para não disputar a lista de imports de `StoresModule`.
 */
@Module({
  imports: [AuditLogsModule, ApiKeysModule, WebhooksModule],
})
export class StoreManagementModule {}
