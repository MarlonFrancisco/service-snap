import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import type { TSearchHit } from '../../utils/helpers/search-relevance.helpers';
import { ScheduleService } from '../partner/stores/schedule/schedule.service';
import { SearchService } from '../search/search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import {
  getShortestServiceId,
  getStoreToday,
  toSearchFilters,
} from './store-discovery.helpers';

/**
 * Cada loja custa algumas consultas à agenda: só as primeiras do ranking são
 * checadas, em lotes, e a resposta fica guardada por pouco tempo.
 */
const AVAILABILITY_CHECK_LIMIT = 30;
const AVAILABILITY_BATCH_SIZE = 5;
const AVAILABILITY_CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class StoreDiscoveryService {
  private readonly logger = new Logger(StoreDiscoveryService.name);

  constructor(
    private readonly searchService: SearchService,
    private readonly scheduleService: ScheduleService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async search(dto: SearchQueryDto): Promise<TSearchHit[]> {
    const hits = await this.searchService.search(dto.query ?? '', {
      location: dto.location,
      category: dto.category,
      ...toSearchFilters(dto),
    });

    if (dto.availableToday !== 'true') return hits;

    return this.keepAvailableToday(hits.slice(0, AVAILABILITY_CHECK_LIMIT));
  }

  /** Mantém a ordem do ranking; lojas sem horário livre hoje saem. */
  private async keepAvailableToday(hits: TSearchHit[]): Promise<TSearchHit[]> {
    const available: boolean[] = [];

    for (let index = 0; index < hits.length; index += AVAILABILITY_BATCH_SIZE) {
      const batch = hits.slice(index, index + AVAILABILITY_BATCH_SIZE);
      available.push(
        ...(await Promise.all(batch.map((hit) => this.hasSlotToday(hit)))),
      );
    }

    return hits.filter((_, index) => available[index]);
  }

  private async hasSlotToday(hit: TSearchHit): Promise<boolean> {
    const serviceId = getShortestServiceId(hit);

    if (!serviceId) return false;

    const today = getStoreToday(hit);
    const cacheKey = `search:available-today:${hit.id}:${today}`;
    const cached = await this.readCache(cacheKey);

    if (cached !== undefined) return cached;

    let hasSlot = false;

    try {
      const slots = await this.scheduleService.getAvailability(hit.id, {
        date: today,
        serviceIds: serviceId,
      });
      hasSlot = slots.some((slot) => slot.available);
    } catch (error) {
      // Loja que saiu do ar ou serviço removido desde a indexação: sem vaga
      this.logger.warn(
        `Disponibilidade de hoje indisponível para a loja ${hit.id}: ${(error as Error).message}`,
      );
    }

    await this.writeCache(cacheKey, hasSlot);

    return hasSlot;
  }

  /** Cache fora do ar não pode derrubar a busca: vira consulta direta. */
  private async readCache(key: string): Promise<boolean | undefined> {
    try {
      return (await this.cacheManager.get<boolean>(key)) ?? undefined;
    } catch {
      return undefined;
    }
  }

  private async writeCache(key: string, value: boolean) {
    try {
      await this.cacheManager.set(key, value, AVAILABILITY_CACHE_TTL_MS);
    } catch {
      // Sem cache, a próxima busca consulta a agenda de novo
    }
  }
}
