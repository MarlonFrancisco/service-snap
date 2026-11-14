import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit';
import { AuthModule } from './auth';
import { CacheModule } from './cache';
import { DatabaseModule } from './database';
import { HealthModule } from './health/health.module';
import { NotificationModule } from './notification';
import { PartnerRoutesGuard } from './partner/guards';
import { PartnerModule } from './partner/partner.module';
import { PlansModule } from './plans';
import { PrivacyModule } from './privacy/privacy.module';
import { PublicApiModule } from './public-api/public-api.module';
import { QueueModule } from './queue';
import { PushModule } from './push/push.module';
import { RecomendationModule } from './recomendation';
import { SearchModule } from './search';
import { StoreDiscoveryModule } from './store-discovery/store-discovery.module';
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
    AuditModule,
    QueueModule,
    CacheModule,
    AuthModule,
    DatabaseModule,
    SubscriptionModule,
    PlansModule,
    PushModule,
    UsersModule,
    NotificationModule,
    PartnerModule,
    SearchModule,
    StoreDiscoveryModule,
    RecomendationModule,
    UpstashSearchModule,
    WhatsappBotModule,
    PublicApiModule,
    PrivacyModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: PartnerRoutesGuard,
    },
  ],
})
export class AppModule {}
