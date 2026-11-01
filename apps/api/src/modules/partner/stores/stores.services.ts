import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindOptionsSelect, Repository } from 'typeorm';
import {
  availableToIndexStore,
  mountStoreSearchIndex,
} from '../../../utils/helpers/search.helpers';
import { SearchService } from '../../search/search.service';
import { isStoreDraft } from '../onboarding/onboarding.helpers';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import type { StoreMember } from './store-member/store-member.entity';
import { Store } from './store.entity';

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
  private readonly logger = new Logger(StoresService.name);

  constructor(
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
    private readonly searchService: SearchService,
  ) {}

  async create(storeDto: CreateStoreDto): Promise<Store> {
    const store = this.storesRepository.create(storeDto);
    const savedStore = await this.storesRepository.save(store);

    return {
      ...savedStore,
      gallery: [],
      storeMembers: [],
      services: [],
      schedules: [],
    };
  }

  async findAll(
    userId: string,
    config: { relations?: string[] } = {},
  ): Promise<Store[]> {
    return this.storesRepository.find({
      where: { owner: { id: userId } },
      relations: config.relations,
    });
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
      const store = await this.findOne(id, { relations: ['onboarding'] });

      // Só `OnboardingService.complete` publica um rascunho, depois de checar
      // serviço e profissional.
      if (isStoreDraft(store)) {
        throw new BadRequestException(
          'Conclua a preparação do espaço antes de ativá-lo',
        );
      }
    }

    await this.storesRepository.update(id, storeDto);

    void this.syncSearchIndex(id);

    return storeDto;
  }

  /**
   * Coloca ou tira a loja da busca conforme o estado atual. Nunca rejeita: uma
   * falha no índice não pode desfazer a ação do parceiro.
   */
  async syncSearchIndex(id: string): Promise<void> {
    try {
      const store = await this.findOne(id, {
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
      });

      if (availableToIndexStore(store)) {
        const { content, metadata } = mountStoreSearchIndex(store);

        await this.searchService.indexStore(id, content, metadata);
      } else {
        await this.searchService.deleteStoreIndex(id);
      }
    } catch (error) {
      this.logger.error(`Failed to sync search index for store ${id}:`, error);
    }
  }

  async delete(id: string): Promise<void> {
    void this.searchService.deleteStoreIndex(id);
    await this.storesRepository.delete(id);
  }

  async getActiveStores(userId: string): Promise<Store[]> {
    return this.storesRepository.find({
      where: { owner: { id: userId }, isActive: true },
      relations: ['storeMembers'],
    });
  }
}
