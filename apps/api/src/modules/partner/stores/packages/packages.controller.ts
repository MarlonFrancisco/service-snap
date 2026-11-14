import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { RequireStoreRoles, StoreAccessGuard, StoreRoleGuard } from '../guards';
import {
  CreateServicePackageDto,
  SellPackageDto,
  UpdateServicePackageDto,
} from './dto/package.dto';
import { PackagesService } from './packages.service';

/** Modelos ficam com dono e gerente; vender e consultar saldo, com a equipe. */
@Controller('partner/stores/:storeId')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get('packages')
  @UseGuards(StoreAccessGuard)
  list(@Param('storeId') storeId: string, @Query('active') active?: string) {
    return this.packagesService.list(storeId, active === 'true');
  }

  @Post('packages')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  create(
    @Param('storeId') storeId: string,
    @Body() dto: CreateServicePackageDto,
  ) {
    return this.packagesService.create(storeId, dto);
  }

  @Patch('packages/:id')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  update(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServicePackageDto,
  ) {
    return this.packagesService.update(storeId, id, dto);
  }

  @Post('packages/:id/sell')
  @UseGuards(StoreAccessGuard)
  sell(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: SellPackageDto,
  ) {
    return this.packagesService.sell(storeId, id, dto, userId);
  }

  @Get('customers/:customerId/packages')
  @UseGuards(StoreAccessGuard)
  listForCustomer(
    @Param('storeId') storeId: string,
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Query('usable') usable?: string,
  ) {
    return this.packagesService.listForCustomer(
      storeId,
      customerId,
      usable === 'true',
    );
  }

  @Post('customer-packages/:id/cancel')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  cancel(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.packagesService.cancelCustomerPackage(storeId, id);
  }
}
