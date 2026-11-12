import { Module } from '@nestjs/common';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { AuditLogsController } from './audit-logs.controller';

@Module({
  imports: [StoreGuardsModule],
  controllers: [AuditLogsController],
})
export class AuditLogsModule {}
