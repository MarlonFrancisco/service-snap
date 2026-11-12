import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  type FindOptionsSelect,
  In,
  MoreThanOrEqual,
  type Repository,
} from 'typeorm';
import { Subscription } from '../../subscription/subscription.entity';
import { isStoreDraft } from '../onboarding/onboarding.helpers';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreSearchSyncService } from './search-sync/store-search-sync.service';
import { StoreMember } from './store-member/store-member.entity';
import { Store } from './store.entity';
import type { TStoreWithRole } from './stores.types';

/**
 * Lista do que sai na rota pública, para coluna nova em `User` não vazar sozinha:
 * ali estão e-mail, telefone e o código de login (`authCode`).
 */
const toPublicStoreMember = ({
  id,
  role,
  isActive,
  services,
  blockedTimes,
  user,
}: StoreMember) => ({
  id,
  role,
  isActive,
  services,
  blockedTimes,
  // O `BookingFormSchema` do web exige `schedules` e `user.id`: sem eles, confirmar
  // a reserva falha sem aviso. A lista vai vazia porque agendamentos têm dados de clientes.
  schedules: [],
  user: { id: user?.id, firstName: user?.firstName, lastName: user?.lastName },
});

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
    private readonly storeSearchSync: StoreSearchSyncService,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async create(storeDto: CreateStoreDto, ownerId: string): Promise<Store> {
    if (storeDto.isActive) {
      await this.assertWithinStoreLimit(ownerId);
    }

    const store = this.storesRepository.create({
      ...storeDto,
      owner: { id: ownerId },
    });
    const savedStore = await this.storesRepository.save(store);

    return {
      ...savedStore,
      gallery: [],
      storeMembers: [],
      services: [],
      schedules: [],
    };
  }

  /**
   * Lojas do painel: as próprias e aquelas em que a pessoa está ativa na equipe.
   * A equipe entra sem assinatura própria: o plano que vale é o do dono.
   */
  async findAll(
    userId: string,
    config: { relations?: string[] } = {},
  ): Promise<TStoreWithRole[]> {
    const relations = config.relations ?? [];
    const [owned, memberships] = await Promise.all([
      this.storesRepository.find({
        where: { owner: { id: userId } },
        relations,
      }),
      this.storesRepository.manager.find(StoreMember, {
        where: {
          user: { id: userId },
          isActive: true,
          isDeleted: false,
          store: { isDeleted: false },
        },
        relations: ['store', ...relations.map((name) => `store.${name}`)],
      }),
    ]);
    const ownedIds = new Set(owned.map(({ id }) => id));

    return [
      ...owned.map((store) => ({ ...store, memberRole: 'owner' as const })),
      ...memberships
        .filter(({ store }) => store && !ownedIds.has(store.id))
        .map(({ store, role }) => ({ ...store, memberRole: role })),
    ] as TStoreWithRole[];
  }

  async findOne(
    id: string,
    config: {
      ownerId?: string;
      relations?: string[];
      select?: FindOptionsSelect<Store>;
    } = {},
  ): Promise<Store> {
    const store = await this.storesRepository.findOne({
      where: { id, owner: { id: config.ownerId } },
      relations: config.relations,
      select: config.select,
      relationLoadStrategy: 'query',
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  /** Mesma leitura de `findOne`, mas um rascunho do assistente não existe aqui. */
  async findOnePublic(id: string, relations: string[]): Promise<Store> {
    const { onboarding, ...store } = await this.findOne(id, {
      relations: [...relations, 'onboarding'],
    });

    if (isStoreDraft({ onboarding })) {
      throw new NotFoundException('Store not found');
    }

    return {
      ...store,
      storeMembers: store.storeMembers?.map(toPublicStoreMember),
    } as Store;
  }

  async update(id: string, storeDto: UpdateStoreDto): Promise<UpdateStoreDto> {
    if (storeDto.isActive) {
      const store = await this.findOne(id, {
        relations: ['onboarding', 'owner'],
      });

      // Só `OnboardingService.complete` publica um rascunho, depois de checar
      // serviço e profissional.
      if (isStoreDraft(store)) {
        throw new BadRequestException(
          'Conclua a preparação do espaço antes de ativá-lo',
        );
      }

      if (!store.isActive) {
        await this.assertWithinStoreLimit(store.owner.id);
      }
    }

    await this.storesRepository.update(id, storeDto);

    await this.syncSearchIndex(id);

    return storeDto;
  }

  /**
   * Conta só lojas ativas, como o painel. `UNIT_LIMIT` 0 (ou "UNLIMITED", que vira
   * nulo) é ilimitado, igual a `StoreMemberService.getProfessionalUsage`.
   */
  private async assertWithinStoreLimit(ownerId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        user: { id: ownerId },
        status: In(['active', 'paid', 'trialing']),
        currentPeriodEnd: MoreThanOrEqual(new Date()),
      },
    });

    // Sem assinatura não há plano: o 0 de "ilimitado" só vale para quem tem um
    if (!subscription) {
      throw new ForbiddenException(
        'É preciso uma assinatura ativa para ativar uma loja.',
      );
    }

    const limit = subscription.features?.UNIT_LIMIT ?? 0;

    if (!limit) {
      return;
    }

    const count = await this.storesRepository.count({
      where: { owner: { id: ownerId }, isActive: true, isDeleted: false },
    });

    if (count >= limit) {
      throw new ForbiddenException(
        `Limite de lojas do plano atingido (${count}/${limit}). Faça upgrade para ativar mais.`,
      );
    }
  }

  /** Ver `StoreSearchSyncService.sync`: nunca rejeita. */
  async syncSearchIndex(id: string): Promise<void> {
    await this.storeSearchSync.sync(id);
  }

  async delete(id: string): Promise<void> {
    // Só depois do banco: se a exclusão falhar, a loja continua existindo e na busca.
    await this.storesRepository.delete(id);
    await this.storeSearchSync.remove(id);
  }

  async getActiveStores(userId: string): Promise<Store[]> {
    return this.storesRepository.find({
      where: { owner: { id: userId }, isActive: true },
      relations: ['storeMembers'],
    });
  }
}
