import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../../../notification/notification.module';
import { PlanFeatureGuard } from '../guards';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { Store } from '../store.entity';
import { WhatsappModule } from '../whatsapp';
import {
  Campaign,
  CampaignRecipient,
  MarketingOptOut,
} from './campaign.entity';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { MarketingOptOutController } from './marketing-opt-out.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Campaign,
      CampaignRecipient,
      MarketingOptOut,
      Store,
    ]),
    StoreGuardsModule,
    WhatsappModule,
    NotificationModule,
  ],
  controllers: [CampaignsController, MarketingOptOutController],
  providers: [CampaignsService, PlanFeatureGuard],
})
export class CampaignsModule {}
