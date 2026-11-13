import { Module } from '@nestjs/common';
import { NotificationModule } from '../../../notification/notification.module';
import { UsersModule } from '../../../users/users.module';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { TeamController } from './team.controller';

@Module({
  imports: [StoreGuardsModule, NotificationModule, UsersModule],
  controllers: [TeamController],
})
export class TeamModule {}
