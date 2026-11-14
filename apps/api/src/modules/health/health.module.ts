import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { CacheHealthIndicator } from './cache.health';
import { DatabaseHealthIndicator } from './database.health';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [CacheHealthIndicator, DatabaseHealthIndicator],
})
export class HealthModule {}
