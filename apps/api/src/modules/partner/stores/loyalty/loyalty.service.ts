import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type EntityManager } from 'typeorm';
import {
  addDaysToDateKey,
  getStoreToday,
} from '../../../../utils/helpers/store-date.helpers';
import { Service } from '../category/service/service.entity';
import { Store } from '../store.entity';
import type { SaveLoyaltyProgramDto } from './dto/loyalty.dto';
import { LoyaltyProgram } from './loyalty-program.entity';
import { LoyaltyReward } from './loyalty-reward.entity';
import {
  countEarnedRewards,
  describeReward,
  isRewardExpired,
} from './loyalty.helpers';
import type { TLoyaltyProgress } from './loyalty.types';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(LoyaltyProgram)
    private readonly programRepository: Repository<LoyaltyProgram>,
    @InjectRepository(LoyaltyReward)
    private readonly rewardRepository: Repository<LoyaltyReward>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  getProgram(storeId: string) {
    return this.programRepository.findOne({
      where: { store: { id: storeId } },
      relations: ['rewardService'],
    });
  }

  /**
   * Mudar quantas visitas valem ou quais serviços contam começa um ciclo novo:
   * a contagem antiga não serve para a regra nova. Recompensas já ganhas ficam.
   */
  async saveProgram(storeId: string, dto: SaveLoyaltyProgramDto) {
    this.assertReward(dto);

    const [existing, store] = await Promise.all([
      this.getProgram(storeId),
      this.storeRepository.findOneBy({ id: storeId }),
    ]);
    const serviceIds = [
      ...new Set([
        ...(dto.eligibleServiceIds ?? []),
        ...(dto.rewardServiceId ? [dto.rewardServiceId] : []),
      ]),
    ];
    const found = serviceIds.length
      ? await this.serviceRepository.count({
          where: serviceIds.map((id) => ({ id, store: { id: storeId } })),
        })
      : 0;

    if (found !== serviceIds.length) {
      throw new BadRequestException('Service not found in this store');
    }

    const eligible = [...new Set(dto.eligibleServiceIds ?? [])].sort();
    const ruleChanged =
      !existing ||
      existing.visitsRequired !== dto.visitsRequired ||
      [...existing.eligibleServiceIds].sort().join() !== eligible.join();

    await this.programRepository.save({
      ...(existing && { id: existing.id }),
      isActive: dto.isActive,
      visitsRequired: dto.visitsRequired,
      rewardType: dto.rewardType,
      rewardValue: dto.rewardType === 'free_service' ? null : dto.rewardValue,
      rewardService:
        dto.rewardType === 'free_service' ? { id: dto.rewardServiceId } : null,
      eligibleServiceIds: eligible,
      rewardValidityDays: dto.rewardValidityDays ?? null,
      cycleStartsOn:
        dto.cycleStartsOn ??
        (ruleChanged ? getStoreToday(store) : existing.cycleStartsOn),
      store: { id: storeId },
    });

    return this.getProgram(storeId);
  }

  /** Conta as visitas, cria o que falta de recompensa e devolve o progresso. */
  async getProgress(
    storeId: string,
    customerId: string,
  ): Promise<TLoyaltyProgress | null> {
    const [program, store] = await Promise.all([
      this.getProgram(storeId),
      this.storeRepository.findOneBy({ id: storeId }),
    ]);

    if (!program) return null;

    const today = getStoreToday(store);
    const visits = await this.countVisits(program, storeId, customerId);

    if (program.isActive) {
      await this.issueMissingRewards(program, store, customerId, visits, today);
    }

    const rewards = await this.rewardRepository.find({
      where: { store: { id: storeId }, customer: { id: customerId } },
      relations: ['rewardService'],
      order: { earnedAt: 'DESC' },
    });

    return {
      isActive: program.isActive,
      visitsRequired: program.visitsRequired,
      visits,
      visitsToNextReward:
        program.visitsRequired - (visits % program.visitsRequired),
      cycleStartsOn: program.cycleStartsOn,
      rewards: rewards.map((reward) => ({
        id: reward.id,
        description: reward.description,
        rewardType: reward.rewardType,
        rewardValue: reward.rewardValue,
        rewardServiceId: reward.rewardService?.id ?? null,
        earnedAt: reward.earnedAt,
        expiresOn: reward.expiresOn,
        status: isRewardExpired(reward, today) ? 'expired' : reward.status,
        redeemedAt: reward.redeemedAt,
      })),
    };
  }

  /** Resgate dentro da transação do fechamento (ou sozinho, pela rota). */
  async redeem(
    manager: EntityManager,
    storeId: string,
    rewardId: string,
    customerId: string | null,
    userId: string,
  ): Promise<LoyaltyReward> {
    const reward = await manager.findOne(LoyaltyReward, {
      where: { id: rewardId, store: { id: storeId } },
      relations: ['customer', 'rewardService', 'store'],
      lock: { mode: 'pessimistic_write', tables: ['loyalty_rewards'] },
    });

    if (!reward) throw new NotFoundException('Reward not found');
    if (customerId && reward.customer.id !== customerId) {
      throw new BadRequestException('Reward belongs to another customer');
    }
    if (reward.status !== 'available') {
      throw new ConflictException('Reward already redeemed');
    }
    if (isRewardExpired(reward, getStoreToday(reward.store))) {
      throw new ConflictException('Reward expired');
    }

    await manager.update(LoyaltyReward, reward.id, {
      status: 'redeemed',
      redeemedAt: new Date(),
      redeemedById: userId,
    });

    return reward;
  }

  redeemStandalone(storeId: string, rewardId: string, userId: string) {
    return this.rewardRepository.manager
      .transaction((manager) =>
        this.redeem(manager, storeId, rewardId, null, userId),
      )
      .then(({ id }) => ({ id, status: 'redeemed' }));
  }

  /** Devolve a recompensa quando o fechamento que a usou é desfeito. */
  async release(manager: EntityManager, rewardId: string) {
    await manager.update(LoyaltyReward, rewardId, {
      status: 'available',
      redeemedAt: null,
      redeemedById: null,
    });
  }

  /** Dias distintos com atendimento concluído no ciclo, nos serviços que contam. */
  private async countVisits(
    program: LoyaltyProgram,
    storeId: string,
    customerId: string,
  ) {
    const query = this.rewardRepository.manager
      .createQueryBuilder()
      .select('COUNT(DISTINCT schedule.date)', 'visits')
      .from('schedules', 'schedule')
      .where('schedule.storeId = :storeId', { storeId })
      .andWhere('schedule.userId = :customerId', { customerId })
      .andWhere("schedule.status = 'completed'")
      .andWhere('schedule.date >= :from', { from: program.cycleStartsOn });

    if (program.eligibleServiceIds.length) {
      query.andWhere('schedule.serviceId IN (:...services)', {
        services: program.eligibleServiceIds,
      });
    }

    const { visits } = await query.getRawOne<{ visits: string }>();

    return Number(visits);
  }

  private async issueMissingRewards(
    program: LoyaltyProgram,
    store: Store,
    customerId: string,
    visits: number,
    today: string,
  ) {
    const earned = countEarnedRewards(visits, program.visitsRequired);
    const issued = await this.rewardRepository.count({
      where: {
        store: { id: store.id },
        customer: { id: customerId },
        cycleStartsOn: program.cycleStartsOn,
      },
    });

    if (earned <= issued) return;

    const rewards = Array.from({ length: earned - issued }, (_, index) => ({
      cycleStartsOn: program.cycleStartsOn,
      sequence: issued + index + 1,
      rewardType: program.rewardType,
      rewardValue: program.rewardValue,
      description: describeReward(program, store),
      expiresOn: program.rewardValidityDays
        ? addDaysToDateKey(today, program.rewardValidityDays - 1)
        : null,
      store: { id: store.id },
      customer: { id: customerId },
      rewardService: program.rewardService
        ? { id: program.rewardService.id }
        : null,
    }));

    // Outra contagem simultânea pode ter criado a mesma: o índice único ignora
    await this.rewardRepository
      .createQueryBuilder()
      .insert()
      .into(LoyaltyReward)
      .values(rewards)
      .orIgnore()
      .execute();
  }

  private assertReward(dto: SaveLoyaltyProgramDto) {
    if (dto.rewardType === 'free_service' && !dto.rewardServiceId) {
      throw new BadRequestException('Free service reward needs a service');
    }
    if (dto.rewardType !== 'free_service' && !dto.rewardValue) {
      throw new BadRequestException('Discount reward needs a value');
    }
    if (dto.rewardType === 'percent' && dto.rewardValue > 100) {
      throw new BadRequestException('Percent discount must be up to 100');
    }
  }
}
