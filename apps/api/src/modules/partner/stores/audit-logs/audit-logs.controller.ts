import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditService } from '../../../audit/audit.service';
import { AuditLogQueryDto } from '../../../audit/dto/audit-log-query.dto';
import { RequireStoreRoles, StoreRoleGuard } from '../guards';

/** Quem fez o quê na loja. Só dono e gerente: inclui ações da equipe toda. */
@Controller('partner/stores/:storeId/audit-logs')
@RequireStoreRoles('owner', 'manager')
@UseGuards(StoreRoleGuard)
export class AuditLogsController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  list(@Param('storeId') storeId: string, @Query() query: AuditLogQueryDto) {
    return this.auditService.list(storeId, query);
  }
}
