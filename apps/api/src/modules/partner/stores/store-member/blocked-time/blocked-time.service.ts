import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  blockedRangeMinutes,
  calculateEndTime,
  DEFAULT_SLOT_INTERVAL_MINUTES,
} from '../../../../../utils/helpers/schedule.helpers';
import { Store } from '../../store.entity';
import { StoreMember } from '../store-member.entity';
import { BlockedTime } from './blocked-time.entity';
import {
  BlockedTimeDto,
  CreateBulkBlockedTimeDto,
  DeleteBulkBlockedTimeDto,
} from './dto/blocked-time.dto';

@Injectable()
export class BlockedTimeService {
  constructor(
    @InjectRepository(BlockedTime)
    private readonly blockedTimeRepository: Repository<BlockedTime>,
    @InjectRepository(StoreMember)
    private readonly storeMemberRepository: Repository<StoreMember>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(
    storeId: string,
    blockedTimeDto: BlockedTimeDto,
  ): Promise<BlockedTime> {
    await this.assertMemberInStore(storeId, blockedTimeDto.storeMember.id);

    const [range] = await this.withEndTime(storeId, [blockedTimeDto]);

    // Com `id` no corpo, o save sobrescreveria um bloqueio existente
    const blockedTime = await this.blockedTimeRepository.save({
      ...range,
      id: undefined,
    });
    return this.findOne(blockedTime.id, ['storeMember', 'storeMember.user']);
  }

  async createBulk(
    storeId: string,
    storeMemberId: string,
    createBulkDto: CreateBulkBlockedTimeDto,
  ): Promise<BlockedTime[]> {
    await this.assertMemberInStore(storeId, storeMemberId);

    const ranges = await this.withEndTime(storeId, createBulkDto.blockedTimes);
    const blockedTimesToCreate = ranges.map((bt) => ({
      ...bt,
      id: undefined,
      storeMember: { id: storeMemberId },
    }));

    const savedBlockedTimes =
      await this.blockedTimeRepository.save(blockedTimesToCreate);

    return this.blockedTimeRepository.find({
      where: {
        id: In(savedBlockedTimes.map((bt) => bt.id)),
      },
      relations: ['storeMember', 'storeMember.user'],
    });
  }

  async findAll(
    storeId: string,
    storeMemberId: string,
  ): Promise<BlockedTime[]> {
    await this.assertMemberInStore(storeId, storeMemberId);

    return this.blockedTimeRepository.find({
      where: { storeMember: { id: storeMemberId } },
      relations: ['storeMember', 'storeMember.user'],
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  async findByDateRange(
    storeMemberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<BlockedTime[]> {
    return this.blockedTimeRepository
      .createQueryBuilder('blockedTime')
      .where('blockedTime.storeMember.id = :storeMemberId', { storeMemberId })
      .andWhere('blockedTime.date >= :startDate', { startDate })
      .andWhere('blockedTime.date <= :endDate', { endDate })
      .leftJoinAndSelect('blockedTime.storeMember', 'storeMember')
      .leftJoinAndSelect('storeMember.user', 'user')
      .orderBy('blockedTime.date', 'ASC')
      .addOrderBy('blockedTime.time', 'ASC')
      .getMany();
  }

  async findOne(id: string, relations: string[] = []): Promise<BlockedTime> {
    const blockedTime = await this.blockedTimeRepository.findOne({
      where: { id },
      relations,
    });

    if (!blockedTime) {
      throw new NotFoundException('Blocked time not found');
    }

    return blockedTime;
  }

  async update(
    storeId: string,
    blockedTime: BlockedTimeDto,
  ): Promise<BlockedTime> {
    await this.assertMemberInStore(storeId, blockedTime.storeMember.id);

    const [range] = await this.withEndTime(storeId, [blockedTime]);
    const result = await this.blockedTimeRepository.update(
      { id: blockedTime.id, storeMember: { id: blockedTime.storeMember.id } },
      range,
    );

    if (!result.affected) {
      throw new NotFoundException('Blocked time not found');
    }

    return this.findOne(blockedTime.id, ['storeMember', 'storeMember.user']);
  }

  async delete(
    storeId: string,
    storeMemberId: string,
    id: string,
  ): Promise<void> {
    await this.assertMemberInStore(storeId, storeMemberId);

    const result = await this.blockedTimeRepository.delete({
      id,
      storeMember: { id: storeMemberId },
    });

    if (!result.affected) {
      throw new NotFoundException('Blocked time not found');
    }
  }

  async deleteBulk(
    storeId: string,
    storeMemberId: string,
    deleteBulkDto: DeleteBulkBlockedTimeDto,
  ): Promise<{ id: string; storeMember: { id: string } }[]> {
    await this.assertMemberInStore(storeId, storeMemberId);

    const ids = deleteBulkDto.blockedTimes.map((bt) => bt.id);

    // Um array de critérios vira `whereInIds`, que ignora o `storeMember`
    await this.blockedTimeRepository.delete({
      id: In(ids),
      storeMember: { id: storeMemberId },
    });

    return ids.map((id) => ({
      id,
      storeMember: { id: storeMemberId },
    }));
  }

  /**
   * Bloqueio sem fim ocupa um slot da grade da loja, como fazia o registro
   * antigo de um horário só. Recusa fim antes do início.
   */
  private async withEndTime<T extends { time: string; endTime?: string }>(
    storeId: string,
    items: T[],
  ): Promise<(T & { endTime: string })[]> {
    const needsSlot = items.some((item) => item.time && !item.endTime);
    const store =
      needsSlot &&
      (await this.storeRepository.findOne({
        where: { id: storeId },
        select: { id: true, slotIntervalMinutes: true },
      }));
    const slot = store?.slotIntervalMinutes || DEFAULT_SLOT_INTERVAL_MINUTES;

    return items.map((item) => {
      // Edição sem início não mexe no intervalo
      if (!item.time) return item as T & { endTime: string };

      const range = {
        ...item,
        endTime: item.endTime || calculateEndTime(item.time, slot),
      };
      const [start, end] = blockedRangeMinutes(range);

      if (end <= start) {
        throw new BadRequestException('endTime must be after time');
      }

      return range;
    });
  }

  private async assertMemberInStore(
    storeId: string,
    storeMemberId: string,
  ): Promise<void> {
    const exists = await this.storeMemberRepository.exists({
      where: { id: storeMemberId, store: { id: storeId } },
    });

    if (!exists) {
      throw new NotFoundException('Store member not found');
    }
  }
}
