import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '../../../subscription/subscription.entity';
import { PlanFeatureGuard } from '../guards/plan-feature.guard';
import { Schedule } from '../schedule/schedule.entity';
import { WebhookDelivery } from './webhook-delivery.entity';
import { WebhookDispatchService } from './webhook-dispatch.service';
import { WebhookEndpoint } from './webhook-endpoint.entity';

/** Só o envio, sem guards: é o que a agenda importa, então não pode importá-la. */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      WebhookEndpoint,
      WebhookDelivery,
      Schedule,
      Subscription,
    ]),
  ],
  providers: [WebhookDispatchService, PlanFeatureGuard],
  exports: [WebhookDispatchService, TypeOrmModule],
})
export class WebhookDispatchModule {}
