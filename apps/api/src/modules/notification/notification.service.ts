import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from 'fs/promises';
import handlebars from 'handlebars';
import path from 'path';
import { Resend } from 'resend';
import { WhatsappService } from '../partner/stores/whatsapp';
import {
  CODE_FOOTER,
  CUSTOMER_FOOTER,
  LOGIN_CODE_MINUTES,
  storeFooter,
} from './notification.helpers';
import type {
  TTeamInviteEmail,
  TEmailConfirmationCode,
  TEmailLayout,
  TScheduleCancelledEmail,
  TScheduleChangedEmail,
  TScheduleConfirmedEmail,
  TScheduleNewBookingEmail,
  TScheduleReminderEmail,
  TScheduleStoreEmail,
  TSubscriptionCancelScheduledEmail,
  TTrialEndingEmail,
} from './notification.types';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly resend: Resend;
  private readonly fromEmail = 'ServiceSnap <general@ssnap.io>';

  constructor(
    private readonly configService: ConfigService,
    private readonly whatsappService: WhatsappService,
  ) {
    this.resend = new Resend(configService.get<string>('RESEND_API_KEY'));
  }

  async sendEmail(to: string | string[], subject: string, body: string) {
    const recipients = [to].flat();
    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: recipients,
      subject,
      html: body,
    });

    if (error) {
      this.logger.error(
        `Falha ao enviar e-mail para ${recipients.join(', ')}: ${error.message}`,
      );
      throw new ServiceUnavailableException(
        error.message || 'Falha ao enviar e-mail',
      );
    }

    return data;
  }

  async sendWhatsapp({
    phoneNumberId,
    to,
    message,
    accessToken,
  }: {
    phoneNumberId: string;
    to: string;
    message: string;
    accessToken: string;
  }) {
    return this.whatsappService.sendText(
      phoneNumberId,
      to,
      message,
      accessToken,
    );
  }

  async sendEmailOTP(to: string, code: string) {
    const body = await this.renderEmail(
      'auth-code',
      {
        title: 'Confirme sua identidade',
        intro: `Use este código para entrar no ServiceSnap. Ele vale por ${LOGIN_CODE_MINUTES} minutos.`,
        code,
        ignoreNote:
          'Se não foi você, ignore este e-mail. Ninguém entra na sua conta sem o código.',
      },
      {
        title: 'Seu código de acesso',
        preheader: `Use em até ${LOGIN_CODE_MINUTES} minutos.`,
        footerNote: CODE_FOOTER,
      },
    );

    return this.sendEmail(to, 'Seu código de acesso ao ServiceSnap', body);
  }

  /** Código para ligar o e-mail ao cliente que agenda pelo WhatsApp. */
  async sendEmailConfirmationCode(
    to: string,
    { code, storeName, minutes }: TEmailConfirmationCode,
  ) {
    const where = storeName ? `na conversa com ${storeName}` : 'na conversa';
    const body = await this.renderEmail(
      'auth-code',
      {
        title: 'Confirme seu e-mail',
        intro: `Digite este código ${where} no WhatsApp para receber a confirmação e o lembrete dos seus agendamentos. Ele vale por ${minutes} minutos.`,
        code,
        ignoreNote:
          'Se não foi você, ignore este e-mail. Sem o código, nada muda.',
      },
      {
        title: 'Confirme seu e-mail',
        preheader: `Use em até ${minutes} minutos no WhatsApp.`,
        footerNote: CODE_FOOTER,
      },
    );

    return this.sendEmail(to, 'Seu código para confirmar o e-mail', body);
  }

  async invoicePaid(to: string, invoiceId: string, currentPeriodEnd: string) {
    const template = await fs.readFile(
      path.join(__dirname, '../../templates', 'invoice-paid.hbs'),
      'utf8',
    );

    const body = handlebars.compile(template)({
      invoiceId,
      currentPeriodEnd: new Date(currentPeriodEnd).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      currentYear: new Date().getFullYear(),
    });

    return this.sendEmail(to, 'Pagamento Recebido - Assinatura Ativa', body);
  }

  async paymentFailed(to: string, invoiceId: string, attemptCount: number) {
    const template = await fs.readFile(
      path.join(__dirname, '../../templates', 'payment-failed.hbs'),
      'utf8',
    );

    const body = handlebars.compile(template)({
      invoiceId,
      attemptCount,
      currentYear: new Date().getFullYear(),
    });

    return this.sendEmail(to, 'Pagamento Falhou - Assinatura Inativa', body);
  }

  async scheduleConfirmation(to: string, data: TScheduleConfirmedEmail) {
    const body = await this.renderEmail('schedule-confirmed', data, {
      title: 'Agendamento confirmado',
      preheader: `${data.scheduleDay} às ${data.scheduleTime}, com ${data.professionalName}.`,
      footerNote: CUSTOMER_FOOTER,
    });

    return this.sendEmail(
      to,
      `Agendamento confirmado em ${data.storeName}`,
      body,
    );
  }

  async scheduleReminder(to: string, data: TScheduleReminderEmail) {
    const body = await this.renderEmail('schedule-reminder', data, {
      title: 'Seu horário está chegando',
      preheader: `${data.scheduleDay} às ${data.scheduleTime}, com ${data.professionalName}.`,
      footerNote: CUSTOMER_FOOTER,
    });

    return this.sendEmail(
      to,
      `Lembrete do seu agendamento em ${data.storeName}`,
      body,
    );
  }

  async scheduleChanged(to: string, data: TScheduleChangedEmail) {
    const title = data.previousSchedule
      ? 'Seu horário mudou'
      : 'Seu agendamento mudou';
    const body = await this.renderEmail(
      'schedule-changed',
      { ...data, title },
      {
        title,
        preheader: `${data.scheduleDay} às ${data.scheduleTime}, com ${data.professionalName}.`,
        footerNote: CUSTOMER_FOOTER,
      },
    );

    return this.sendEmail(to, `${title} em ${data.storeName}`, body);
  }

  async scheduleCancelled(to: string, data: TScheduleCancelledEmail) {
    const title = 'Seu agendamento foi cancelado';
    const body = await this.renderEmail('schedule-cancelled', data, {
      title,
      preheader: `${data.scheduleDay} às ${data.scheduleTime} não está mais reservado.`,
      footerNote: CUSTOMER_FOOTER,
    });

    return this.sendEmail(
      to,
      `Seu agendamento em ${data.storeName} foi cancelado`,
      body,
    );
  }

  async scheduleNewBooking(to: string[], data: TScheduleNewBookingEmail) {
    const body = await this.renderEmail('schedule-new-booking', data, {
      title: 'Novo agendamento',
      preheader: `${data.customerName} com ${data.professionalName} em ${data.storeName}.`,
      footerNote: storeFooter(data.storeName),
    });

    return this.sendEmail(
      to,
      `Novo agendamento: ${data.serviceName}, ${data.scheduleDay} às ${data.scheduleTime}`,
      body,
    );
  }

  async scheduleCustomerCancelled(to: string[], data: TScheduleStoreEmail) {
    const body = await this.renderEmail('schedule-customer-cancelled', data, {
      title: 'Cliente cancelou',
      preheader: 'O horário está livre de novo na agenda.',
      footerNote: storeFooter(data.storeName),
    });

    return this.sendEmail(
      to,
      `${data.customerName} cancelou o horário de ${data.scheduleDay} às ${data.scheduleTime}`,
      body,
    );
  }

  async trialEnding(to: string, data: TTrialEndingEmail) {
    const body = await this.renderEmail('trial-ending', data, {
      title: 'Seu teste está terminando',
      preheader: `A primeira cobrança de ${data.amount} acontece em ${data.chargeDate}.`,
      footerNote:
        'Você recebeu este e-mail porque é responsável pela assinatura do ServiceSnap.',
    });

    return this.sendEmail(to, `Seu teste termina em ${data.chargeDate}`, body);
  }

  async subscriptionCancelScheduled(
    to: string,
    data: TSubscriptionCancelScheduledEmail,
  ) {
    const body = await this.renderEmail('subscription-cancel-scheduled', data, {
      title: 'Cancelamento agendado',
      preheader: `Seu acesso ao ${data.planName} continua até ${data.accessUntil}.`,
      footerNote:
        'Você recebeu este e-mail porque é responsável pela assinatura do ServiceSnap.',
    });

    return this.sendEmail(
      to,
      `Cancelamento agendado: acesso até ${data.accessUntil}`,
      body,
    );
  }

  async teamInvite(to: string, data: TTeamInviteEmail) {
    const body = await this.renderEmail('team-invite', data, {
      title: 'Convite para a equipe',
      preheader: `${data.inviterName} adicionou você à equipe de ${data.storeName}.`,
      footerNote: `Você recebeu este e-mail porque foi adicionado à equipe de ${data.storeName}.`,
    });

    return this.sendEmail(
      to,
      `Você agora faz parte da equipe de ${data.storeName}`,
      body,
    );
  }

  /** O template traz só o miolo; cabeçalho e rodapé vêm do layout comum. */
  private async renderEmail(
    template: string,
    data: object,
    layout: TEmailLayout,
  ) {
    const compile = async (name: string) =>
      handlebars.compile(
        await fs.readFile(
          path.join(__dirname, '../../templates', `${name}.hbs`),
          'utf8',
        ),
      );
    const [content, shell] = await Promise.all([
      compile(template),
      compile('email-layout'),
    ]);

    return shell({
      ...layout,
      content: content(data),
      currentYear: new Date().getFullYear(),
    });
  }
}
