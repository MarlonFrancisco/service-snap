import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { PaginationQueryDto } from '../../../../utils/dto/pagination.dto';
import { toPage, toSkipTake } from '../../../../utils/helpers/pagination.helpers';
import type { TPage } from '../../../../utils/helpers/pagination.types';
import { ReviewDto } from './dto/review.dto';
import { Review } from './review.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async create(review: ReviewDto): Promise<Review> {
    // Com `id` no corpo, o save sobrescreveria uma avaliação existente
    const createdReview = await this.reviewRepository.save({
      ...review,
      id: undefined,
    });
    return this.findOne(createdReview.id);
  }

  /** Com `page`, uma página das mais recentes; sem, a lista inteira. */
  async findAll(
    storeId: string,
    { page, limit }: PaginationQueryDto = {},
  ): Promise<Review[] | TPage<Review>> {
    const options = {
      where: { store: { id: storeId } },
      order: { createdAt: 'DESC' as const },
      relations: ['user', 'store'],
      select: {
        user: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
        store: {
          id: true,
        },
      },
    };

    if (!page) return this.reviewRepository.find(options);

    const { skip, take } = toSkipTake(page, limit);
    const [reviews, total] = await this.reviewRepository.findAndCount({
      ...options,
      skip,
      take,
    });

    return toPage(reviews, total, page, take);
  }

  async findOne(id: string): Promise<Review> {
    return this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'store'],
      select: {
        user: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
        store: {
          id: true,
        },
      },
    });
  }

  async findOneInStore(storeId: string, id: string): Promise<Review> {
    const review = await this.findOne(id);

    if (review?.store?.id !== storeId) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(
    storeId: string,
    id: string,
    userId: string,
    review: ReviewDto,
  ): Promise<Review> {
    // Só nota e comentário: o corpo não troca o autor nem a loja da avaliação
    const result = await this.reviewRepository.update(
      { id, store: { id: storeId }, user: { id: userId } },
      { rating: review.rating, comment: review.comment },
    );

    if (!result.affected) {
      throw new NotFoundException('Review not found');
    }

    return this.findOne(id);
  }

  async delete(
    storeId: string,
    id: string,
    userId: string,
  ): Promise<{ id: string }> {
    const result = await this.reviewRepository.delete({
      id,
      store: { id: storeId },
      user: { id: userId },
    });

    if (!result.affected) {
      throw new NotFoundException('Review not found');
    }

    return { id };
  }
}
