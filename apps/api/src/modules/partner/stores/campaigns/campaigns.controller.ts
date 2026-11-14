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
import { RequireStoreRoles, StoreRoleGuard } from '../guards';
import { CampaignsService } from './campaigns.service';
import {
  CreateCampaignDto,
  InactiveCustomersQueryDto,
} from './dto/campaign.dto';

/** Campanha fala em nome da loja com a base toda: só dono e gerente. */
@Controller('partner/stores/:storeId')
@RequireStoreRoles('owner', 'manager')
@UseGuards(StoreRoleGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get('campaigns/inactive-customers')
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
  list(@Param('storeId') storeId: string) {
    return this.campaignsService.list(storeId);
  }

  @Get('campaigns/:id')
  findOne(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.campaignsService.findOne(storeId, id);
  }

  /** O plano só pesa no WhatsApp: o serviço confere conforme o canal. */
  @Post('campaigns')
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
