import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { DataSource } from 'typeorm';
import { withTimeout } from './health.helpers';

/**
 * `SELECT 1` no banco. Substitui o `TypeOrmHealthIndicator` do terminus, que
 * procura o pacote `typeorm` em tempo de execução: no pacote da Vercel essa busca
 * falha e o Nest derruba a função inteira na inicialização.
 */
@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly dataSource: DataSource,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async pingCheck(key: string, timeoutMs: number) {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await withTimeout(this.dataSource.query('SELECT 1'), timeoutMs);

      return indicator.up();
    } catch (error) {
      return indicator.down((error as Error).message);
    }
  }
}
