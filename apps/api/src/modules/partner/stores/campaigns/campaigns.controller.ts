import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import {
  PlanFeatureGuard,
  RequiresPlanFeatures,
  RequireStoreRoles,
  StoreRoleGuard,
} from '../guards';
import { CampaignsService } from './campaigns.service';
import {
  CreateCampaignDto,
  InactiveCustomersQueryDto,
} from './dto/campaign.dto';

/** Campanha fala em nome da loja com a base toda: só dono e gerente. */
@Controller('partner/stores/:storeId')
@RequireStoreRoles('owner', 'manager')
// Campanhas a partir do Equipe; o opt-out do cliente fica aberto em todo plano
@UseGuards(StoreRoleGuard, PlanFeatureGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get('campaigns/inactive-customers')
  @RequiresPlanFeatures('CAMPAIGNS_ACCESS')
  inactiveCustomers(
    @Param('storeId') storeId: string,
    @Query() { days }: InactiveCustomersQueryDto,
  ) {
    return this.campaignsService.findInactiveCustomers(
      storeId,
      days ? Number(days) : undefined,
    );
  }

  @Get('campaigns')
  @RequiresPlanFeatures('CAMPAIGNS_ACCESS')
  list(@Param('storeId') storeId: string) {
    return this.campaignsService.list(storeId);
  }

  @Get('campaigns/:id')
  @RequiresPlanFeatures('CAMPAIGNS_ACCESS')
  findOne(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.campaignsService.findOne(storeId, id);
  }

  /** O canal WhatsApp pede mais o plano com WhatsApp: o serviço confere. */
  @Post('campaigns')
  @RequiresPlanFeatures('CAMPAIGNS_ACCESS')
  create(
    @Param('storeId') storeId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCampaignDto,
  ) {
    return this.campaignsService.create(storeId, dto, userId);
  }

  @Post('customers/:customerId/marketing-opt-out')
  optOut(
    @Param('storeId') storeId: string,
    @Param('customerId', ParseUUIDPipe) customerId: string,
  ) {
    return this.campaignsService.optOut(storeId, customerId);
  }

  @Delete('customers/:customerId/marketing-opt-out')
  optIn(
    @Param('storeId') storeId: string,
    @Param('customerId', ParseUUIDPipe) customerId: string,
  ) {
    return this.campaignsService.optIn(storeId, customerId);
  }
}
