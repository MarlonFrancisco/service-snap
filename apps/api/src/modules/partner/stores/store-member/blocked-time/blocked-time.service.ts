import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
  ) {}

  async create(
    storeId: string,
    blockedTimeDto: BlockedTimeDto,
  ): Promise<BlockedTime> {
    await this.assertMemberInStore(storeId, blockedTimeDto.storeMember.id);

    // Com `id` no corpo, o save sobrescreveria um bloqueio existente
    const blockedTime = await this.blockedTimeRepository.save({
      ...blockedTimeDto,
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

    const blockedTimesToCreate = createBulkDto.blockedTimes.map((bt) => ({
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

    const result = await this.blockedTimeRepository.update(
      { id: blockedTime.id, storeMember: { id: blockedTime.storeMember.id } },
      blockedTime,
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
