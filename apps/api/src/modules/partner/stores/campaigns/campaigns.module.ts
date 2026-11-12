import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanFeatureGuard } from '../guards';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { Store } from '../store.entity';
import { WhatsappModule } from '../whatsapp';
import { CampaignQueueController } from './campaign-queue.controller';
import {
  Campaign,
  CampaignRecipient,
  MarketingOptOut,
} from './campaign.entity';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';

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
  ],
  controllers: [CampaignsController, CampaignQueueController],
  providers: [CampaignsService, PlanFeatureGuard],
})
export class CampaignsModule {}
