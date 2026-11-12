import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { getUserFullName } from '../../utils/helpers/user.helpers';
import { Service } from '../partner/stores/category/service/service.entity';
import type { AvailabilityQueryDto } from '../partner/stores/schedule/dto/availability-query.dto';
import { CreateSchedulesDto } from '../partner/stores/schedule/dto/create-schedule.dto';
import { Schedule } from '../partner/stores/schedule/schedule.entity';
import { ScheduleService } from '../partner/stores/schedule/schedule.service';
import { StoreMember } from '../partner/stores/store-member/store-member.entity';
import { Store } from '../partner/stores/store.entity';
import type {
  PublicCreateScheduleDto,
  PublicScheduleQueryDto,
} from './dto/public-schedule.dto';
import {
  PUBLIC_SCHEDULE_RELATIONS,
  toPublicSchedule,
} from './public-api.helpers';
import type { TPublicPage, TPublicSchedule } from './public-api.types';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/**
 * API pública da loja dona da chave. Escritas passam pelo `ScheduleService`,
 * com as mesmas checagens de conflito e disponibilidade do agendamento online,
 * e disparam os mesmos avisos e webhooks.
 */
@Injectable()
export class PublicApiService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(StoreMember)
    private readonly memberRepository: Repository<StoreMember>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly scheduleService: ScheduleService,
  ) {}

  async getStore(storeId: string) {
    const store = await this.storeRepository.findOneByOrFail({ id: storeId });

    return {
      id: store.id,
      name: store.name,
      timezone: store.timezone,
      currency: store.currency,
      country: store.country,
      openTime: store.openTime,
      closeTime: store.closeTime,
      businessDays: store.businessDays,
    };
  }

  async listServices(storeId: string) {
    const services = await this.serviceRepository.find({
      where: { store: { id: storeId }, isActive: true },
      order: { name: 'ASC' },
    });

    return services.map(({ id, name, description, duration, price }) => ({
      id,
      name,
      description,
      duration,
      price,
    }));
  }

  async listProfessionals(storeId: string) {
    const members = await this.memberRepository.find({
      where: {
        store: { id: storeId },
        role: 'professional',
        isActive: true,
        isDeleted: false,
      },
      relations: ['user', 'services'],
    });

    return members.map((member) => ({
      id: member.id,
      name: getUserFullName(member.user),
      serviceIds: member.services.map((service) => service.id),
    }));
  }

  getAvailability(storeId: string, query: AvailabilityQueryDto) {
    return this.scheduleService.getAvailability(storeId, query);
  }

  async listSchedules(
    storeId: string,
    query: PublicScheduleQueryDto,
  ): Promise<TPublicPage<TPublicSchedule>> {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Number(query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const date =
      query.from && query.to
        ? Between(query.from, query.to)
        : query.from
          ? MoreThanOrEqual(query.from)
          : query.to
            ? LessThanOrEqual(query.to)
            : undefined;

    const [schedules, total] = await this.scheduleRepository.findAndCount({
      where: {
        store: { id: storeId },
        ...(date && { date: date as never }),
        ...(query.status && { status: query.status as Schedule['status'] }),
      },
      relations: PUBLIC_SCHEDULE_RELATIONS,
      order: { date: 'ASC', startTime: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: schedules.map(toPublicSchedule),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSchedule(storeId: string, id: string) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id, store: { id: storeId } },
      relations: PUBLIC_SCHEDULE_RELATIONS,
    });

    if (!schedule) throw new NotFoundException('Schedule not found');

    return toPublicSchedule(schedule);
  }

  /**
   * Como o bot: o cliente vem do contato enviado e vale a disponibilidade
   * oferecida ao público (expediente, bloqueios e conflito).
   */
  async createSchedule(storeId: string, dto: PublicCreateScheduleDto) {
    const created = await this.scheduleService.create(
      Object.assign(new CreateSchedulesDto(), {
        // Sem `transform` no ValidationPipe a data já chega como texto, que é
        // o que o `ScheduleService` recebe das outras rotas
        date: dto.date as unknown as Date,
        startTime: dto.startTime,
        notes: dto.notes,
        services: dto.serviceIds.map((id) => ({ id })),
        storeMember: { id: dto.professionalId },
        user: dto.customer,
        store: { id: storeId },
      }),
    );

    const schedules = await this.scheduleRepository.find({
      where: { id: In(created.map((schedule) => schedule.id)) },
      relations: PUBLIC_SCHEDULE_RELATIONS,
      order: { startTime: 'ASC' },
    });

    return { data: schedules.map(toPublicSchedule) };
  }

  /** Cancelado pela loja: o cliente recebe o aviso de cancelamento da loja. */
  async cancelSchedule(storeId: string, id: string) {
    await this.getSchedule(storeId, id);
    await this.scheduleService.delete(storeId, id, null);

    return this.getSchedule(storeId, id);
  }
}
