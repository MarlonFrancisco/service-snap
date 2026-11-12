import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeysModule } from '../partner/stores/api-keys/api-keys.module';
import { Service } from '../partner/stores/category/service/service.entity';
import { ScheduleModule } from '../partner/stores/schedule';
import { Schedule } from '../partner/stores/schedule/schedule.entity';
import { StoreMember } from '../partner/stores/store-member/store-member.entity';
import { Store } from '../partner/stores/store.entity';
import { ApiKeyGuard } from './api-key.guard';
import { PublicApiController } from './public-api.controller';
import { PublicApiService } from './public-api.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, Service, StoreMember, Schedule]),
    ApiKeysModule,
    ScheduleModule,
  ],
  controllers: [PublicApiController],
  providers: [PublicApiService, ApiKeyGuard],
})
export class PublicApiModule {}
