import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import type { Cache } from 'cache-manager';

const PROBE_KEY = 'health:probe';
const PROBE_TTL_MS = 10_000;

/**
 * Grava e lê uma chave. O cliente do Redis engole erros de conexão (o cache
 * vira miss), então a única prova de que ele responde é ler de volta o que gravou.
 */
@Injectable()
export class CacheHealthIndicator {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);
    const value = String(Date.now());

    try {
      await this.cacheManager.set(PROBE_KEY, value, PROBE_TTL_MS);

      if ((await this.cacheManager.get<string>(PROBE_KEY)) !== value) {
        return indicator.down('Cache não devolveu o valor gravado');
      }

      return indicator.up();
    } catch (error) {
      return indicator.down((error as Error).message);
    }
  }
}
