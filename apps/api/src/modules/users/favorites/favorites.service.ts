import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteDto } from './dto/favorite.dto';
import { Favorite } from './favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  async create(favorite: FavoriteDto): Promise<Favorite> {
    // Com `id` no corpo, o save sobrescreveria um favorito existente
    return this.favoriteRepository.save({ ...favorite, id: undefined });
  }

  async findAll(userId: string): Promise<Favorite[]> {
    return this.favoriteRepository.find({ where: { user: { id: userId } } });
  }

  async findOne(id: string): Promise<Favorite> {
    return this.favoriteRepository.findOne({ where: { id } });
  }

  async update(favorite: FavoriteDto): Promise<FavoriteDto> {
    await this.favoriteRepository.update(favorite.id, favorite);
    return favorite;
  }

  async delete(userId: string, id: string): Promise<void> {
    const result = await this.favoriteRepository.delete({
      id,
      user: { id: userId },
    });

    if (!result.affected) {
      throw new NotFoundException('Favorite not found');
    }
  }
}
