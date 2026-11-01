import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryDto } from './category.dto';
import { Category } from './category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(category: CategoryDto): Promise<Category> {
    // Com `id` no corpo, o save sobrescreveria uma categoria existente
    return this.categoryRepository.save({ ...category, id: undefined });
  }

  async findAll(storeId: string): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { store: { id: storeId } },
      relations: ['services'],
    });
  }

  async findOne(
    storeId: string,
    id: string,
    includeServices: boolean = false,
  ): Promise<Category> {
    const relations = includeServices ? ['services'] : [];

    const category = await this.categoryRepository.findOne({
      where: { id, store: { id: storeId } },
      relations,
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(category: CategoryDto): Promise<CategoryDto> {
    const result = await this.categoryRepository.update(
      { id: category.id, store: { id: category.store.id } },
      category,
    );

    if (!result.affected) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async delete(storeId: string, id: string): Promise<{ id: string }> {
    const result = await this.categoryRepository.delete({
      id,
      store: { id: storeId },
    });

    if (!result.affected) {
      throw new NotFoundException('Category not found');
    }

    return { id };
  }
}
