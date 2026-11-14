import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  In,
  MoreThanOrEqual,
  Not,
  Repository,
  type EntityManager,
} from 'typeorm';
import {
  decryptText,
  parseEncryptionKey,
} from '../../utils/helpers/crypto.helpers';
import { toDateKey } from '../../utils/helpers/schedule.helpers';
import { AuditService } from '../audit/audit.service';
import { AnamnesisResponse } from '../partner/stores/anamnesis/anamnesis-response.entity';
import { StorePayment } from '../partner/stores/cash/store-payment.entity';
import { LoyaltyReward } from '../partner/stores/loyalty/loyalty-reward.entity';
import { CustomerPackage } from '../partner/stores/packages/customer-package.entity';
import { Review } from '../partner/stores/review/review.entity';
import { Schedule } from '../partner/stores/schedule/schedule.entity';
import { StoreSearchSyncService } from '../partner/stores/search-sync/store-search-sync.service';
import { StoreMember } from '../partner/stores/store-member/store-member.entity';
import { Store } from '../partner/stores/store.entity';
import { StorageService } from '../storage/storage.service';
import { StripeService } from '../stripe';
import { Subscription } from '../subscription/subscription.entity';
import { Favorite } from '../users/favorites/favorite.entity';
import { User } from '../users/user.entity';
import {
  ACCOUNT_HAS_ACTIVE_SUBSCRIPTION,
  type TUserDataExport,
} from './privacy.types';

const ACTIVE_SUBSCRIPTION = ['active', 'trialing', 'paid'];

/**
 * Direitos do titular (LGPD art. 18): acesso aos dados e eliminação. A
 * eliminação anonimiza em vez de apagar a linha: atendimentos, caixa e
 * comissões das lojas continuam batendo, sem nada que identifique a pessoa.
 */
@Injectable()
export class PrivacyService {
  private readonly logger = new Logger(PrivacyService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(AnamnesisResponse)
    private readonly anamnesisRepository: Repository<AnamnesisResponse>,
    @InjectRepository(CustomerPackage)
    private readonly packageRepository: Repository<CustomerPackage>,
    @InjectRepository(LoyaltyReward)
    private readonly rewardRepository: Repository<LoyaltyReward>,
    @InjectRepository(StorePayment)
    private readonly paymentRepository: Repository<StorePayment>,
    @InjectRepository(StoreMember)
    private readonly memberRepository: Repository<StoreMember>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly stripeService: StripeService,
    private readonly storageService: StorageService,
    private readonly storeSearchSync: StoreSearchSyncService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
  ) {}

  async exportData(userId: string): Promise<TUserDataExport> {
    const user = await this.userRepository.findOneByOrFail({ id: userId });
    const [
      schedules,
      reviews,
      favorites,
      anamnesis,
      packages,
      rewards,
      payments,
      memberships,
      stores,
      subscriptions,
    ] = await Promise.all([
      this.scheduleRepository.find({
        where: { user: { id: userId } },
        relations: ['store', 'service', 'storeMember', 'storeMember.user'],
        order: { date: 'DESC' },
      }),
      this.reviewRepository.find({
        where: { user: { id: userId } },
        relations: ['store'],
      }),
      this.favoriteRepository.find({
        where: { user: { id: userId } },
        relations: ['store'],
      }),
      this.anamnesisRepository
        .createQueryBuilder('response')
        .addSelect('response.answersEncrypted')
        .leftJoinAndSelect('response.store', 'store')
        .where('response.customerId = :userId', { userId })
        .getMany(),
      this.packageRepository.find({
        where: { customer: { id: userId } },
        relations: ['store', 'items'],
      }),
      this.rewardRepository.find({
        where: { customer: { id: userId } },
        relations: ['store'],
      }),
      this.paymentRepository.find({
        where: { customer: { id: userId } },
        relations: ['store'],
      }),
      this.memberRepository.find({
        where: { user: { id: userId } },
        relations: ['store'],
      }),
      this.storeRepository.find({ where: { owner: { id: userId } } }),
      this.subscriptionRepository.find({ where: { user: { id: userId } } }),
    ]);

    await this.auditService.record({
      actorType: 'user',
      actorUserId: userId,
      action: 'privacy.data.exported',
      resourceType: 'users',
      resourceId: userId,
    });

    return {
      exportedAt: new Date().toISOString(),
      profile: {
        id: user.id,
        email: user.email,
        telephone: user.telephone,
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate,
        country: user.country,
        acceptedTerms: user.acceptedTerms,
        createdAt: user.createdAt,
      },
      schedules: schedules.map((schedule) => ({
        store: schedule.store?.name,
        service: schedule.service?.name,
        professional: schedule.storeMember?.user
          ? `${schedule.storeMember.user.firstName ?? ''} ${schedule.storeMember.user.lastName ?? ''}`.trim()
          : null,
        date: schedule.date ? toDateKey(schedule.date) : null,
        startTime: schedule.startTime,
        status: schedule.status,
        price: schedule.price,
        currency: schedule.currency,
        notes: schedule.notes,
      })),
      reviews: reviews.map((review) => ({
        store: review.store?.name,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      })),
      favorites: favorites.map((favorite) => ({
        store: favorite.store?.name,
        createdAt: favorite.createdAt,
      })),
      // O dado de saúde é do titular: sai decifrado no arquivo dele
      anamnesis: anamnesis.map((response) => ({
        store: response.store?.name,
        form: response.formName,
        fields: response.fields,
        answers: this.readAnswers(response),
        consentAt: response.consentAt,
        consentText: response.consentText,
        submittedAt: response.updatedAt,
      })),
      packages: packages.map((item) => ({
        store: item.store?.name,
        name: item.name,
        pricePaid: item.pricePaid,
        purchasedAt: item.purchasedAt,
        expiresOn: item.expiresOn,
        status: item.status,
        items: item.items.map(({ serviceName, quantity, used }) => ({
          serviceName,
          quantity,
          used,
        })),
      })),
      loyaltyRewards: rewards.map((reward) => ({
        store: reward.store?.name,
        description: reward.description,
        status: reward.status,
        earnedAt: reward.earnedAt,
        expiresOn: reward.expiresOn,
        redeemedAt: reward.redeemedAt,
      })),
      payments: payments.map((payment) => ({
        store: payment.store?.name,
        method: payment.method,
        amount: payment.amount,
        paidAt: payment.paidAt,
        voidedAt: payment.voidedAt,
      })),
      storeMemberships: memberships.map((member) => ({
        store: member.store?.name,
        role: member.role,
        isActive: member.isActive,
      })),
      ownedStores: stores.map((store) => ({
        id: store.id,
        name: store.name,
        createdAt: store.createdAt,
        isDeleted: store.isDeleted,
      })),
      subscriptions: subscriptions.map((subscription) => ({
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
      })),
    };
  }

  /**
   * Exclusão de verdade. Com assinatura ativa o dono cancela antes: apagar o
   * cliente no Stripe no meio do período cortaria o plano sem aviso.
   */
  async deleteAccount(userId: string) {
    const user = await this.userRepository.findOneByOrFail({ id: userId });
    const hasActiveSubscription = await this.subscriptionRepository.exists({
      where: {
        user: { id: userId },
        status: In(ACTIVE_SUBSCRIPTION),
        currentPeriodEnd: MoreThanOrEqual(new Date()),
      },
    });

    if (hasActiveSubscription) {
      throw new ConflictException({
        statusCode: 409,
        code: ACCOUNT_HAS_ACTIVE_SUBSCRIPTION,
        message: 'Cancel the subscription before deleting the account',
      });
    }

    const storeIds = await this.scheduleRepository.manager.transaction(
      (manager) => this.anonymize(manager, userId),
    );

    await this.auditService.record({
      actorType: 'user',
      actorUserId: userId,
      action: 'privacy.account.deleted',
      resourceType: 'users',
      resourceId: userId,
      metadata: { closedStores: storeIds },
    });

    // Fora da transação e sem desfazer nada: o banco já não identifica a pessoa
    await Promise.all([
      ...storeIds.map((storeId) => this.storeSearchSync.remove(storeId)),
      this.attempt('Cliente no Stripe', () =>
        user.paymentCustomerId
          ? this.stripeService.customers.del(user.paymentCustomerId)
          : Promise.resolve(),
      ),
      this.attempt('Foto do perfil', () =>
        this.storageService.deleteFile({
          folder: 'users',
          path: `${userId}/avatar.webp`,
        }),
      ),
    ]);

    return { id: userId };
  }

  /** Devolve as lojas do dono que foram fechadas, para saírem da busca. */
  private async anonymize(
    manager: EntityManager,
    userId: string,
  ): Promise<string[]> {
    const today = toDateKey(new Date());

    // Horário futuro de quem saiu volta a ficar livre na agenda da loja
    await manager.update(
      Schedule,
      {
        user: { id: userId },
        status: 'scheduled',
        date: MoreThanOrEqual(today as unknown as Date),
      },
      { status: 'cancelled' },
    );
    await manager.delete(Favorite, { user: { id: userId } });
    await manager.delete(AnamnesisResponse, { customer: { id: userId } });
    await manager.update(
      StoreMember,
      { user: { id: userId } },
      { isActive: false, isDeleted: true },
    );

    const stores = await manager.find(Store, {
      where: { owner: { id: userId }, isDeleted: Not(true) },
      select: ['id'],
    });

    if (stores.length) {
      await manager.update(
        Store,
        { id: In(stores.map((store) => store.id)) },
        { isActive: false, isDeleted: true },
      );
    }

    await manager.update(User, userId, {
      email: null,
      telephone: null,
      firstName: null,
      lastName: null,
      birthDate: null,
      avatar: null,
      authCode: null,
      authCodeExpiresAt: null,
      referralCode: null,
      referredById: null,
      paymentCustomerId: null,
      acceptedTerms: false,
      isDeleted: true,
    });

    return stores.map((store) => store.id);
  }

  private readAnswers(response: AnamnesisResponse) {
    const key = parseEncryptionKey(
      this.configService.get<string>('DATA_ENCRYPTION_KEY'),
    );

    try {
      return key
        ? (JSON.parse(decryptText(response.answersEncrypted, key)) as unknown)
        : null;
    } catch (error) {
      this.logger.error(
        `Ficha ${response.id} ilegível na exportação`,
        error instanceof Error ? error.stack : undefined,
      );
      return null;
    }
  }

  private async attempt(description: string, run: () => Promise<unknown>) {
    try {
      await run();
    } catch (error) {
      this.logger.error(
        `${description} não apagado na exclusão de conta`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
