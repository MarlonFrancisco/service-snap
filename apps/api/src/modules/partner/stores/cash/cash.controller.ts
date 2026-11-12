import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { RequireStoreRoles, StoreAccessGuard, StoreRoleGuard } from '../guards';
import { CashService } from './cash.service';
import {
  CloseCashSessionDto,
  OpenCashSessionDto,
  PaymentQueryDto,
  RegisterPaymentDto,
  VoidPaymentDto,
} from './dto/cash.dto';
import { PaymentsService } from './payments.service';

/**
 * Caixa e pagamentos. Qualquer pessoa da equipe registra o que recebeu; abrir,
 * fechar, estornar e ver o histórico fica com dono e gerente.
 */
@Controller('partner/stores/:storeId')
export class CashController {
  constructor(
    private readonly cashService: CashService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Get('cash-sessions/current')
  @UseGuards(StoreAccessGuard)
  current(@Param('storeId') storeId: string) {
    return this.cashService.current(storeId);
  }

  @Get('cash-sessions')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  list(@Param('storeId') storeId: string, @Query('page') page?: string) {
    return this.cashService.list(storeId, Number(page));
  }

  @Get('cash-sessions/:id')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  findOne(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.cashService.findOne(storeId, id);
  }

  @Post('cash-sessions')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  open(
    @Param('storeId') storeId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: OpenCashSessionDto,
  ) {
    return this.cashService.open(storeId, dto, userId);
  }

  @Post('cash-sessions/:id/close')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  close(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CloseCashSessionDto,
  ) {
    return this.cashService.close(storeId, id, dto, userId);
  }

  @Get('payments')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  listPayments(
    @Param('storeId') storeId: string,
    @Query() query: PaymentQueryDto,
  ) {
    return this.paymentsService.list(storeId, query);
  }

  @Post('payments')
  @UseGuards(StoreAccessGuard)
  registerPayment(
    @Param('storeId') storeId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: RegisterPaymentDto,
  ) {
    return this.paymentsService.register(storeId, dto, userId);
  }

  @Post('payments/:id/void')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  voidPayment(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() { reason }: VoidPaymentDto,
  ) {
    return this.paymentsService.void(storeId, id, reason, userId);
  }
}
