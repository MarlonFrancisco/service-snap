import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from '../schedule/schedule.entity';
import { WebhookDelivery } from './webhook-delivery.entity';
import { WebhookDispatchService } from './webhook-dispatch.service';
import { WebhookEndpoint } from './webhook-endpoint.entity';

/** Só o envio, sem guards: é o que a agenda importa, então não pode importá-la. */
@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookEndpoint, WebhookDelivery, Schedule]),
  ],
  providers: [WebhookDispatchService],
  exports: [WebhookDispatchService, TypeOrmModule],
})
export class WebhookDispatchModule {}
