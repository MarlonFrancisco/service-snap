import {
  BadRequestException,
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
import { isUUID } from 'class-validator';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { RequireStoreRoles, StoreAccessGuard, StoreRoleGuard } from '../guards';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/checkout.dto';

/** Quem atende fecha; desfazer mexe no caixa, então fica com dono e gerente. */
@Controller('partner/stores/:storeId/checkouts')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  /** `?scheduleIds=a,b`: atendimentos da visita, pacote e recompensas. */
  @Get('preview')
  @UseGuards(StoreAccessGuard)
  preview(
    @Param('storeId') storeId: string,
    @Query('scheduleIds') scheduleIds = '',
  ) {
    const ids = scheduleIds.split(',').filter(Boolean);

    if (!ids.length || !ids.every((id) => isUUID(id))) {
      throw new BadRequestException('scheduleIds must be a list of UUIDs');
    }

    return this.checkoutService.preview(storeId, ids);
  }

  @Post()
  @UseGuards(StoreAccessGuard)
  create(
    @Param('storeId') storeId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.checkoutService.create(storeId, dto, userId);
  }

  @Get(':id')
  @UseGuards(StoreAccessGuard)
  findOne(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.checkoutService.findOne(storeId, id);
  }

  @Delete(':id')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  undo(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.checkoutService.undo(storeId, id, userId);
  }
}
