import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateNotificationHistoryDto } from './dto/update-notifications-history.dto';
import { NotificationsHistory } from './history.entity';

@Injectable()
export class NotificationsHistoryService {
  constructor(
    @InjectRepository(NotificationsHistory)
    private readonly notificationsHistoryRepository: Repository<NotificationsHistory>,
  ) {}

  async create(
    notificationsHistory: NotificationsHistory,
  ): Promise<NotificationsHistory> {
    return this.notificationsHistoryRepository.save(notificationsHistory);
  }

  async findAll(
    storeId: string,
    page: number = 1,
    limit: number = 10,
    filters?: { type?: string; status?: string; search?: string },
  ) {
    const { type, status, search } = filters || {};
    const query = this.notificationsHistoryRepository
      .createQueryBuilder('notification')
      .where('notification.storeId = :storeId', { storeId });

    if (type && type !== 'all') {
      query.andWhere('notification.type = :type', { type });
    }

    if (status && status !== 'all') {
      query.andWhere('notification.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(notification.title ILIKE :search OR notification.message ILIKE :search OR notification.recipient ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    query
      .orderBy('notification.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<NotificationsHistory> {
    return this.notificationsHistoryRepository.findOne({ where: { id } });
  }

  async update(
    storeId: string,
    id: string,
    notificationsHistory: UpdateNotificationHistoryDto,
  ): Promise<UpdateNotificationHistoryDto> {
    // O `id` e a loja vêm da URL: o corpo não troca nenhum dos dois
    const result = await this.notificationsHistoryRepository.update(
      { id, store: { id: storeId } },
      { ...notificationsHistory, id, store: { id: storeId } },
    );

    if (!result.affected) {
      throw new NotFoundException('Notification not found');
    }

    return notificationsHistory;
  }

  async markAllAsRead(storeId: string) {
    await this.notificationsHistoryRepository.update(
      { store: { id: storeId }, read: false },
      { read: true },
    );

    return storeId;
  }

  async delete(storeId: string, id: string): Promise<{ id: string }> {
    const result = await this.notificationsHistoryRepository.delete({
      id,
      store: { id: storeId },
    });

    if (!result.affected) {
      throw new NotFoundException('Notification not found');
    }

    return { id };
  }
}
