import { Module } from '@nestjs/common';
import { AuditLogsModule } from './audit-logs/audit-logs.module';

/**
 * Gestão da loja da Fase 4 (caixa, comissões, pacotes, fidelidade...). Fica num
 * módulo próprio para não disputar a lista de imports de `StoresModule`.
 */
@Module({
  imports: [AuditLogsModule],
})
export class StoreManagementModule {}
