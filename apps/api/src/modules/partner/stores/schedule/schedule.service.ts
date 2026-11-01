import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Between, In, Repository } from 'typeorm';
import {
  AvailabilitySlot,
  buildAvailabilitySlots,
  calculateEndTime,
  hasScheduleConflict,
  toDateKey,
} from '../../../../utils/helpers/schedule.helpers';
import { normalizePhoneNumber } from '../../../../utils/helpers/user.helpers';
import { UsersService } from '../../../users/users.service';
import { isStoreDraft } from '../../onboarding/onboarding.helpers';
import { Service } from '../category/service/service.entity';
import { BlockedTime } from '../store-member/blocked-time/blocked-time.entity';
import { StoreMember } from '../store-member/store-member.entity';
import { Store } from '../store.entity';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { CreateSchedulesDto } from './dto/create-schedule.dto';
import { ScheduleDto } from './dto/schedule.dto';
import { Schedule } from './schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(StoreMember)
    private readonly storeMemberRepository: Repository<StoreMember>,
    @InjectRepository(BlockedTime)
    private readonly blockedTimeRepository: Repository<BlockedTime>,
    private readonly usersService: UsersService,
  ) {}

  async getAvailability(
    storeId: string,
    { date, serviceIds, memberId }: AvailabilityQueryDto,
  ): Promise<AvailabilitySlot[]> {
    const ids = serviceIds.split(',');

    if (!ids.every((id) => isUUID(id))) {
      throw new BadRequestException('serviceIds must be a list of UUIDs');
    }

    const uniqueIds = [...new Set(ids)];

    const [store, services, members] = await Promise.all([
      this.storeRepository.findOne({
        where: { id: storeId },
        relations: ['onboarding'],
      }),
      this.serviceRepository.find({
        where: { id: In(uniqueIds), store: { id: storeId } },
      }),
      this.storeMemberRepository.find({
        where: {
          store: { id: storeId },
          role: 'professional',
          ...(memberId && { id: memberId }),
        },
        relations: ['services'],
        order: { createdAt: 'ASC' },
      }),
    ]);

    if (!store || isStoreDraft(store)) {
      throw new NotFoundException('Store not found');
    }

    if (services.length !== uniqueIds.length) {
      throw new BadRequestException('Service not found in this store');
    }

    const durationMinutes = ids.reduce(
      (total, id) =>
        total + services.find((service) => service.id === id).duration,
      0,
    );

    const eligibleMembers = members.filter(
      (member) =>
        !member.isDeleted &&
        uniqueIds.every((id) => member.services.some((s) => s.id === id)),
    );
    const memberIds = eligibleMembers.map((member) => member.id);

    const [schedules, blockedTimes] = await Promise.all([
      this.scheduleRepository.find({
        where: {
          storeMember: { id: In(memberIds) },
          date: date as unknown as Date,
        },
        relations: ['storeMember'],
      }),
      this.blockedTimeRepository.find({
        where: [
          {
            storeMember: { id: In(memberIds) },
            date: date as unknown as Date,
          },
          { storeMember: { id: In(memberIds) }, isRecurring: true },
        ],
        relations: ['storeMember'],
      }),
    ]);

    return buildAvailabilitySlots({
      store,
      date,
      durationMinutes,
      members: eligibleMembers.map((member) => ({
        id: member.id,
        schedules: schedules.filter((s) => s.storeMember.id === member.id),
        blockedTimes: blockedTimes.filter(
          (blocked) => blocked.storeMember.id === member.id,
        ),
      })),
    });
  }

  async create(scheduleDto: CreateSchedulesDto): Promise<Schedule[]> {
    if (scheduleDto.store?.id) {
      const store = await this.storeRepository.findOne({
        where: { id: scheduleDto.store.id },
        relations: ['onboarding'],
      });

      if (store && isStoreDraft(store)) {
        throw new NotFoundException('Store not found');
      }
    }

    let endTime = '';

    const schedules = scheduleDto.services.map((service) => {
      const startTime = !endTime ? scheduleDto.startTime : endTime;
      const scheduleEndTime = calculateEndTime(startTime, service.duration);

      const nextSchedule = {
        ...scheduleDto,
        startTime,
        endTime: scheduleEndTime,
        service: { id: service.id },
        services: undefined,
      };

      endTime = scheduleEndTime;

      return nextSchedule;
    });

    const savedSchedules = await this.scheduleRepository.manager.transaction(
      async (manager) => {
        const storeMemberId = scheduleDto.storeMember?.id;

        if (storeMemberId && scheduleDto.date) {
          // Trava o profissional para duas reservas simultâneas não passarem juntas
          await manager.findOne(StoreMember, {
            where: { id: storeMemberId },
            lock: { mode: 'pessimistic_write' },
          });

          const existing = await manager.find(Schedule, {
            where: {
              storeMember: { id: storeMemberId },
              date: toDateKey(scheduleDto.date) as unknown as Date,
            },
          });

          if (hasScheduleConflict(existing, schedules)) {
            throw new ConflictException(
              'Professional already has a schedule at this time',
            );
          }
        }

        const user = await this.usersService.upsert({
          email: scheduleDto.user?.email,
          telephone: normalizePhoneNumber(scheduleDto.user?.telephone),
          firstName: scheduleDto.user?.firstName,
          lastName: scheduleDto.user?.lastName,
        });

        return manager.save(
          Schedule,
          schedules.map((schedule) => ({ ...schedule, user })),
        );
      },
    );

    return await this.scheduleRepository.find({
      where: { id: In(savedSchedules.map((schedule) => schedule.id)) },
      relations: ['storeMember', 'storeMember.user', 'user', 'service'],
    });
  }

  async findAll(storeId: string): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      where: { store: { id: storeId } },
      relations: ['storeMember', 'storeMember.user', 'user', 'service'],
    });
  }

  async findOne(id: string, relations: string[] = []): Promise<Schedule> {
    return this.scheduleRepository.findOne({ where: { id }, relations });
  }

  async update(schedule: ScheduleDto): Promise<Schedule> {
    await this.scheduleRepository.update(schedule.id, schedule);
    return this.findOne(schedule.id);
  }

  async delete(id: string): Promise<{ id: string }> {
    await this.scheduleRepository.update(id, { status: 'cancelled' });
    return { id };
  }

  async getSchedulesByMonth(
    storeOwnerId: string,
    day: number,
    month: number,
    year: number,
  ): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      where: {
        date: Between(
          new Date(year, month, day),
          new Date(year, month + 1, day),
        ),
        store: {
          owner: {
            id: storeOwnerId,
          },
        },
      },
    });
  }
}
