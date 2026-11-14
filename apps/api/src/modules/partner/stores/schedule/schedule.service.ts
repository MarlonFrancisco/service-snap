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
  type FindOperator,
  In,
  LessThanOrEqual,
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
import { StoreCustomer } from '../customer/customer.entity';
import {
  assertOwnAgenda,
  isProfessionalOnly,
  type TStoreActor,
} from '../guards';
import { HolidayService } from '../holiday/holiday.service';
import { BlockedTime } from '../store-member/blocked-time/blocked-time.entity';
import { StoreMember } from '../store-member/store-member.entity';
import { Store } from '../store.entity';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { CreateSchedulesDto } from './dto/create-schedule.dto';
import { ScheduleDto } from './dto/schedule.dto';
import { ScheduleNotificationsService } from './schedule-notifications.service';
import { Booking } from './booking.entity';
import { Schedule } from './schedule.entity';
import {
  assertWithinNotice,
  buildSchedulePriceSnapshot,
  shiftItems,
} from './schedule.helpers';
import type {
  TBookingSource,
  TRescheduleRequest,
  TScheduleActor,
  TScheduleListQuery,
} from './schedule.types';
import {
  toPage,
  toSkipTake,
} from '../../../../utils/helpers/pagination.helpers';
import type { TPage } from '../../../../utils/helpers/pagination.types';

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
    private readonly holidayService: HolidayService,
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

    const [schedules, blockedTimes, isHoliday] = await Promise.all([
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
      this.holidayService.isHoliday(storeId, date),
    ]);

    return buildAvailabilitySlots({
      store,
      date,
      durationMinutes,
      isHoliday,
      members: eligibleMembers.map((member) => ({
        id: member.id,
        workingHours: member.workingHours,
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
      'whatsapp',
    );
  }

  /** Cliente agenda para si; só quem opera a loja agenda para o contato enviado. */
  async createForRequester(
    scheduleDto: CreateSchedulesDto,
    requesterId: string,
  ): Promise<Schedule[]> {
    const actor = await this.getStaffActor(scheduleDto.store?.id, requesterId);
    const isStaff = !!actor;

    // Profissional marca só na própria agenda
    assertOwnAgenda(actor, scheduleDto.storeMember?.id);

    return this.createSchedules(
      scheduleDto,
      (store) =>
        isStaff
          ? this.resolveStaffCustomer(scheduleDto.user, store)
          : this.usersService.findById(requesterId),
      isStaff,
      isStaff ? 'store' : 'customer',
    );
  }

  /** Papel de quem pede na loja; `null` para quem é de fora (o cliente). */
  private async getStaffActor(
    storeId: string,
    userId: string,
  ): Promise<TStoreActor | null> {
    if (!storeId || !userId) return null;

    const [member, isOwner] = await Promise.all([
      this.storeMemberRepository.findOne({
        where: {
          store: { id: storeId },
          user: { id: userId },
          isActive: true,
          isDeleted: false,
        },
        select: { id: true, role: true },
      }),
      this.storeRepository.exists({
        where: { id: storeId, owner: { id: userId } },
      }),
    ]);

    // O dono vale como dono mesmo cadastrado como profissional na equipe
    if (isOwner) return { role: 'owner', storeMemberId: member?.id };

    return member ? { role: member.role, storeMemberId: member.id } : null;
  }

  private async isStoreStaff(storeId: string, userId: string) {
    return !!(await this.getStaffActor(storeId, userId));
  }

  /**
   * Cliente do agendamento manual: um já cadastrado na loja (pelo `id`, vindo
   * da busca de clientes) ou um contato novo, mesmo sem conta.
   */
  private async resolveStaffCustomer(
    contact: Partial<User> | undefined,
    store: Store,
  ): Promise<User> {
    if (!contact?.id) return this.upsertCustomer(contact, store.country);

    // Só quem já é cliente da loja: um id qualquer ligaria a reserva a outra conta
    const manager = this.scheduleRepository.manager;
    const isCustomer =
      (await manager.exists(Schedule, {
        where: { store: { id: store.id }, user: { id: contact.id } },
      })) ||
      (await manager.exists(StoreCustomer, {
        where: { store: { id: store.id }, user: { id: contact.id } },
      }));

    if (!isCustomer) {
      throw new BadRequestException('Customer not found in this store');
    }

    return this.usersService.findById(contact.id);
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
    source: TBookingSource,
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
    await this.assertMemberPerformsServices(storeMemberId, serviceIds);

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

    const savedSchedules = await this.inSlotTransaction(async (manager) => {
      await this.assertMemberFree(manager, {
        store,
        storeMemberId,
        date: toDateKey(scheduleDto.date),
        items: schedules,
        // A loja pode encaixar fora do expediente; o cliente só pega o que é oferecido
        enforceAvailability: !createdByStore,
      });

      const user = await resolveCustomer(store);
      // Registro pai: os serviços desta reserva cancelam e remarcam juntos
      const booking = await manager.save(Booking, {
        store: { id: store.id },
        user: { id: user.id },
        source,
      });

      return manager.save(
        Schedule,
        schedules.map((schedule) => ({
          ...schedule,
          user,
          booking: { id: booking.id },
        })),
      );
    });

    const savedIds = savedSchedules.map((schedule) => schedule.id);
    const created = await this.scheduleRepository.find({
      where: { id: In(savedIds) },
      relations: [
        'storeMember',
        'storeMember.user',
        'user',
        'service',
        'booking',
      ],
      order: { startTime: 'ASC' },
    });

    await this.scheduleNotifications.notifyBookingCreated(
      savedIds,
      createdByStore,
    );

    return created.map(toScheduleResponse);
  }

  /**
   * Agenda da loja. Com `from`/`to` carrega só o período (a agenda pede a semana
   * ou o mês que mostra); com `page`, devolve uma página e o total. Sem nada,
   * mantém a resposta antiga: todos os agendamentos.
   */
  async findAll(
    storeId: string,
    {
      from,
      to,
      memberId: requestedMemberId,
      page,
      limit,
    }: TScheduleListQuery = {},
    requesterId?: string,
  ): Promise<Schedule[] | TPage<Schedule>> {
    const actor = requesterId
      ? await this.getStaffActor(storeId, requesterId)
      : null;
    // Profissional vê só a própria agenda, peça o filtro que pedir
    const memberId = isProfessionalOnly(actor)
      ? actor.storeMemberId
      : requestedMemberId;
    const date =
      from && to
        ? Between(from, to)
        : from
          ? MoreThanOrEqual(from)
          : to
            ? LessThanOrEqual(to)
            : undefined;
    const options = {
      where: {
        store: { id: storeId },
        ...(memberId && { storeMember: { id: memberId } }),
        ...(date && { date: date as unknown as FindOperator<Date> }),
      },
      relations: [
        'storeMember',
        'storeMember.user',
        'user',
        'service',
        'booking',
      ],
      order: { date: 'ASC' as const, startTime: 'ASC' as const },
    };

    if (!page) {
      const schedules = await this.scheduleRepository.find(options);

      return schedules.map(toScheduleResponse);
    }

    const { skip, take } = toSkipTake(page, limit);
    const [schedules, total] = await this.scheduleRepository.findAndCount({
      ...options,
      skip,
      take,
    });

    return toPage(schedules.map(toScheduleResponse), total, page, take);
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

  /** O profissional precisa ter todos os serviços pedidos no cadastro dele. */
  private async assertMemberPerformsServices(
    storeMemberId: string,
    serviceIds: string[],
  ) {
    const ids = [...new Set(serviceIds.filter(Boolean))];

    if (!ids.length) return;

    const performed = await this.serviceRepository.find({
      where: { id: In(ids), storeMembers: { id: storeMemberId } },
      select: { id: true },
    });

    if (performed.length !== ids.length) {
      throw new BadRequestException(
        'Professional does not perform the requested service',
      );
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
      excludeIds = [],
      enforceAvailability,
    }: TSlotRequest,
  ) {
    const member = await manager.findOne(StoreMember, {
      where: { id: storeMemberId },
      lock: { mode: 'pessimistic_write' },
    });

    const existing = await manager.find(Schedule, {
      where: {
        // Um id só mantém o filtro simples; vários viram NOT IN
        ...(excludeIds.length === 1 && { id: Not(excludeIds[0]) }),
        ...(excludeIds.length > 1 && { id: Not(In(excludeIds)) }),
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

    const [blockedTimes, isHoliday] = await Promise.all([
      manager.find(BlockedTime, {
        where: [
          { storeMember: { id: storeMemberId }, date: date as unknown as Date },
          { storeMember: { id: storeMemberId }, isRecurring: true },
        ],
      }),
      this.holidayService.isHoliday(store.id, date),
    ]);
    const [first] = items;
    const last = items[items.length - 1];
    const isBookable = isSlotBookable(
      {
        store,
        date,
        isHoliday,
        durationMinutes:
          timeToMinutes(last.endTime) - timeToMinutes(first.startTime),
        members: [
          {
            id: storeMemberId,
            workingHours: member?.workingHours,
            blockedTimes,
            schedules: existing,
          },
        ],
      },
      first.startTime,
    );

    // 409 como no conflito: web e bot já pedem outro horário nesse caso
    if (!isBookable) {
      throw new ConflictException('This time is not available');
    }
  }

  /**
   * Linhas da mesma visita, na ordem do atendimento. Agendamento antigo, sem
   * `booking`, é um grupo de uma linha só.
   */
  private async loadGroup(schedule: Schedule): Promise<Schedule[]> {
    if (!schedule.booking?.id) return [schedule];

    const group = await this.scheduleRepository.find({
      where: { booking: { id: schedule.booking.id } },
      relations: ['service'],
      order: { startTime: 'ASC' },
    });

    return group.length ? group : [schedule];
  }

  /**
   * Horário reservado de cada linha. Registro sem fim usa a duração do serviço,
   * e sem início parte do horário pedido.
   */
  private toSlotItems(group: Schedule[], fallbackStart: string) {
    return group.map((row) => {
      const startTime = row.startTime ?? fallbackStart;

      return {
        id: row.id,
        startTime,
        endTime:
          row.endTime ??
          calculateEndTime(startTime, row.service?.duration ?? 0),
      };
    });
  }

  /** Grava os novos horários: uma atualização por linha, cada uma com o seu. */
  private async saveMoves(
    manager: EntityManager,
    moves: { id: string; startTime: string; endTime: string }[],
    date: string,
    storeMemberId: string,
  ) {
    for (const move of moves) {
      await manager.update(
        Schedule,
        { id: move.id },
        {
          date: date as unknown as Date,
          startTime: move.startTime,
          endTime: move.endTime,
          storeMember: { id: storeMemberId },
          // A confirmação de presença valia para o horário antigo
          presenceConfirmedAt: null,
        },
      );
    }
  }

  /**
   * Edição da loja: status, observação e, se vierem, dia, horário e profissional.
   * Mover ou mudar o status age sobre a visita inteira; a observação é da linha.
   * O resto do corpo (cliente, serviço, preço, loja) nunca é escrito por aqui.
   */
  async update(schedule: ScheduleDto, requesterId?: string): Promise<Schedule> {
    const before = await this.scheduleNotifications.load(schedule.id);

    if (!before || before.store?.id !== schedule.store.id) {
      throw new NotFoundException('Schedule not found');
    }

    if (requesterId) {
      assertOwnAgenda(
        await this.getStaffActor(schedule.store.id, requesterId),
        before.storeMember?.id,
        schedule.storeMember?.id ?? before.storeMember?.id,
      );
    }

    const group = await this.loadGroup(before);
    const ids = group.map(({ id }) => id);
    const beforeDate = before.date && toDateKey(before.date);
    const date = schedule.date ? toDateKey(schedule.date) : beforeDate;
    const startTime = schedule.startTime ?? before.startTime;
    const storeMemberId = schedule.storeMember?.id ?? before.storeMember?.id;
    const isMoved =
      date !== beforeDate ||
      startTime !== before.startTime ||
      storeMemberId !== before.storeMember?.id;
    const items = this.toSlotItems(group, startTime);
    // A linha editada vai para `startTime`; as outras andam a mesma distância
    const delta =
      before.startTime && startTime
        ? timeToMinutes(startTime) - timeToMinutes(before.startTime)
        : 0;
    const moves =
      isMoved && items[0]?.startTime
        ? shiftItems(items, calculateEndTime(items[0].startTime, delta))
        : items;
    // Reativar um cancelado ocupa o horário de novo, então também é checado
    const needsSlot =
      schedule.status !== 'cancelled' &&
      (isMoved || before.status === 'cancelled');

    if (storeMemberId !== before.storeMember?.id) {
      await this.assertMemberInStore(schedule.store.id, storeMemberId);
      await this.assertMemberPerformsServices(
        storeMemberId,
        group.map((row) => row.service?.id),
      );
    }

    await this.inSlotTransaction(async (manager) => {
      if (needsSlot && storeMemberId && date && startTime) {
        await this.assertMemberFree(manager, {
          store: before.store,
          storeMemberId,
          date,
          items: moves,
          excludeIds: ids,
          enforceAvailability: false,
        });
      }

      if (schedule.status && schedule.status !== before.status) {
        await manager.update(
          Schedule,
          ids.length > 1 ? { id: In(ids) } : { id: schedule.id },
          { status: schedule.status },
        );
      }

      if (schedule.notes !== undefined) {
        await manager.update(
          Schedule,
          { id: schedule.id },
          { notes: schedule.notes },
        );
      }

      if (isMoved) {
        await this.saveMoves(manager, moves, date, storeMemberId);
      }
    });

    await this.scheduleNotifications.notifyUpdate(
      before,
      await this.scheduleNotifications.load(schedule.id),
    );

    return this.findOne(schedule.id);
  }

  /**
   * Cancela a visita inteira. Quem não é da equipe (o cliente, ou o bot em nome
   * dele) só cancela dentro da política da loja.
   */
  /** `asStore`: a própria loja cancela (ex.: integração pela API pública). */
  async delete(
    storeId: string,
    id: string,
    requesterId: string,
    { asStore = false }: { asStore?: boolean } = {},
  ): Promise<{ id: string }> {
    const schedule = await this.scheduleNotifications.load(id);
    const group = schedule ? await this.loadGroup(schedule) : [];
    const isActive = !!schedule && schedule.status !== 'cancelled';
    const actor =
      schedule?.store?.id === storeId
        ? await this.getStaffActor(storeId, requesterId)
        : null;

    // O profissional cancela só o que é da agenda dele; o cliente passou no guard
    if (actor) assertOwnAgenda(actor, schedule.storeMember?.id);

    if (
      isActive &&
      schedule?.store?.id === storeId &&
      schedule.date &&
      group[0]?.startTime &&
      !actor &&
      !asStore
    ) {
      assertWithinNotice('cancel', schedule.store, {
        date: schedule.date,
        startTime: group[0].startTime,
      });
    }

    const ids = group.length ? group.map((row) => row.id) : [id];
    // O filtro pela loja da URL é o que impede cancelar agendamento de outra loja
    const result = await this.scheduleRepository.update(
      ids.length > 1
        ? { id: In(ids), store: { id: storeId } }
        : { id, store: { id: storeId } },
      { status: 'cancelled' },
    );

    if (!result.affected) {
      throw new NotFoundException('Schedule not found');
    }

    // Repetir o cancelamento não pode reenviar os avisos
    if (isActive) {
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
   * Muda dia, horário e profissional de uma visita marcada. Mesma trava e
   * checagem de conflito da reserva, sem contar a própria visita. Os serviços
   * andam juntos, cada um com a duração reservada. O cliente (e o bot, que fala
   * por ele) passa pela política e só pega horário que a loja ofereceria.
   */
  async reschedule(
    storeId: string,
    scheduleId: string,
    { date, startTime, storeMemberId: requestedMemberId }: TRescheduleRequest,
    { asCustomer, staff }: TScheduleActor = { asCustomer: true },
  ): Promise<Schedule> {
    const before = await this.scheduleNotifications.load(scheduleId);

    if (
      !before ||
      before.store?.id !== storeId ||
      before.status !== 'scheduled'
    ) {
      throw new NotFoundException('Schedule not found');
    }

    const storeMemberId = requestedMemberId ?? before.storeMember?.id;

    assertOwnAgenda(staff, before.storeMember?.id, storeMemberId);

    const group = await this.loadGroup(before);
    const items = this.toSlotItems(group, startTime);

    if (asCustomer && before.date && items[0]?.startTime) {
      assertWithinNotice('reschedule', before.store, {
        date: before.date,
        startTime: items[0].startTime,
      });
    }

    await this.assertMemberInStore(storeId, storeMemberId);

    if (storeMemberId !== before.storeMember?.id) {
      await this.assertMemberPerformsServices(
        storeMemberId,
        group.map((row) => row.service?.id),
      );
    }

    const moves = shiftItems(items, startTime);

    await this.inSlotTransaction(async (manager) => {
      await this.assertMemberFree(manager, {
        store: before.store,
        storeMemberId,
        date,
        items: moves,
        excludeIds: moves.map(({ id }) => id),
        enforceAvailability: asCustomer,
      });

      await this.saveMoves(manager, moves, date, storeMemberId);
    });

    const after = await this.scheduleNotifications.load(scheduleId);

    await this.scheduleNotifications.notifyUpdate(before, after);

    return toScheduleResponse(after);
  }

  /** Remarcação pela web: a equipe da loja encaixa, o cliente segue a política. */
  async rescheduleForRequester(
    storeId: string,
    scheduleId: string,
    request: TRescheduleRequest,
    requesterId: string,
  ): Promise<Schedule> {
    const staff = await this.getStaffActor(storeId, requesterId);

    return this.reschedule(storeId, scheduleId, request, {
      asCustomer: !staff,
      staff,
    });
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
