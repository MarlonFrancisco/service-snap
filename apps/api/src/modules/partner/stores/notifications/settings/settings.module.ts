import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanFeatureGuard } from '../../guards';
import { StoreGuardsModule } from '../../guards/store-guards.module';
import { WhatsappModule } from '../../whatsapp';
import { WhatsappConfig } from '../../whatsapp/whatsapp.entity';
import { NotificationsSettingsController } from './settings.controller';
import { NotificationsSettings } from './settings.entity';
import { NotificationsSettingsService } from './settings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationsSettings, WhatsappConfig]),
    StoreGuardsModule,
    WhatsappModule,
  ],
  controllers: [NotificationsSettingsController],
  providers: [NotificationsSettingsService, PlanFeatureGuard],
  exports: [NotificationsSettingsService],
})
export class NotificationsSettingsModule {}
