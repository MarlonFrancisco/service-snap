import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreGuardsModule } from '../../guards/store-guards.module';
import { NotificationsSettingsController } from './settings.controller';
import { NotificationsSettings } from './settings.entity';
import { NotificationsSettingsService } from './settings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationsSettings]),
    StoreGuardsModule,
  ],
  controllers: [NotificationsSettingsController],
  providers: [NotificationsSettingsService],
  exports: [NotificationsSettingsService],
})
export class NotificationsSettingsModule {}
