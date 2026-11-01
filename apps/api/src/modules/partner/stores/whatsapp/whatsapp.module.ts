import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreAccessGuard } from '../guards';
import { Store } from '../store.entity';
import { StoreMemberModule } from '../store-member/store-member.module';
import { WhatsappConfig } from './whatsapp.entity';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsappConfig, Store]),
    StoreMemberModule,
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService, StoreAccessGuard],
  exports: [WhatsappService],
})
export class WhatsappModule {}
