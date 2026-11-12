import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { RequireStoreRoles, StoreRoleGuard } from '../guards';
import {
  CreateWebhookEndpointDto,
  UpdateWebhookEndpointDto,
} from './dto/webhook-endpoint.dto';
import { WebhooksService } from './webhooks.service';

/** Webhook manda dados de clientes para fora: só dono e gerente configuram. */
@Controller('partner/stores/:storeId/webhooks')
@RequireStoreRoles('owner', 'manager')
@UseGuards(StoreRoleGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  list(@Param('storeId') storeId: string) {
    return this.webhooksService.list(storeId);
  }

  @Post()
  create(
    @Param('storeId') storeId: string,
    @Body() dto: CreateWebhookEndpointDto,
  ) {
    return this.webhooksService.create(storeId, dto);
  }

  @Patch(':id')
  update(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWebhookEndpointDto,
  ) {
    return this.webhooksService.update(storeId, id, dto);
  }

  @Delete(':id')
  remove(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.webhooksService.remove(storeId, id);
  }

  @Get(':id/secret')
  revealSecret(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.webhooksService.revealSecret(storeId, id, userId);
  }

  @Post(':id/secret/rotate')
  rotateSecret(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.webhooksService.rotateSecret(storeId, id);
  }

  @Post(':id/test')
  ping(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.webhooksService.ping(storeId, id);
  }

  @Get(':id/deliveries')
  listDeliveries(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.webhooksService.listDeliveries(storeId, id);
  }

  @Post(':id/deliveries/:deliveryId/retry')
  redeliver(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('deliveryId', ParseUUIDPipe) deliveryId: string,
  ) {
    return this.webhooksService.redeliver(storeId, id, deliveryId);
  }
}
