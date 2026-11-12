import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { In, IsNull, Repository } from 'typeorm';
import { getStoreTimezone } from '../../../../utils/helpers/region.helpers';
import { getStoreNow } from '../../../../utils/helpers/schedule.helpers';
import { normalizePhoneNumber } from '../../../../utils/helpers/user.helpers';
import { addDays } from '../../../../utils/helpers/whatsapp.helpers';
import { Service } from '../category/service/service.entity';
import { ScheduleService } from '../schedule/schedule.service';
import { StoreMember } from '../store-member/store-member.entity';
import { Store } from '../store.entity';
import { WaitlistEntry } from './waitlist-entry.entity';
import {
  WAITLIST_HORIZON_DAYS,
  WAITLIST_MAX_ACTIVE_PER_CUSTOMER,
  WAITLIST_RELATIONS,
  countFreeableSlots,
  toWaitlistEntryResponse,
} from './waitlist.helpers';
import type { TJoinWaitlist } from './waitlist.types';

@Injectable()
export class WaitlistService {
  constructor(
    @InjectRepository(WaitlistEntry)
    private readonly waitlistRepository: Repository<WaitlistEntry>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(StoreMember)
    private readonly storeMemberRepository: Repository<StoreMember>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly scheduleService: ScheduleService,
  ) {}

  /**
   * Entra na fila de um dia cheio. Dia com horário livre não tem fila: a pessoa
   * reserva direto. Entrar de novo na mesma fila devolve a entrada que já existe.
   */
  async join({
    storeId,
    serviceId,
    storeMemberId,
    date,
    customer,
    channel,
  }: TJoinWaitlist) {
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });
    if (!store) throw new NotFoundException('Store not found');

    const now = getStoreNow(getStoreTimezone(store), new Date());
    const today = now.date;
    if (date < today || date > addDays(today, WAITLIST_HORIZON_DAYS)) {
      throw new BadRequestException(
        `Choose a day between today and ${WAITLIST_HORIZON_DAYS} days ahead`,
      );
    }

    await this.assertSomeoneDoesService(storeId, serviceId, storeMemberId);

    // Também confere se a loja existe, não é rascunho e tem o serviço
    const slots = await this.scheduleService.getAvailability(storeId, {
      date,
      serviceIds: serviceId,
      ...(storeMemberId && { memberId: storeMemberId }),
    });

    const service = await this.serviceRepository.findOne({
      where: { id: serviceId },
    });
    const freeable = countFreeableSlots(slots, {
      date,
      today,
      nowMinutes: now.minutes,
      closeTime: store.closeTime,
      durationMinutes: service?.duration ?? 0,
    });

    // Loja fechada, ou hoje já sem horário que caiba: não há o que vagar
    if (freeable === 0) {
      throw new BadRequestException('The store is closed on this day');
    }
    if (slots.some((slot) => slot.available)) {
      throw new ConflictException('There are free times on this day');
    }

    const existing = await this.waitlistRepository.findOne({
      where: {
        store: { id: storeId },
        user: { id: customer.id },
        service: { id: serviceId },
        storeMember: storeMemberId ? { id: storeMemberId } : IsNull(),
        date,
        status: 'waiting',
      },
      relations: WAITLIST_RELATIONS,
    });
    if (existing) return toWaitlistEntryResponse(existing);

    const active = await this.waitlistRepository.count({
      where: {
        store: { id: storeId },
        user: { id: customer.id },
        status: 'waiting',
      },
    });
    if (active >= WAITLIST_MAX_ACTIVE_PER_CUSTOMER) {
      throw new BadRequestException(
        `At most ${WAITLIST_MAX_ACTIVE_PER_CUSTOMER} waitlists per store`,
      );
    }

    const saved = await this.waitlistRepository.save({
      store: { id: storeId },
      user: { id: customer.id },
      service: { id: serviceId },
      storeMember: storeMemberId ? { id: storeMemberId } : null,
      date,
      channel,
      status: 'waiting',
    });

    return toWaitlistEntryResponse(await this.findOne(saved.id));
  }

  /** Filas abertas do cliente na loja, das mais próximas para as mais distantes. */
  async listForCustomer(storeId: string, customerId: string) {
    const entries = await this.waitlistRepository.find({
      where: {
        store: { id: storeId },
        user: { id: customerId },
        status: 'waiting',
      },
      relations: WAITLIST_RELATIONS,
      order: { date: 'ASC', createdAt: 'ASC' },
    });

    return entries.map(toWaitlistEntryResponse);
  }

  async leave(storeId: string, entryId: string, customerId: string) {
    const result = await this.waitlistRepository.update(
      {
        id: entryId,
        store: { id: storeId },
        user: { id: customerId },
        status: In(['waiting', 'notified']),
      },
      { status: 'cancelled' },
    );

    if (!result.affected)
      throw new NotFoundException('Waitlist entry not found');

    return { id: entryId };
  }

  /** Entrada da loja que é de quem escreveu no WhatsApp, achada pelo telefone. */
  async findForPhone(storeId: string, entryId: string, telephone: string) {
    const phone = normalizePhoneNumber(telephone);
    if (!phone || !isUUID(entryId)) return null;

    return this.waitlistRepository.findOne({
      where: {
        id: entryId,
        store: { id: storeId },
        user: { telephone: phone },
      },
      relations: WAITLIST_RELATIONS,
    });
  }

  private findOne(id: string) {
    return this.waitlistRepository.findOne({
      where: { id },
      relations: WAITLIST_RELATIONS,
    });
  }

  /** Mesmo filtro da disponibilidade: profissional ativo da loja que faz o serviço. */
  private async assertSomeoneDoesService(
    storeId: string,
    serviceId: string,
    storeMemberId?: string | null,
  ) {
    const exists = await this.storeMemberRepository.exists({
      where: {
        store: { id: storeId },
        ...(storeMemberId && { id: storeMemberId }),
        role: 'professional',
        isActive: true,
        isDeleted: false,
        services: { id: serviceId },
      },
    });

    if (!exists) {
      throw new BadRequestException('No professional does this service');
    }
  }
}
