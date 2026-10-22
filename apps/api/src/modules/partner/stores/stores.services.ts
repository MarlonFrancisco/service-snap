import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindOptionsSelect, Repository } from 'typeorm';
import {
  availableToIndexStore,
  mountStoreSearchIndex,
} from '../../../utils/helpers/search.helpers';
import { SearchService } from '../../search/search.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Store } from './store.entity';

@Injectable()
export class StoresService {
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

  async update(id: string, storeDto: UpdateStoreDto): Promise<UpdateStoreDto> {
    await this.storesRepository.update(id, storeDto);

    void this.findOne(id, {
      relations: [
        'gallery',
        'storeMembers',
        'services',
        'reviews',
        'owner',
        'categories',
      ],
    }).then((store) => {
      if (availableToIndexStore(store)) {
        const { content, metadata } = mountStoreSearchIndex(store);

        void this.searchService.indexStore(id, content, metadata);
      } else {
        void this.searchService.deleteStoreIndex(id);
      }
    });

    return storeDto;
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
