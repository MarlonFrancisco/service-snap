import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { runWithoutNotifications } from '../../../../utils/helpers/notification-scope.helpers';
import { toDateKey } from '../../../../utils/helpers/schedule.helpers';
import { getStoreToday } from '../../../../utils/helpers/store-date.helpers';
import { CreateSchedulesDto } from '../schedule/dto/create-schedule.dto';
import { Schedule } from '../schedule/schedule.entity';
import { ScheduleService } from '../schedule/schedule.service';
import { Store } from '../store.entity';
import type {
  CancelScheduleSeriesDto,
  CreateScheduleSeriesDto,
} from './dto/schedule-series.dto';
import { ScheduleSeries, ScheduleSeriesItem } from './schedule-series.entity';
import {
  MAX_SERIES_SPAN_DAYS,
  buildSeriesDates,
  seriesSpanDays,
} from './schedule-series.helpers';
import type { TSeriesConflict, TSeriesCreated } from './schedule-series.types';

/**
 * Série recorrente criada pela loja. Cada data passa pelo `ScheduleService`
 * (mesma trava de conflito e a constraint de sobreposição): as livres entram,
 * as que conflitam voltam na lista para a loja resolver.
 */
@Injectable()
export class ScheduleSeriesService {
  constructor(
    @InjectRepository(ScheduleSeries)
    private readonly seriesRepository: Repository<ScheduleSeries>,
    @InjectRepository(ScheduleSeriesItem)
    private readonly itemRepository: Repository<ScheduleSeriesItem>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private readonly scheduleService: ScheduleService,
  ) {}

  async create(
    storeId: string,
    dto: CreateScheduleSeriesDto,
    requesterId: string,
  ): Promise<TSeriesCreated> {
    const dates = buildSeriesDates(
      dto.date,
      dto.intervalWeeks,
      dto.occurrences,
    );
    const store = await this.storeRepository.findOneBy({ id: storeId });

    if (dto.date < getStoreToday(store)) {
      throw new BadRequestException('Series cannot start in the past');
    }
    if (seriesSpanDays(dates) > MAX_SERIES_SPAN_DAYS) {
      throw new BadRequestException('Series cannot span more than 6 months');
    }

    const series = await this.seriesRepository.save({
      intervalWeeks: dto.intervalWeeks,
      occurrences: dto.occurrences,
      startDate: dto.date,
      startTime: dto.startTime,
      serviceIds: dto.serviceIds,
      createdById: requesterId,
      store: { id: storeId },
      storeMember: { id: dto.storeMemberId },
    });

    const created: TSeriesCreated['created'] = [];
    const conflicts: TSeriesConflict[] = [];

    // Uma data por vez: duas na mesma transação disputariam a mesma trava. A
    // primeira que entrar avisa o cliente e a loja; as outras vão em silêncio
    for (const [index, date] of dates.entries()) {
      const createDate = () =>
        this.scheduleService.createForRequester(
          this.buildDateDto(storeId, dto, date),
          requesterId,
        );

      try {
        const schedules = created.length
          ? await runWithoutNotifications(createDate)
          : await createDate();

        await this.itemRepository.save(
          schedules.map((schedule) => ({
            occurrence: index + 1,
            series: { id: series.id },
            schedule: { id: schedule.id },
          })),
        );
        created.push({
          occurrence: index + 1,
          date,
          scheduleIds: schedules.map((schedule) => schedule.id),
        });
      } catch (error) {
        // Erro de regra (conflito, profissional inativo) vira item da lista
        if (!(error instanceof HttpException) || error.getStatus() >= 500) {
          throw error;
        }
        conflicts.push({ occurrence: index + 1, date, reason: error.message });
      }
    }

    if (!created.length) {
      await this.seriesRepository.delete(series.id);
      throw new BadRequestException({
        message: 'No date of the series is available',
        conflicts,
      });
    }

    const [first] = created;
    const customer = await this.itemRepository.manager.findOne(Schedule, {
      where: { id: first.scheduleIds[0] },
      relations: ['user'],
    });
    await this.seriesRepository.update(series.id, {
      customer: customer?.user ? { id: customer.user.id } : null,
    });

    return { id: series.id, created, conflicts };
  }

  async findBySchedule(storeId: string, scheduleId: string) {
    const item = await this.itemRepository.findOne({
      where: {
        schedule: { id: scheduleId },
        series: { store: { id: storeId } },
      },
      relations: ['series'],
    });

    return {
      series: item && {
        id: item.series.id,
        occurrence: item.occurrence,
        occurrences: item.series.occurrences,
        intervalWeeks: item.series.intervalWeeks,
        cancelledAt: item.series.cancelledAt,
      },
    };
  }

  async findOne(storeId: string, id: string) {
    const series = await this.seriesRepository.findOne({
      where: { id, store: { id: storeId } },
      relations: ['storeMember', 'storeMember.user', 'customer'],
    });

    if (!series) throw new NotFoundException('Series not found');

    const items = await this.itemRepository.find({
      where: { series: { id } },
      relations: ['schedule', 'schedule.service'],
      order: { occurrence: 'ASC' },
    });

    return {
      id: series.id,
      intervalWeeks: series.intervalWeeks,
      occurrences: series.occurrences,
      startDate: series.startDate,
      startTime: series.startTime,
      cancelledAt: series.cancelledAt,
      storeMember: {
        id: series.storeMember.id,
        firstName: series.storeMember.user?.firstName,
        lastName: series.storeMember.user?.lastName,
      },
      customer: series.customer && {
        id: series.customer.id,
        firstName: series.customer.firstName,
        lastName: series.customer.lastName,
      },
      items: items.map((item) => ({
        occurrence: item.occurrence,
        scheduleId: item.schedule.id,
        date: toDateKey(item.schedule.date),
        startTime: item.schedule.startTime,
        status: item.schedule.status,
        serviceName: item.schedule.service?.name ?? null,
      })),
    };
  }

  /**
   * "Esta e as próximas": cancela os agendamentos marcados da série a partir
   * de `from`.
   */
  async cancel(
    storeId: string,
    id: string,
    dto: CancelScheduleSeriesDto,
    requesterId: string,
  ) {
    const series = await this.seriesRepository.findOne({
      where: { id, store: { id: storeId } },
      relations: ['store'],
    });

    if (!series) throw new NotFoundException('Series not found');

    const from = dto.from ?? getStoreToday(series.store);
    const items = await this.itemRepository.find({
      where: { series: { id }, schedule: { status: 'scheduled' } },
      relations: ['schedule'],
      order: { occurrence: 'ASC' },
    });
    const toCancel = items
      .map((item) => item.schedule)
      .filter((schedule) => toDateKey(schedule.date) >= from);

    // A primeira data cancelada avisa o cliente; as outras vão em silêncio
    for (const [index, schedule] of toCancel.entries()) {
      const cancel = () =>
        this.scheduleService.delete(storeId, schedule.id, requesterId);

      await (index ? runWithoutNotifications(cancel) : cancel());
    }

    if (!dto.from || from <= series.startDate) {
      await this.seriesRepository.update(id, { cancelledAt: new Date() });
    }

    return {
      id,
      cancelled: toCancel.map((schedule) => schedule.id),
    };
  }

  /** Tudo pela loja: o cliente vem do contato, como no agendamento manual. */
  private buildDateDto(
    storeId: string,
    dto: CreateScheduleSeriesDto,
    date: string,
  ) {
    return Object.assign(new CreateSchedulesDto(), {
      // Sem `transform` no ValidationPipe a data já chega como texto
      date: date as unknown as Date,
      startTime: dto.startTime,
      notes: dto.notes,
      services: dto.serviceIds.map((id) => ({ id })),
      storeMember: { id: dto.storeMemberId },
      user: dto.customer,
      store: { id: storeId },
    });
  }
}
