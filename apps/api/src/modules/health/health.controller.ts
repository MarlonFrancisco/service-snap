import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { CacheHealthIndicator } from './cache.health';
import { DatabaseHealthIndicator } from './database.health';

/** Curto: um banco travado deve aparecer como fora do ar, não segurar a resposta. */
const DATABASE_TIMEOUT_MS = 1500;

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: DatabaseHealthIndicator,
    private readonly cache: CacheHealthIndicator,
  ) {}

  /** 200 com tudo de pé; 503 se o banco ou o cache não responderem. */
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.database.pingCheck('database', DATABASE_TIMEOUT_MS),
      () => this.cache.isHealthy('cache'),
    ]);
  }
}
