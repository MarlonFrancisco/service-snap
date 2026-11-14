import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { getUserFullName } from '../../utils/helpers/user.helpers';
import { AuditService } from '../audit/audit.service';
import { Schedule } from '../partner/stores/schedule/schedule.entity';
import { StoreSearchSyncService } from '../partner/stores/search-sync/store-search-sync.service';
import { Store } from '../partner/stores/store.entity';
import { Subscription } from '../subscription/subscription.entity';
import { User } from '../users/user.entity';
import { toLikePattern, toPage } from './admin.helpers';
import type { AdminListQueryDto, AdminUpdateStoreDto } from './dto/admin.dto';

const DAY_MS = 86_400_000;

/** Painel da plataforma: números gerais, lojas, usuários e auditoria. */
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly storeSearchSync: StoreSearchSyncService,
    private readonly auditService: AuditService,
  ) {}

  async overview(now = new Date()) {
    const since = new Date(now.getTime() - 30 * DAY_MS);
    const sinceDate = since.toISOString().slice(0, 10);

    const [
      users,
      newUsers,
      stores,
      activeStores,
      schedulesByStatus,
      subscriptionsByStatus,
    ] = await Promise.all([
      this.userRepository.count({ where: { isDeleted: false } }),
      this.userRepository.count({
        where: { isDeleted: false, createdAt: MoreThanOrEqual(since) },
      }),
      this.storeRepository.count({ where: { isDeleted: false } }),
      this.storeRepository.count({
        where: { isDeleted: false, isActive: true },
      }),
      this.scheduleRepository
        .createQueryBuilder('schedule')
        .select('schedule.status', 'status')
        .addSelect('COUNT(*)::int', 'count')
        .where('schedule.date >= :sinceDate', { sinceDate })
        .groupBy('schedule.status')
        .getRawMany<{ status: string; count: number }>(),
      this.subscriptionRepository
        .createQueryBuilder('subscription')
        .select('subscription.status', 'status')
        .addSelect('COUNT(*)::int', 'count')
        .groupBy('subscription.status')
        .getRawMany<{ status: string; count: number }>(),
    ]);

    return {
      users: { total: users, newLast30Days: newUsers },
      stores: { total: stores, active: activeStores },
      schedulesLast30Days: Object.fromEntries(
        schedulesByStatus.map(({ status, count }) => [status, count]),
      ),
      subscriptions: Object.fromEntries(
        subscriptionsByStatus.map(({ status, count }) => [status, count]),
      ),
    };
  }

  async listStores(query: AdminListQueryDto) {
    const { skip, take, page } = toPage(query.page, query.limit);
    const pattern = toLikePattern(query.search);
    const builder = this.storeRepository
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.owner', 'owner')
      .orderBy('store.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    if (pattern) {
      builder.where(
        '(store.name ILIKE :pattern OR store.city ILIKE :pattern OR owner.email ILIKE :pattern)',
        { pattern },
      );
    }

    const [stores, total] = await builder.getManyAndCount();

    return {
      data: stores.map((store) => ({
        id: store.id,
        name: store.name,
        city: store.city,
        isActive: store.isActive,
        isDeleted: store.isDeleted,
        createdAt: store.createdAt,
        owner: store.owner && {
          id: store.owner.id,
          name: getUserFullName(store.owner),
          email: store.owner.email,
        },
      })),
      meta: { total, page, limit: take, totalPages: Math.ceil(total / take) },
    };
  }

  async getStore(id: string) {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['owner', 'storeMembers', 'services'],
    });

    if (!store) throw new NotFoundException('Store not found');

    const [subscription, schedulesLast30Days, recentActivity] =
      await Promise.all([
        store.owner
          ? this.subscriptionRepository.findOne({
              where: { user: { id: store.owner.id } },
              order: { currentPeriodEnd: 'DESC' },
            })
          : null,
        this.scheduleRepository.count({
          where: {
            store: { id },
            date: MoreThanOrEqual(
              new Date(Date.now() - 30 * DAY_MS)
                .toISOString()
                .slice(0, 10) as unknown as Date,
            ),
          },
        }),
        this.auditService.list(id, { limit: 20 }),
      ]);

    return {
      id: store.id,
      name: store.name,
      city: store.city,
      state: store.state,
      telephone: store.telephone,
      email: store.email,
      isActive: store.isActive,
      isDeleted: store.isDeleted,
      createdAt: store.createdAt,
      owner: store.owner && {
        id: store.owner.id,
        name: getUserFullName(store.owner),
        email: store.owner.email,
      },
      subscription: subscription && {
        status: subscription.status,
        productId: subscription.productId,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
      membersCount: store.storeMembers.filter((member) => !member.isDeleted)
        .length,
      servicesCount: store.services.length,
      schedulesLast30Days,
      recentActivity: recentActivity.data,
    };
  }

  /** Suspender tira a loja da busca; o motivo vai para a auditoria (corpo da rota). */
  async updateStore(id: string, dto: AdminUpdateStoreDto) {
    const result = await this.storeRepository.update(
      { id },
      { isActive: dto.isActive },
    );

    if (!result.affected) throw new NotFoundException('Store not found');

    await this.storeSearchSync.sync(id);

    return this.getStore(id);
  }

  async listUsers(query: AdminListQueryDto) {
    const { skip, take, page } = toPage(query.page, query.limit);
    const pattern = toLikePattern(query.search);
    const builder = this.userRepository
      .createQueryBuilder('user')
      .where('user.isDeleted = false')
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    if (pattern) {
      builder.andWhere(
        `(user.email ILIKE :pattern OR user.telephone ILIKE :pattern
          OR user.firstName ILIKE :pattern OR user.lastName ILIKE :pattern)`,
        { pattern },
      );
    }

    const [users, total] = await builder.getManyAndCount();

    return {
      data: users.map((user) => ({
        id: user.id,
        name: getUserFullName(user),
        email: user.email,
        telephone: user.telephone,
        createdAt: user.createdAt,
      })),
      meta: { total, page, limit: take, totalPages: Math.ceil(total / take) },
    };
  }
}
