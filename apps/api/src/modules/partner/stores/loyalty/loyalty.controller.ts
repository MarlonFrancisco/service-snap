import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { RequireStoreRoles, StoreAccessGuard, StoreRoleGuard } from '../guards';
import { SaveLoyaltyProgramDto } from './dto/loyalty.dto';
import { LoyaltyService } from './loyalty.service';

/** A regra fica com dono e gerente; progresso e resgate, com a equipe. */
@Controller('partner/stores/:storeId')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('loyalty-program')
  @UseGuards(StoreAccessGuard)
  getProgram(@Param('storeId') storeId: string) {
    return this.loyaltyService.getProgram(storeId);
  }

  @Put('loyalty-program')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  saveProgram(
    @Param('storeId') storeId: string,
    @Body() dto: SaveLoyaltyProgramDto,
  ) {
    return this.loyaltyService.saveProgram(storeId, dto);
  }

  @Get('customers/:customerId/loyalty')
  @UseGuards(StoreAccessGuard)
  getProgress(
    @Param('storeId') storeId: string,
    @Param('customerId', ParseUUIDPipe) customerId: string,
  ) {
    return this.loyaltyService.getProgress(storeId, customerId);
  }

  /** Resgate fora do fechamento (ex.: brinde entregue no balcão). */
  @Post('loyalty-rewards/:id/redeem')
  @UseGuards(StoreAccessGuard)
  redeem(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.loyaltyService.redeemStandalone(storeId, id, userId);
  }
}
