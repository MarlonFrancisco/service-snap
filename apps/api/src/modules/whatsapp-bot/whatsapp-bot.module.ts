import { Module } from '@nestjs/common';
import { CategoryModule } from '../partner/stores/category';
import { ScheduleModule } from '../partner/stores/schedule';
import { StoreMemberModule } from '../partner/stores/store-member/store-member.module';
import { WhatsappModule } from '../partner/stores/whatsapp';
import { WhatsappBotController } from './whatsapp-bot.controller';
import { WhatsappBotService } from './whatsapp-bot.service';

@Module({
  imports: [WhatsappModule, CategoryModule, StoreMemberModule, ScheduleModule],
  controllers: [WhatsappBotController],
  providers: [WhatsappBotService],
})
export class WhatsappBotModule {}
