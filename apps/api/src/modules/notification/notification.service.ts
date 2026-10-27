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

  async sendEmail(to: string, subject: string, body: string) {
    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: [to],
      subject,
      html: body,
    });

    if (error) {
      this.logger.error(`Falha ao enviar e-mail para ${to}: ${error.message}`);
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

  async scheduleConfirmation(
    to: string,
    data: {
      storeName: string;
      customerName: string;
      serviceName: string;
      professionalName: string;
      scheduleDate: string;
      price: string;
      storeLocation: string;
      storeAddress: string;
      calendarLink: string;
      rescheduleLink: string;
      storePhone: string;
      currentYear: number;
    },
  ) {
    const template = await fs.readFile(
      path.join(__dirname, '../../templates', 'schedule-confirmed.hbs'),
      'utf8',
    );

    const body = handlebars.compile(template)(data);

    return this.sendEmail(to, 'Agendamento Confirmado', body);
  }
}
