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
import { CUSTOMER_FOOTER, storeFooter } from './notification.helpers';
import type {
  TEmailLayout,
  TScheduleCancelledEmail,
  TScheduleChangedEmail,
  TScheduleConfirmedEmail,
  TScheduleNewBookingEmail,
  TScheduleStoreEmail,
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

  async sendSMS(phoneNumber: string, _message: string) {
    this.logger.warn(
      `SMS não configurado (Resend é só e-mail). Destino: ${phoneNumber}`,
    );
    throw new ServiceUnavailableException(
      'Envio de SMS ainda não está disponível. Use e-mail ou WhatsApp.',
    );
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
    const subject = 'Código de verificação';
    const body = `Seu código de verificação é: ${code}`;
    return this.sendEmail(to, subject, body);
  }

  async sendSMSOTP(phoneNumber: string, code: string) {
    const message = `Seu código de verificação é: ${code}`;
    return this.sendSMS(phoneNumber, message);
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

  async scheduleReminder(
    to: string,
    data: {
      storeName: string;
      customerName: string;
      serviceName: string;
      professionalName: string;
      scheduleDate: string;
      storeAddress: string;
      storePhone: string;
      customMessage: string;
      rescheduleLink: string;
      currentYear: number;
    },
  ) {
    const template = await fs.readFile(
      path.join(__dirname, '../../templates', 'schedule-reminder.hbs'),
      'utf8',
    );

    const body = handlebars.compile(template)(data);

    return this.sendEmail(
      to,
      `Lembrete: atendimento em ${data.storeName}`,
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
