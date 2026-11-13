import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUniqueViolation } from '../../../../utils/helpers/database.helpers';
import { Schedule } from '../schedule/schedule.entity';
import { StoreSearchSyncService } from '../search-sync/store-search-sync.service';
import { ReviewDto } from './dto/review.dto';
import { Review } from './review.entity';
import type { TReviewableSchedule } from './review.types';

const REVIEW_SELECT = {
  user: {
    id: true,
    firstName: true,
    lastName: true,
    avatar: true,
  },
  store: {
    id: true,
  },
  // "Atendido em [data] · [serviço] · com [profissional]"
  schedule: {
    id: true,
    date: true,
    service: { id: true, name: true },
    storeMember: { id: true, user: { id: true, firstName: true } },
  },
};

const REVIEW_RELATIONS = {
  user: true,
  store: true,
  schedule: { service: true, storeMember: { user: true } },
};

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    private readonly storeSearchSync: StoreSearchSyncService,
  ) {}

  /**
   * Só quem foi atendido avalia, e uma vez por atendimento: a avaliação fica
   * presa a um agendamento concluído do autor nesta loja.
   */
  async create(review: ReviewDto): Promise<Review> {
    const storeId = review.store?.id;
    const userId = review.user?.id;
    const schedule = await this.findReviewableSchedule(
      storeId,
      userId,
      review.scheduleId,
    );

    if (!schedule) {
      throw new ForbiddenException(
        'Só quem foi atendido nesta loja pode avaliar, uma vez por atendimento.',
      );
    }

    let createdReview: Review;

    try {
      // Com `id` no corpo, o save sobrescreveria uma avaliação existente
      createdReview = await this.reviewRepository.save({
        rating: review.rating,
        comment: review.comment,
        store: { id: storeId },
        user: { id: userId },
        schedule: { id: schedule.id },
      });
    } catch (error) {
      // Duas avaliações do mesmo atendimento enviadas ao mesmo tempo
      if (isUniqueViolation(error)) {
        throw new ConflictException('Este atendimento já foi avaliado.');
      }
      throw error;
    }

    await this.storeSearchSync.sync(storeId);

    return this.findOne(createdReview.id);
  }

  /** O atendimento pedido, ou o concluído mais recente que ainda não tem avaliação. */
  private async findReviewableSchedule(
    storeId: string,
    userId: string,
    scheduleId?: string,
  ): Promise<Schedule | null> {
    const query = this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoin(Review, 'review', 'review.scheduleId = schedule.id')
      .where('schedule.storeId = :storeId', { storeId })
      .andWhere('schedule.userId = :userId', { userId })
      .andWhere("schedule.status = 'completed'")
      .andWhere('review.id IS NULL')
      .orderBy('schedule.date', 'DESC')
      .addOrderBy('schedule.startTime', 'DESC');

    if (scheduleId) {
      query.andWhere('schedule.id = :scheduleId', { scheduleId });
    }

    return query.getOne();
  }

  /** O cliente vê o botão de avaliar só quando tem um atendimento para avaliar. */
  async findMyReviewable(
    storeId: string,
    userId: string,
  ): Promise<TReviewableSchedule | null> {
    const schedule = await this.findReviewableSchedule(storeId, userId);

    return schedule ? { scheduleId: schedule.id, date: schedule.date } : null;
  }

  async findAll(storeId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { store: { id: storeId } },
      relations: REVIEW_RELATIONS,
      select: REVIEW_SELECT,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Review> {
    return this.reviewRepository.findOne({
      where: { id },
      relations: REVIEW_RELATIONS,
      select: REVIEW_SELECT,
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

    await this.storeSearchSync.sync(storeId);

    return this.findOne(id);
  }

  /** Resposta pública da loja. Texto vazio apaga a resposta. */
  async reply(storeId: string, id: string, reply: string): Promise<Review> {
    const text = reply.trim();
    const result = await this.reviewRepository.update(
      { id, store: { id: storeId } },
      { reply: text || null, repliedAt: text ? new Date() : null },
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

    await this.storeSearchSync.sync(storeId);

    return { id };
  }
}
