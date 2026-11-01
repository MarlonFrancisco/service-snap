import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

  async create(service: ServiceDto): Promise<Service> {
    await this.assertCategoryInStore(service);

    // Com `id` no corpo, o save sobrescreveria um serviço existente
    return this.serviceRepository.save({ ...service, id: undefined });
  }

  async findAll(storeId: string): Promise<Service[]> {
    return this.serviceRepository.find({
      where: { store: { id: storeId } },
    });
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
