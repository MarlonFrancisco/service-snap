import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { RequireStoreRoles, StoreAccessGuard, StoreRoleGuard } from '../guards';
import type { StoreMember } from '../store-member/store-member.entity';
import { CommissionsService } from './commissions.service';
import {
  CommissionReportQueryDto,
  CreateCommissionRuleDto,
} from './dto/commission.dto';

@Controller('partner/stores/:storeId/commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Get('rules')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  listRules(@Param('storeId') storeId: string) {
    return this.commissionsService.listRules(storeId);
  }

  @Post('rules')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  createRule(
    @Param('storeId') storeId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCommissionRuleDto,
  ) {
    return this.commissionsService.createRule(storeId, dto, userId);
  }

  @Delete('rules/:id')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  deleteRule(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.commissionsService.deleteRule(storeId, id);
  }

  /** Relatório da equipe toda, ou de um profissional com `storeMemberId`. */
  @Get('report')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  report(
    @Param('storeId') storeId: string,
    @Query() query: CommissionReportQueryDto,
  ) {
    return this.commissionsService.report(storeId, query);
  }

  /** O profissional vê só a própria comissão. */
  @Get('me')
  @UseGuards(StoreAccessGuard)
  myReport(
    @Param('storeId') storeId: string,
    @Query() query: CommissionReportQueryDto,
    @Req() request: { storeMember?: StoreMember },
  ) {
    if (!request.storeMember) {
      throw new ForbiddenException('Only store members have commissions');
    }

    return this.commissionsService.report(storeId, {
      ...query,
      storeMemberId: request.storeMember.id,
    });
  }
}
