import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../../../users/users.module';
import { Store } from '../store.entity';
import { WhatsappConsentController } from './whatsapp-consent.controller';
import { WhatsappConsent } from './whatsapp-consent.entity';
import { WhatsappConsentService } from './whatsapp-consent.service';
import { WhatsappOptOutController } from './whatsapp-opt-out.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WhatsappConsent, Store]), UsersModule],
  controllers: [WhatsappConsentController, WhatsappOptOutController],
  providers: [WhatsappConsentService],
  exports: [WhatsappConsentService],
})
export class WhatsappConsentModule {}
