import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindOptionsSelect, Repository } from 'typeorm';
import { isStoreDraft } from '../onboarding/onboarding.helpers';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreSearchSyncService } from './search-sync/store-search-sync.service';
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
  constructor(
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
    private readonly storeSearchSync: StoreSearchSyncService,
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

    await this.syncSearchIndex(id);

    return storeDto;
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
