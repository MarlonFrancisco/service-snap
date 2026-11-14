import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AvailabilitySlot } from '../../../../utils/helpers/schedule.helpers';
import { NotificationService } from '../../../notification/notification.service';
import { PlanFeatureGuard } from '../guards';
import { ScheduleEventsService } from '../schedule/schedule-events.service';
import type { TScheduleSlotFreed } from '../schedule/schedule-events.types';
import { ScheduleService } from '../schedule/schedule.service';
import { toWhatsappRecipient } from '../whatsapp/whatsapp-reminder-template';
import { WHATSAPP_WAITLIST_TEMPLATE } from '../whatsapp/whatsapp-templates';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { WaitlistEntry } from './waitlist-entry.entity';
import {
  WAITLIST_RELATIONS,
  buildWaitlistNotice,
  buildWaitlistPayload,
  buildWaitlistTemplateParams,
  buildWaitlistWhatsappText,
  getWaitlistChannels,
} from './waitlist.helpers';
import type {
  TWaitlistChannel,
  TWaitlistNotice,
  TWhatsappSender,
} from './waitlist.types';

/**
 * Aviso de vaga para a lista de espera, disparado quando um cancelamento ou uma
 * remarcação libera horário num dia com fila. Avisa todos de uma vez: a vaga
 * fica com quem reservar primeiro.
 */
@Injectable()
export class WaitlistNotificationsService implements OnModuleInit {
  private readonly logger = new Logger(WaitlistNotificationsService.name);

  constructor(
    @InjectRepository(WaitlistEntry)
    private readonly waitlistRepository: Repository<WaitlistEntry>,
    private readonly scheduleService: ScheduleService,
    private readonly scheduleEvents: ScheduleEventsService,
    private readonly whatsappService: WhatsappService,
    private readonly notificationService: NotificationService,
    private readonly planFeatureGuard: PlanFeatureGuard,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.scheduleEvents.onSlotFreed((event) => this.notifySlotFreed(event));
  }

  async notifySlotFreed({ storeId, date }: TScheduleSlotFreed) {
    const entries = await this.waitlistRepository.find({
      where: { store: { id: storeId }, date, status: 'waiting' },
      relations: WAITLIST_RELATIONS,
      order: { createdAt: 'ASC' },
    });

    if (!entries.length) return;

    // Uma consulta de WhatsApp por loja, só se alguém for avisado por lá
    let sender: Promise<TWhatsappSender | null> | undefined;
    const whatsappSender = () => (sender ??= this.findWhatsappSender(storeId));

    // Quem espera o mesmo serviço com o mesmo profissional vê a mesma vaga
    const groups = new Map<string, WaitlistEntry[]>();
    for (const entry of entries) {
      const key = `${entry.service?.id}|${entry.storeMember?.id ?? ''}`;
      groups.set(key, [...(groups.get(key) ?? []), entry]);
    }

    for (const [first, ...rest] of groups.values()) {
      const slots = await this.scheduleService.getAvailability(storeId, {
        date,
        serviceIds: first.service.id,
        ...(first.storeMember && { memberId: first.storeMember.id }),
      });

      if (!slots.some((slot) => slot.available)) continue;

      for (const entry of [first, ...rest]) {
        await this.notify(entry, slots, whatsappSender);
      }
    }
  }

  /**
   * Marca antes de enviar, para dois cancelamentos ao mesmo tempo não avisarem
   * a mesma pessoa duas vezes. Se nenhum canal entregar, a entrada volta para a
   * fila e espera o próximo horário que vagar.
   */
  private async notify(
    entry: WaitlistEntry,
    slots: AvailabilitySlot[],
    whatsappSender: () => Promise<TWhatsappSender | null>,
  ) {
    const claim = await this.waitlistRepository.update(
      { id: entry.id, status: 'waiting' },
      { status: 'notified', notifiedAt: new Date() },
    );
    if (!claim.affected) return;

    const notice = buildWaitlistNotice(
      entry,
      slots,
      `${this.configService.get<string>('FRONTEND_URL')}/booking/${entry.store.id}`,
    );

    for (const channel of getWaitlistChannels(entry.channel)) {
      if (await this.sendBy(channel, entry, notice, whatsappSender)) return;
    }

    this.logger.warn(`Aviso da lista de espera ${entry.id} sem canal`);
    await this.waitlistRepository.update(
      { id: entry.id },
      { status: 'waiting', notifiedAt: null },
    );
  }

  private async sendBy(
    channel: TWaitlistChannel,
    entry: WaitlistEntry,
    notice: TWaitlistNotice,
    whatsappSender: () => Promise<TWhatsappSender | null>,
  ): Promise<boolean> {
    try {
      if (channel === 'email') {
        if (!entry.user?.email) return false;

        await this.notificationService.waitlistSlotAvailable(
          entry.user.email,
          notice,
        );
        return true;
      }

      const phone = toWhatsappRecipient(
        entry.user?.telephone,
        entry.store?.country,
      );
      const sender = phone && (await whatsappSender());
      if (!sender) return false;

      const { phoneNumberId, accessToken } = sender.config;
      const payload = buildWaitlistPayload(entry.id);

      if (sender.templateApproved) {
        await this.whatsappService.sendTemplate(
          phoneNumberId,
          phone,
          {
            name: WHATSAPP_WAITLIST_TEMPLATE.name,
            language: WHATSAPP_WAITLIST_TEMPLATE.language,
            bodyParams: buildWaitlistTemplateParams(notice),
            buttonPayloads: [payload],
          },
          accessToken,
        );
        return true;
      }

      // Fora da janela de 24h a Meta aceita a mensagem livre e só recusa depois,
      // sem dar para saber aqui: com e-mail no cadastro, o e-mail é mais seguro
      if (entry.user?.email) return false;

      await this.whatsappService.sendInteractiveButtons(
        phoneNumberId,
        phone,
        buildWaitlistWhatsappText(notice),
        [{ id: payload, title: 'Ver horários' }],
        accessToken,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Aviso da lista de espera ${entry.id} por ${channel} falhou`,
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }

  /** Mesmas condições do lembrete: integração ativa e o plano com WhatsApp. */
  private async findWhatsappSender(
    storeId: string,
  ): Promise<TWhatsappSender | null> {
    const config = await this.whatsappService.findActiveConfig(storeId);
    if (!config) return null;

    const missing = await this.planFeatureGuard.getMissingFeatures(storeId, [
      'WHATSAPP_INTEGRATION',
    ]);
    if (missing.length) return null;

    try {
      const template = await this.whatsappService.findWaitlistTemplate(config);
      return { config, templateApproved: template?.status === 'APPROVED' };
    } catch (error) {
      this.logger.warn(
        `Template da lista de espera da loja ${storeId} não conferido: ${(error as Error).message}`,
      );
      return { config, templateApproved: false };
    }
  }
}
