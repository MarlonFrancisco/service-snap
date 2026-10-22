import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async create(storeMemberDto: CreateStoreMemberDto): Promise<StoreMember> {
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
}
