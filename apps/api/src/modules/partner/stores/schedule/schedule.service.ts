import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import {
  Between,
  EntityManager,
  In,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import {
  AvailabilitySlot,
  buildAvailabilitySlots,
  calculateEndTime,
  hasScheduleConflict,
  isSlotBookable,
  timeToMinutes,
  toDateKey,
} from '../../../../utils/helpers/schedule.helpers';
import type { TSlotRequest } from '../../../../utils/helpers/schedule.types';
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
import { buildSchedulePriceSnapshot } from './schedule.helpers';

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
          // Profissional pausado não recebe reserva nova
          isActive: true,
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
      (store) => this.upsertCustomer(scheduleDto.user, store.country),
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
      (store) =>
        isStaff
          ? this.upsertCustomer(scheduleDto.user, store.country)
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

  /** Telefone sem DDI é lido como do país da loja. */
  private async upsertCustomer(
    contact: Partial<User> | undefined,
    storeCountry?: string | null,
  ): Promise<User> {
    const telephone = normalizePhoneNumber(contact?.telephone, storeCountry);

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
    resolveCustomer: (store: Store) => Promise<User>,
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

    // Sem os três não há como checar conflito, e a reserva entraria direto
    if (!storeMemberId || !scheduleDto.date || !scheduleDto.startTime) {
      throw new BadRequestException(
        'Professional, date and start time are required',
      );
    }

    await this.assertMemberInStore(storeId, storeMemberId);

    let endTime = '';

    const schedules = scheduleDto.services.map((service) => {
      const startTime = !endTime ? scheduleDto.startTime : endTime;
      // A duração vem da loja: a do corpo encurtaria a checagem de conflito
      const { duration, price } = storeServices.find(
        ({ id }) => id === service.id,
      );
      const scheduleEndTime = calculateEndTime(startTime, duration);

      const nextSchedule = {
        ...scheduleDto,
        // Com `id` no corpo, o save sobrescreveria um agendamento existente
        id: undefined,
        startTime,
        endTime: scheduleEndTime,
        service: { id: service.id },
        services: undefined,
        // Preço e moeda do momento da reserva: mudar o serviço depois não
        // reescreve o histórico de receita
        ...buildSchedulePriceSnapshot(price, store),
      };

      endTime = scheduleEndTime;

      return nextSchedule;
    });

    const savedSchedules = await this.inSlotTransaction(
      async (manager) => {
        await this.assertMemberFree(manager, {
          store,
          storeMemberId,
          date: toDateKey(scheduleDto.date),
          items: schedules,
          // A loja pode encaixar fora do expediente; o cliente só pega o que é oferecido
          enforceAvailability: !createdByStore,
        });

        const user = await resolveCustomer(store);

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

  /**
   * Transação de quem ocupa um horário. Se algo escapar da checagem em
   * `assertMemberFree`, a constraint do banco recusa (23P01) e vira o mesmo 409.
   */
  private async inSlotTransaction<T>(
    work: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.scheduleRepository.manager.transaction(work);
    } catch (error) {
      const code = (error as { driverError?: { code?: string } }).driverError
        ?.code;

      if (code === '23P01') {
        throw new ConflictException(
          'Professional already has a schedule at this time',
        );
      }

      throw error;
    }
  }

  /** Membro ativo da loja. Fora da transação: ver `assertMemberFree`. */
  private async assertMemberInStore(storeId: string, storeMemberId: string) {
    const exists = await this.storeMemberRepository.exists({
      where: {
        id: storeMemberId,
        store: { id: storeId },
        isActive: true,
        isDeleted: false,
      },
    });

    if (!exists) {
      throw new BadRequestException('Professional not found in this store');
    }
  }

  /**
   * Trava o profissional, para duas reservas simultâneas não passarem juntas, e
   * recusa o horário que cruza outro atendimento. A trava busca só pelo id:
   * filtrar por relação gera LEFT JOIN, e o Postgres recusa FOR UPDATE nesse caso.
   */
  private async assertMemberFree(
    manager: EntityManager,
    {
      store,
      storeMemberId,
      date,
      items,
      excludeId,
      enforceAvailability,
    }: TSlotRequest,
  ) {
    await manager.findOne(StoreMember, {
      where: { id: storeMemberId },
      lock: { mode: 'pessimistic_write' },
    });

    const existing = await manager.find(Schedule, {
      where: {
        ...(excludeId && { id: Not(excludeId) }),
        storeMember: { id: storeMemberId },
        date: date as unknown as Date,
      },
    });

    if (hasScheduleConflict(existing, items)) {
      throw new ConflictException(
        'Professional already has a schedule at this time',
      );
    }

    if (!enforceAvailability) return;

    const blockedTimes = await manager.find(BlockedTime, {
      where: [
        { storeMember: { id: storeMemberId }, date: date as unknown as Date },
        { storeMember: { id: storeMemberId }, isRecurring: true },
      ],
    });
    const [first] = items;
    const last = items[items.length - 1];
    const isBookable = isSlotBookable(
      {
        store,
        date,
        durationMinutes:
          timeToMinutes(last.endTime) - timeToMinutes(first.startTime),
        members: [{ id: storeMemberId, blockedTimes, schedules: existing }],
      },
      first.startTime,
    );

    // 409 como no conflito: web e bot já pedem outro horário nesse caso
    if (!isBookable) {
      throw new ConflictException('This time is not available');
    }
  }

  /**
   * Grava só status, observação e, se vierem, dia, horário e profissional. O
   * resto do corpo (cliente, serviço, preço, loja) nunca é escrito por aqui.
   */
  async update(schedule: ScheduleDto): Promise<Schedule> {
    const before = await this.scheduleNotifications.load(schedule.id);

    if (!before || before.store?.id !== schedule.store.id) {
      throw new NotFoundException('Schedule not found');
    }

    const beforeDate = before.date && toDateKey(before.date);
    const date = schedule.date ? toDateKey(schedule.date) : beforeDate;
    const startTime = schedule.startTime ?? before.startTime;
    const storeMemberId = schedule.storeMember?.id ?? before.storeMember?.id;
    const isMoved =
      date !== beforeDate ||
      startTime !== before.startTime ||
      storeMemberId !== before.storeMember?.id;
    // Mantém a duração reservada: a do serviço pode ter mudado desde então
    const next = {
      startTime,
      endTime: isMoved
        ? calculateEndTime(
            startTime,
            timeToMinutes(before.endTime) - timeToMinutes(before.startTime),
          )
        : before.endTime,
    };
    // Reativar um cancelado ocupa o horário de novo, então também é checado
    const needsSlot =
      schedule.status !== 'cancelled' &&
      (isMoved || before.status === 'cancelled');

    if (storeMemberId !== before.storeMember?.id) {
      await this.assertMemberInStore(schedule.store.id, storeMemberId);
    }

    await this.inSlotTransaction(async (manager) => {
      if (needsSlot && storeMemberId && date && startTime) {
        await this.assertMemberFree(manager, {
          store: before.store,
          storeMemberId,
          date,
          items: [next],
          excludeId: schedule.id,
          enforceAvailability: false,
        });
      }

      await manager.update(
        Schedule,
        { id: schedule.id },
        {
          status: schedule.status,
          ...(schedule.notes !== undefined && { notes: schedule.notes }),
          ...(isMoved && {
            ...next,
            date: date as unknown as Date,
            storeMember: { id: storeMemberId },
          }),
        },
      );
    });

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

  /** Próximos atendimentos marcados de um cliente na loja, achado pelo telefone. */
  async findUpcomingForCustomer(
    storeId: string,
    telephone: string,
    fromDate: string,
  ): Promise<Schedule[]> {
    const phone = normalizePhoneNumber(telephone);

    // Sem telefone o filtro some e a busca traria clientes de outras pessoas
    if (!phone) return [];

    const schedules = await this.scheduleRepository.find({
      where: {
        store: { id: storeId },
        user: { telephone: phone },
        status: 'scheduled',
        date: MoreThanOrEqual(fromDate as unknown as Date),
      },
      relations: ['service', 'storeMember', 'storeMember.user', 'user'],
      order: { date: 'ASC', startTime: 'ASC' },
      take: 20,
    });

    return schedules.map(toScheduleResponse);
  }

  /**
   * Muda dia, horário e profissional de um atendimento marcado. Mesma trava e
   * checagem de conflito da reserva, sem contar o próprio atendimento.
   */
  async reschedule(
    storeId: string,
    scheduleId: string,
    {
      date,
      startTime,
      storeMemberId,
    }: { date: string; startTime: string; storeMemberId: string },
  ): Promise<Schedule> {
    const before = await this.scheduleNotifications.load(scheduleId);

    if (
      !before ||
      before.store?.id !== storeId ||
      before.status !== 'scheduled'
    ) {
      throw new NotFoundException('Schedule not found');
    }

    await this.assertMemberInStore(storeId, storeMemberId);

    const next = {
      startTime,
      endTime: calculateEndTime(startTime, before.service?.duration ?? 0),
    };

    await this.inSlotTransaction(async (manager) => {
      // Só o bot remarca por aqui, em nome do cliente: vale a regra do cliente
      await this.assertMemberFree(manager, {
        store: before.store,
        storeMemberId,
        date,
        items: [next],
        excludeId: scheduleId,
        enforceAvailability: true,
      });

      await manager.update(
        Schedule,
        { id: scheduleId },
        {
          ...next,
          date: date as unknown as Date,
          storeMember: { id: storeMemberId },
        },
      );
    });

    const after = await this.scheduleNotifications.load(scheduleId);

    await this.scheduleNotifications.notifyUpdate(before, after);

    return toScheduleResponse(after);
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
