import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import type { PaginationQueryDto } from '../../../../../utils/dto/pagination.dto';
import { toPage, toSkipTake } from '../../../../../utils/helpers/pagination.helpers';
import type { TPage } from '../../../../../utils/helpers/pagination.types';
import { StoreSearchSyncService } from '../../search-sync/store-search-sync.service';
import { Category } from '../category.entity';
import { ServiceDto } from './service.dto';
import { Service } from './service.entity';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly storeSearchSync: StoreSearchSyncService,
  ) {}

  async create(service: ServiceDto): Promise<Service> {
    await this.assertCategoryInStore(service);

    // Com `id` no corpo, o save sobrescreveria um serviço existente
    const created = await this.serviceRepository.save({
      ...service,
      id: undefined,
    });

    await this.storeSearchSync.sync(service.store.id);

    return created;
  }

  /** Com `page`, uma página em ordem de nome (e busca pelo nome); sem, a lista inteira. */
  async findAll(
    storeId: string,
    { page, limit, search }: PaginationQueryDto = {},
  ): Promise<Service[] | TPage<Service>> {
    if (!page) {
      return this.serviceRepository.find({ where: { store: { id: storeId } } });
    }

    const { skip, take } = toSkipTake(page, limit);
    const [services, total] = await this.serviceRepository.findAndCount({
      where: {
        store: { id: storeId },
        ...(search && { name: ILike(`%${search.trim()}%`) }),
      },
      relations: ['category'],
      order: { name: 'ASC' },
      skip,
      take,
    });

    return toPage(services, total, page, take);
  }

  async findOne(id: string): Promise<Service> {
    return this.serviceRepository.findOne({ where: { id } });
  }

  async findOneInStore(storeId: string, id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id, store: { id: storeId } },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async update(service: ServiceDto): Promise<ServiceDto> {
    await this.assertCategoryInStore(service);

    const result = await this.serviceRepository.update(
      { id: service.id, store: { id: service.store.id } },
      service,
    );

    if (!result.affected) {
      throw new NotFoundException('Service not found');
    }

    await this.storeSearchSync.sync(service.store.id);

    return service;
  }

  async delete(storeId: string, id: string): Promise<void> {
    const result = await this.serviceRepository.delete({
      id,
      store: { id: storeId },
    });

    if (!result.affected) {
      throw new NotFoundException('Service not found');
    }

    await this.storeSearchSync.sync(storeId);
  }

  private async assertCategoryInStore(service: ServiceDto): Promise<void> {
    const exists = await this.categoryRepository.exists({
      where: { id: service.category.id, store: { id: service.store.id } },
    });

    if (!exists) {
      throw new NotFoundException('Category not found');
    }
  }
}
