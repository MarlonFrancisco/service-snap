import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AuditLogQueryDto } from '../audit/dto/audit-log-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { AdminListQueryDto, AdminUpdateStoreDto } from './dto/admin.dto';
import { PlatformAdminGuard } from './platform-admin.guard';

/** Painel da plataforma (equipe do ServiceSnap), fora de /partner. */
@Controller('admin')
@UseGuards(JwtAuthGuard, PlatformAdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly auditService: AuditService,
  ) {}

  @Get('overview')
  overview() {
    return this.adminService.overview();
  }

  @Get('stores')
  listStores(@Query() query: AdminListQueryDto) {
    return this.adminService.listStores(query);
  }

  @Get('stores/:id')
  getStore(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getStore(id);
  }

  @Patch('stores/:id')
  updateStore(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateStoreDto,
  ) {
    return this.adminService.updateStore(id, dto);
  }

  @Get('users')
  listUsers(@Query() query: AdminListQueryDto) {
    return this.adminService.listUsers(query);
  }

  /** Auditoria de todas as lojas; `storeId` filtra uma. */
  @Get('audit-logs')
  auditLogs(@Query() query: AuditLogQueryDto) {
    return this.auditService.list(null, query);
  }
}
