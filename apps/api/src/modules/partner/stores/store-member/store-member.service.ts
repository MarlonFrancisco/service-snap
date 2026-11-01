import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { Subscription } from '../../../subscription/subscription.entity';
import { UsersService } from '../../../users/users.service';
import { Service } from '../category/service/service.entity';
import { Store } from '../store.entity';
import { CreateStoreMemberDto } from './dto/create-store-member.dto';
import { UpdateStoreMemberDto } from './dto/update-store-member.dto';
import { StoreMember } from './store-member.entity';

@Injectable()
export class StoreMemberService {
  constructor(
    @InjectRepository(StoreMember)
    private readonly storeMemberRepository: Repository<StoreMember>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly userService: UsersService,
  ) {}

  async findStoreMember(storeId: string, userId: string): Promise<StoreMember> {
    return this.storeMemberRepository.findOne({
      where: {
        store: { id: storeId },
        user: { id: userId },
        isActive: true,
        isDeleted: false,
      },
    });
  }

  async findStoreMemberWithSchedules(
    storeId: string,
    storeMemberId: string,
  ): Promise<StoreMember> {
    return this.storeMemberRepository.findOne({
      where: {
        store: { id: storeId },
        id: storeMemberId,
      },
      relations: ['blockedTimes', 'schedules', 'user'],
    });
  }

  async findStoreMembers(storeId: string): Promise<StoreMember[]> {
    return this.storeMemberRepository.find({
      where: { store: { id: storeId } },
      relations: ['services', 'user'],
      select: {
        services: {
          id: true,
          name: true,
          description: true,
        },
      },
    });
  }

  async create(
    storeMemberDto: CreateStoreMemberDto,
    ownerUserId: string,
  ): Promise<StoreMember> {
    await this.assertWithinProfessionalLimit(
      ownerUserId,
      storeMemberDto.store?.id,
    );

    const user = await this.userService.findByOne({
      email: storeMemberDto.user?.email,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const storeMember = this.storeMemberRepository.create({
      ...storeMemberDto,
      user: { id: user.id },
      services: [],
    });

    await this.storeMemberRepository.save(storeMember);

    if (storeMemberDto.services) {
      await this.storeMemberRepository
        .createQueryBuilder()
        .relation(StoreMember, 'services')
        .of(storeMember)
        .add(storeMemberDto.services.map((s) => ({ id: s.id })));
    }

    return this.storeMemberRepository.findOne({
      where: { id: storeMember.id },
      relations: ['user', 'services', 'store'],
    });
  }

  /** Para quem já se sabe o id: nem toda conta tem e-mail (login por telefone). */
  async createForUser({
    userId,
    storeId,
    ownerUserId,
    role,
    services,
  }: {
    userId: string;
    storeId: string;
    ownerUserId: string;
    role: StoreMember['role'];
    services: { id: string }[];
  }): Promise<StoreMember> {
    await this.assertWithinProfessionalLimit(ownerUserId, storeId);

    const storeMember = await this.storeMemberRepository.save({
      user: { id: userId },
      store: { id: storeId },
      role,
      isActive: true,
    });

    await this.storeMemberRepository
      .createQueryBuilder()
      .relation(StoreMember, 'services')
      .of(storeMember)
      .add(services);

    return storeMember as StoreMember;
  }

  async update(storeMemberDto: UpdateStoreMemberDto): Promise<StoreMember> {
    const storeMember = await this.storeMemberRepository.findOneOrFail({
      where: { id: storeMemberDto.id },
      relations: ['services', 'user', 'store', 'blockedTimes'],
    });

    if (storeMemberDto.role) {
      storeMember.role = storeMemberDto.role;
    }

    if (storeMemberDto.services) {
      storeMember.services = storeMemberDto.services as Service[];
    }

    if (typeof storeMemberDto.isActive === 'boolean') {
      storeMember.isActive = storeMemberDto.isActive;
    }

    return this.storeMemberRepository.save(storeMember);
  }

  async delete(
    storeId: string,
    id: string,
  ): Promise<{ id: string; store: Store }> {
    await this.storeMemberRepository.delete({
      id,
      store: { id: storeId },
    });

    return { id, store: { id: storeId } as Store };
  }

  /**
   * PRO_LIMIT === 0 means unlimited (matches partner UI). `storeId` counts that
   * store even while inactive: a draft has no active members otherwise, and the
   * limit would only be noticed after it went live.
   */
  async getProfessionalUsage(ownerUserId: string, storeId?: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        user: { id: ownerUserId },
        status: In(['active', 'paid', 'trialing']),
        currentPeriodEnd: MoreThanOrEqual(new Date()),
      },
    });

    const limit = subscription?.features?.PRO_LIMIT ?? 0;

    const count = await this.storeMemberRepository
      .createQueryBuilder('member')
      .innerJoin('member.store', 'store')
      .innerJoin('store.owner', 'owner')
      .where('owner.id = :ownerUserId', { ownerUserId })
      .andWhere('(store.isActive = true OR store.id = :storeId)', {
        storeId: storeId ?? null,
      })
      .andWhere('store.isDeleted = false')
      .andWhere('member.isDeleted = false')
      .getCount();

    return { count, limit };
  }

  private async assertWithinProfessionalLimit(
    ownerUserId: string,
    storeId?: string,
  ) {
    const { count: currentCount, limit: proLimit } =
      await this.getProfessionalUsage(ownerUserId, storeId);

    if (!proLimit) {
      return;
    }

    if (currentCount >= proLimit) {
      throw new ForbiddenException(
        `Limite de profissionais do plano atingido (${currentCount}/${proLimit}). Faça upgrade para adicionar mais.`,
      );
    }
  }
}
