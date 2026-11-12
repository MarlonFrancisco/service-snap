import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { CategoryModule } from '../partner/stores/category';
import { ScheduleModule } from '../partner/stores/schedule';
import { StoreMemberModule } from '../partner/stores/store-member/store-member.module';
import { WaitlistModule } from '../partner/stores/waitlist';
import { WhatsappModule } from '../partner/stores/whatsapp';
import { UsersModule } from '../users/users.module';
import { WhatsappBotController } from './whatsapp-bot.controller';
import { WhatsappBotService } from './whatsapp-bot.service';

@Module({
  imports: [
    WhatsappModule,
    CategoryModule,
    StoreMemberModule,
    ScheduleModule,
    UsersModule,
    NotificationModule,
    WaitlistModule,
  ],
  controllers: [WhatsappBotController],
  providers: [WhatsappBotService],
})
export class WhatsappBotModule {}
