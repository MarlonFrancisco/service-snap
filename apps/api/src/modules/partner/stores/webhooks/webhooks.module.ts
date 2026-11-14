import { Module } from '@nestjs/common';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { WebhookDispatchModule } from './webhook-dispatch.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [WebhookDispatchModule, StoreGuardsModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
