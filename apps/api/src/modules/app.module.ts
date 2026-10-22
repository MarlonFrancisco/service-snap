import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from './auth';
import { CacheModule } from './cache';
import { DatabaseModule } from './database';
import { HealthModule } from './health/health.module';
import { NotificationModule } from './notification';
import { PartnerRoutesGuard } from './partner/guards';
import { PartnerModule } from './partner/partner.module';
import { PlansModule } from './plans';
import { RecomendationModule } from './recomendation';
import { SearchModule } from './search';
import { SubscriptionModule } from './subscription';
import { UpstashSearchModule } from './upstash-search';
import { UsersModule } from './users';
import { WhatsappBotModule } from './whatsapp-bot';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    HealthModule,
    CacheModule,
    AuthModule,
    DatabaseModule,
    SubscriptionModule,
    PlansModule,
    UsersModule,
    NotificationModule,
    PartnerModule,
    SearchModule,
    RecomendationModule,
    UpstashSearchModule,
    WhatsappBotModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: PartnerRoutesGuard,
    },
  ],
})
export class AppModule {}
