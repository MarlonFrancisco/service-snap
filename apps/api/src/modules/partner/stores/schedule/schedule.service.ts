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
import type { User } from '../../../users/user.entity';
import { UsersService } from '../../../users/users.service';
import { isStoreDraft } from '../../onboarding/onboarding.helpers';
import { Service } from '../category/service/service.entity';
import { BlockedTime } from '../store-member/blocked-time/blocked-time.entity';
import { StoreMember } from '../store-member/store-member.entity';
import { Store } from '../store.entity';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { CreateSchedulesDto } from './dto/create-schedule.dto';
import { ScheduleDto } from './dto/schedule.dto';
import { ScheduleNotificationsService } from './schedule-notifications.service';
import { Schedule } from './schedule.entity';

/**
 * Lista do que sai nas respostas de agendamento, para coluna nova em `User` não
 * vazar sozinha: ali está o código de login (`authCode`).
 */
const toScheduleResponse = (schedule: Schedule) =>
  ({
    ...schedule,
    user: schedule.user && {
      id: schedule.user.id,
      firstName: schedule.user.firstName,
      lastName: schedule.user.lastName,
      email: schedule.user.email,
      telephone: schedule.user.telephone,
    },
    storeMember: schedule.storeMember && {
      ...schedule.storeMember,
      user: schedule.storeMember.user && {
        firstName: schedule.storeMember.user.firstName,
        lastName: schedule.storeMember.user.lastName,
      },
    },
  }) as Schedule;

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
    private readonly scheduleNotifications: ScheduleNotificationsService,
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

  /** Para quem não tem login, como o bot de WhatsApp: o contato vem da conversa. */
  async create(scheduleDto: CreateSchedulesDto): Promise<Schedule[]> {
    return this.createSchedules(
      scheduleDto,
      () => this.upsertCustomer(scheduleDto.user),
      false,
    );
  }

  /** Cliente agenda para si; só quem opera a loja agenda para o contato enviado. */
  async createForRequester(
    scheduleDto: CreateSchedulesDto,
    requesterId: string,
  ): Promise<Schedule[]> {
    const isStaff = await this.isStoreStaff(scheduleDto.store?.id, requesterId);

    return this.createSchedules(
      scheduleDto,
      () =>
        isStaff
          ? this.upsertCustomer(scheduleDto.user)
          : this.usersService.findById(requesterId),
      isStaff,
    );
  }

  private async isStoreStaff(
    storeId: string,
    userId: string,
  ): Promise<boolean> {
    const isMember = await this.storeMemberRepository.exists({
      where: {
        store: { id: storeId },
        user: { id: userId },
        isActive: true,
        isDeleted: false,
      },
    });

    return (
      isMember ||
      this.storeRepository.exists({
        where: { id: storeId, owner: { id: userId } },
      })
    );
  }

  private async upsertCustomer(contact?: Partial<User>): Promise<User> {
    const telephone = normalizePhoneNumber(contact?.telephone);

    // Sem contato, a busca do upsert fica sem filtro e devolve um usuário qualquer
    if (!contact?.email && !telephone) {
      throw new BadRequestException('Customer contact is required');
    }

    return this.usersService.upsert({
      email: contact.email,
      telephone,
      firstName: contact.firstName,
      lastName: contact.lastName,
    });
  }

  private async createSchedules(
    scheduleDto: CreateSchedulesDto,
    resolveCustomer: () => Promise<User>,
    createdByStore: boolean,
  ): Promise<Schedule[]> {
    const storeId = scheduleDto.store?.id;
    const store =
      storeId &&
      (await this.storeRepository.findOne({
        where: { id: storeId },
        relations: ['onboarding'],
      }));

    if (!store || isStoreDraft(store)) {
      throw new NotFoundException('Store not found');
    }

    const serviceIds = [...new Set(scheduleDto.services.map(({ id }) => id))];
    const storeServices = await this.serviceRepository.find({
      where: { id: In(serviceIds), store: { id: storeId } },
    });

    if (storeServices.length !== serviceIds.length) {
      throw new BadRequestException('Service not found in this store');
    }

    const storeMemberId = scheduleDto.storeMember?.id;

    // Fora da trava abaixo: filtrar por relação gera LEFT JOIN, e o Postgres
    // recusa FOR UPDATE nesse caso.
    if (
      storeMemberId &&
      !(await this.storeMemberRepository.exists({
        where: {
          id: storeMemberId,
          store: { id: storeId },
          isDeleted: false,
        },
      }))
    ) {
      throw new BadRequestException('Professional not found in this store');
    }

    let endTime = '';

    const schedules = scheduleDto.services.map((service) => {
      const startTime = !endTime ? scheduleDto.startTime : endTime;
      // A duração vem da loja: a do corpo encurtaria a checagem de conflito
      const { duration } = storeServices.find(({ id }) => id === service.id);
      const scheduleEndTime = calculateEndTime(startTime, duration);

      const nextSchedule = {
        ...scheduleDto,
        // Com `id` no corpo, o save sobrescreveria um agendamento existente
        id: undefined,
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

        const user = await resolveCustomer();

        return manager.save(
          Schedule,
          schedules.map((schedule) => ({ ...schedule, user })),
        );
      },
    );

    const savedIds = savedSchedules.map((schedule) => schedule.id);
    const created = await this.scheduleRepository.find({
      where: { id: In(savedIds) },
      relations: ['storeMember', 'storeMember.user', 'user', 'service'],
    });

    await this.scheduleNotifications.notifyBookingCreated(
      savedIds,
      createdByStore,
    );

    return created.map(toScheduleResponse);
  }

  async findAll(storeId: string): Promise<Schedule[]> {
    const schedules = await this.scheduleRepository.find({
      where: { store: { id: storeId } },
      relations: ['storeMember', 'storeMember.user', 'user', 'service'],
    });

    return schedules.map(toScheduleResponse);
  }

  async findOne(id: string, relations: string[] = []): Promise<Schedule> {
    return this.scheduleRepository.findOne({ where: { id }, relations });
  }

  async update(schedule: ScheduleDto): Promise<Schedule> {
    const before = await this.scheduleNotifications.load(schedule.id);
    const result = await this.scheduleRepository.update(
      { id: schedule.id, store: { id: schedule.store.id } },
      schedule,
    );

    if (!result.affected) {
      throw new NotFoundException('Schedule not found');
    }

    await this.scheduleNotifications.notifyUpdate(
      before,
      await this.scheduleNotifications.load(schedule.id),
    );

    return this.findOne(schedule.id);
  }

  async delete(
    storeId: string,
    id: string,
    requesterId: string,
  ): Promise<{ id: string }> {
    const schedule = await this.scheduleNotifications.load(id);
    const result = await this.scheduleRepository.update(
      { id, store: { id: storeId } },
      { status: 'cancelled' },
    );

    if (!result.affected) {
      throw new NotFoundException('Schedule not found');
    }

    // Repetir o cancelamento não pode reenviar os avisos
    if (schedule.status !== 'cancelled') {
      await this.scheduleNotifications.notifyCancellation(
        schedule,
        schedule.user?.id === requesterId,
      );
    }

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
