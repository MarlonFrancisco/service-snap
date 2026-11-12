import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Not, Repository } from 'typeorm';
import { getStoreTimezone } from '../../../../utils/helpers/region.helpers';
import { getStoreNow } from '../../../../utils/helpers/schedule.helpers';
import { Schedule } from '../schedule/schedule.entity';
import { StoreMember } from '../store-member/store-member.entity';
import { CalendarFeed } from './calendar-feed.entity';
import {
  buildCalendarFeedUrl,
  buildIcsCalendar,
  generateCalendarToken,
  toCalendarFeedEvent,
} from './calendar-feed.helpers';
import type { TCalendarFeedResponse } from './calendar-feed.types';

/** Quanto do passado e do futuro vai no calendário. */
const PAST_DAYS = 30;
const FUTURE_DAYS = 180;
const DAY_MS = 24 * 60 * 60 * 1000;

const MANAGER_ROLES = ['owner', 'manager'];

@Injectable()
export class CalendarFeedService {
  constructor(
    @InjectRepository(CalendarFeed)
    private readonly feedRepository: Repository<CalendarFeed>,
    @InjectRepository(StoreMember)
    private readonly storeMemberRepository: Repository<StoreMember>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * O profissional cuida do próprio link; dono e gerente, de qualquer um da
   * loja. O link expõe a agenda da pessoa, então ninguém mais o vê.
   */
  async assertCanManage(
    storeId: string,
    memberId: string,
    requester: { role?: string; memberId?: string },
  ): Promise<StoreMember> {
    const member = await this.storeMemberRepository.findOne({
      where: { id: memberId, store: { id: storeId }, isDeleted: false },
    });

    if (!member) {
      throw new NotFoundException('Professional not found in this store');
    }

    if (
      !MANAGER_ROLES.includes(requester.role ?? '') &&
      requester.memberId !== member.id
    ) {
      throw new ForbiddenException(
        'Só o próprio profissional, o dono ou o gerente veem este link.',
      );
    }

    return member;
  }

  async get(memberId: string): Promise<TCalendarFeedResponse> {
    const feed = await this.feedRepository.findOne({
      where: { storeMember: { id: memberId } },
    });

    if (!feed) throw new NotFoundException('Calendar link not created');

    return this.toResponse(feed);
  }

  /** Cria o link ou troca o token: o endereço antigo deixa de funcionar. */
  async rotate(member: StoreMember): Promise<TCalendarFeedResponse> {
    const existing = await this.feedRepository.findOne({
      where: { storeMember: { id: member.id } },
    });
    const feed = await this.feedRepository.save({
      ...(existing ?? { storeMember: { id: member.id } }),
      token: generateCalendarToken(),
    });

    return this.toResponse(feed);
  }

  async revoke(memberId: string): Promise<{ revoked: boolean }> {
    const result = await this.feedRepository.delete({
      storeMember: { id: memberId },
    });

    return { revoked: Boolean(result.affected) };
  }

  /** Conteúdo `.ics` do link; nulo quando o token não existe (ou foi trocado). */
  async renderIcs(token: string): Promise<string | null> {
    const feed = await this.feedRepository.findOne({
      where: { token },
      relations: ['storeMember', 'storeMember.store', 'storeMember.user'],
    });

    if (!feed || feed.storeMember.isDeleted) return null;

    const { store } = feed.storeMember;
    const today = getStoreNow(getStoreTimezone(store), new Date()).date;
    const todayMs = Date.parse(`${today}T00:00:00Z`);
    const dayKey = (offset: number) =>
      new Date(todayMs + offset * DAY_MS).toISOString().slice(0, 10);

    // Cancelados ficam de fora: na próxima atualização o evento some do calendário
    const schedules = await this.scheduleRepository.find({
      where: {
        storeMember: { id: feed.storeMember.id },
        status: Not('cancelled'),
        date: Between(dayKey(-PAST_DAYS), dayKey(FUTURE_DAYS)) as never,
      },
      relations: ['service', 'user', 'store'],
      order: { date: 'ASC', startTime: 'ASC' },
    });

    const agendaUrl = `${this.frontendUrl()}/partner/agenda`;
    const name = [feed.storeMember.user?.firstName, store.name]
      .filter(Boolean)
      .join(' · ');

    return buildIcsCalendar(
      `${name} (ServiceSnap)`,
      schedules
        .filter((schedule) => schedule.startTime && schedule.endTime)
        .map((schedule) => toCalendarFeedEvent(schedule, agendaUrl)),
    );
  }

  private frontendUrl() {
    return this.configService.get<string>('FRONTEND_URL') ?? '';
  }

  private toResponse(feed: CalendarFeed): TCalendarFeedResponse {
    return {
      url: buildCalendarFeedUrl(this.frontendUrl(), feed.token),
      createdAt: feed.updatedAt ?? feed.createdAt,
    };
  }
}
