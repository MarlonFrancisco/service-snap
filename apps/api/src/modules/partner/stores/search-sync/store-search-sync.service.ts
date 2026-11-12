import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, type Repository } from 'typeorm';
import {
  availableToIndexStore,
  mountStoreSearchIndex,
  toRankTier,
} from '../../../../utils/helpers/search.helpers';
import { SearchService } from '../../../search/search.service';
import { Subscription } from '../../../subscription/subscription.entity';
import { Store } from '../store.entity';

/**
 * Fica fora do `StoresService` para que serviços, categorias e membros, que o
 * `StoresModule` importa, possam ressincronizar a loja sem dependência circular.
 */
@Injectable()
export class StoreSearchSyncService {
  private readonly logger = new Logger(StoreSearchSyncService.name);

  constructor(
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly searchService: SearchService,
  ) {}

  /**
   * Coloca ou tira a loja da busca conforme o estado atual. Nunca rejeita: uma
   * falha no índice não pode desfazer a ação do parceiro.
   */
  async sync(id: string): Promise<void> {
    try {
      const store = await this.storesRepository.findOne({
        where: { id },
        relations: [
          'gallery',
          'storeMembers',
          'storeMembers.services',
          'services',
          'reviews',
          'owner',
          'categories',
          'onboarding',
        ],
        relationLoadStrategy: 'query',
      });

      if (store && availableToIndexStore(store)) {
        const { content, metadata } = mountStoreSearchIndex(
          store,
          await this.getOwnerRankTier(store.owner.id),
        );

        await this.searchService.indexStore(id, content, metadata);
      } else {
        await this.searchService.deleteStoreIndex(id);
      }
    } catch (error) {
      this.logger.error(`Failed to sync search index for store ${id}:`, error);
    }
  }

  /** Plano mudou (assinou, trocou, venceu): a posição de todas as lojas do dono muda junto. */
  async syncOwnerStores(ownerId: string): Promise<void> {
    try {
      const stores = await this.storesRepository.find({
        where: { owner: { id: ownerId } },
        select: { id: true },
      });

      for (const { id } of stores) await this.sync(id);
    } catch (error) {
      this.logger.error(`Failed to sync stores of owner ${ownerId}:`, error);
    }
  }

  /** Para a loja que já saiu do banco. Também nunca rejeita. */
  async remove(id: string): Promise<void> {
    try {
      await this.searchService.deleteStoreIndex(id);
    } catch (error) {
      this.logger.error(`Failed to remove store ${id} from index:`, error);
    }
  }

  /** Mesmo critério de plano ativo dos limites e do `PlanFeatureGuard`. */
  private async getOwnerRankTier(ownerId: string): Promise<number> {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        user: { id: ownerId },
        status: In(['active', 'paid', 'trialing']),
        currentPeriodEnd: MoreThanOrEqual(new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    return toRankTier(subscription);
  }
}
