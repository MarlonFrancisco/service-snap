import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PLAN_FEATURE_REQUIRED, PlanFeatureGuard } from '../../guards';
import { WhatsappConfig } from '../../whatsapp/whatsapp.entity';
import { WhatsappService } from '../../whatsapp/whatsapp.service';
import { NotificationsSettingsDto } from './dto/settings.dto';
import { NotificationsSettings } from './settings.entity';

@Injectable()
export class NotificationsSettingsService {
  constructor(
    @InjectRepository(NotificationsSettings)
    private readonly notificationsSettingsRepository: Repository<NotificationsSettings>,
    @InjectRepository(WhatsappConfig)
    private readonly whatsappConfigRepository: Repository<WhatsappConfig>,
    private readonly planFeatureGuard: PlanFeatureGuard,
    private readonly whatsappService: WhatsappService,
  ) {}

  async create(
    notificationsSettings: NotificationsSettingsDto,
  ): Promise<NotificationsSettings> {
    return this.notificationsSettingsRepository.save(notificationsSettings);
  }

  async findOne(storeId: string): Promise<NotificationsSettings> {
    return this.notificationsSettingsRepository.findOne({
      where: { store: { id: storeId } },
    });
  }

  async update(
    notificationsSettings: NotificationsSettingsDto,
  ): Promise<NotificationsSettings> {
    if (notificationsSettings.whatsappReminderEnabled === true) {
      await this.assertCanEnableWhatsappReminders(
        notificationsSettings.store.id,
      );
    }

    // A linha é localizada pela loja: o `id` do corpo pode faltar ou ser de outra loja
    const current = await this.findOne(notificationsSettings.store.id);

    await this.notificationsSettingsRepository.save({
      ...notificationsSettings,
      id: current?.id,
    });

    return this.findOne(notificationsSettings.store.id);
  }

  /** Mesmas regras da tela: precisa do plano e da integração da loja ativa. */
  private async assertCanEnableWhatsappReminders(storeId: string) {
    const missingFeatures = await this.planFeatureGuard.getMissingFeatures(
      storeId,
      ['WHATSAPP_INTEGRATION'],
    );

    if (missingFeatures.length) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        code: PLAN_FEATURE_REQUIRED,
        message:
          'Lembretes por WhatsApp não estão incluídos no seu plano. Faça upgrade para liberar o acesso.',
        missingFeatures,
      });
    }

    const isConnected = await this.whatsappConfigRepository.exists({
      where: { store: { id: storeId }, isActive: true },
    });

    if (!isConnected) {
      throw new BadRequestException(
        'Conecte o WhatsApp da loja antes de ativar os lembretes por WhatsApp.',
      );
    }

    // Sem o template a Meta não entrega o lembrete; o cron espera a aprovação
    await this.whatsappService.ensureReminderTemplate(storeId);
  }

  async delete(id: string): Promise<void> {
    await this.notificationsSettingsRepository.delete(id);
  }
}
