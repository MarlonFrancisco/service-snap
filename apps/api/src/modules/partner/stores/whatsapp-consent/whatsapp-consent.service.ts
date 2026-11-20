import {
  BadRequestException,
  GoneException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  createSignedToken,
  parseEncryptionKey,
  readSignedToken,
} from '../../../../utils/helpers/crypto.helpers';
import { isUniqueViolation } from '../../../../utils/helpers/database.helpers';
import { Store } from '../store.entity';
import { toWhatsappRecipient } from '../whatsapp/whatsapp-reminder-template';
import { WhatsappConsent } from './whatsapp-consent.entity';
import {
  WHATSAPP_OPT_OUT_LINK_DAYS,
  deriveWhatsappOptOutSecret,
  getConsentText,
  parseWhatsappOptOutSubject,
  toWhatsappOptOutSubject,
} from './whatsapp-consent.helpers';
import type {
  TWhatsappConsentGrant,
  TWhatsappConsentRevokedVia,
  TWhatsappConsentState,
  TWhatsappConsentText,
  TWhatsappOptOutSubject,
} from './whatsapp-consent.types';

@Injectable()
export class WhatsappConsentService {
  private readonly logger = new Logger(WhatsappConsentService.name);

  constructor(
    @InjectRepository(WhatsappConsent)
    private readonly consentRepository: Repository<WhatsappConsent>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private readonly configService: ConfigService,
  ) {}

  /** Texto que o checkout mostra na caixa, no idioma da loja. */
  async getCheckoutText(
    storeId: string,
    version: string,
  ): Promise<TWhatsappConsentText> {
    const store = await this.findStore(storeId);
    const text = getConsentText(version, 'checkout', store.country);

    if (!text) throw new BadRequestException('Unknown consent text version');

    return text;
  }

  /**
   * Grava ou renova o consentimento. O texto vem da versão, nunca do cliente,
   * para ficar provado o que foi aceito.
   */
  async grant({
    storeId,
    customerId,
    phone,
    source,
    textVersion,
  }: TWhatsappConsentGrant) {
    const store = await this.findStore(storeId);
    const text = getConsentText(textVersion, source, store.country);
    const recipient = toWhatsappRecipient(phone, store.country);

    if (!text) throw new BadRequestException('Unknown consent text version');
    if (!recipient) throw new BadRequestException('A valid phone is required');

    const values = {
      status: 'granted' as const,
      source,
      textVersion: text.version,
      consentText: text.text,
      phone: recipient,
      grantedAt: new Date(),
      revokedAt: null,
      revokedVia: null,
    };
    const where = { store: { id: storeId }, customer: { id: customerId } };

    // Duas confirmações ao mesmo tempo: a segunda vira atualização
    const updated = await this.consentRepository.update(where, values);
    if (updated.affected) return this.toState(values);

    try {
      await this.consentRepository.insert({
        ...values,
        store: { id: storeId },
        customer: { id: customerId },
      });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      await this.consentRepository.update(where, values);
    }

    return this.toState(values);
  }

  async revoke(
    storeId: string,
    customerId: string,
    via: TWhatsappConsentRevokedVia,
  ) {
    const result = await this.consentRepository.update(
      {
        store: { id: storeId },
        customer: { id: customerId },
        status: 'granted',
      },
      { status: 'revoked', revokedAt: new Date(), revokedVia: via },
    );

    return Boolean(result.affected);
  }

  /** "PARAR" no WhatsApp: vale para o número que escreveu, nessa loja. */
  async revokeByPhone(
    storeId: string,
    phone: string,
    via: TWhatsappConsentRevokedVia,
  ) {
    const result = await this.consentRepository.update(
      { store: { id: storeId }, phone, status: 'granted' },
      { status: 'revoked', revokedAt: new Date(), revokedVia: via },
    );

    return Boolean(result.affected);
  }

  /** Só envia WhatsApp ao número que aceitou: outro número não herda o "sim". */
  hasConsent(storeId: string, customerId: string, phone: string) {
    return this.consentRepository.exists({
      where: {
        store: { id: storeId },
        customer: { id: customerId },
        phone,
        status: 'granted',
      },
    });
  }

  hasConsentForPhone(storeId: string, phone: string) {
    return this.consentRepository.exists({
      where: { store: { id: storeId }, phone, status: 'granted' },
    });
  }

  async findState(
    storeId: string,
    customerId: string,
  ): Promise<TWhatsappConsentState> {
    const consent = await this.consentRepository.findOne({
      where: { store: { id: storeId }, customer: { id: customerId } },
    });

    return consent
      ? this.toState(consent)
      : { status: null, grantedAt: null, textVersion: null };
  }

  /** Link de sair para o e-mail, só para quem recebe WhatsApp da loja. */
  async findOptOutLink(storeId: string, customerId: string) {
    try {
      const granted = await this.consentRepository.exists({
        where: {
          store: { id: storeId },
          customer: { id: customerId },
          status: 'granted',
        },
      });

      return granted ? this.buildOptOutLink({ storeId, customerId }) : null;
    } catch (error) {
      // Sem o link o e-mail sai na mesma
      this.logger.warn(
        `Link de opt-out do WhatsApp não gerado: ${(error as Error).message}`,
      );
      return null;
    }
  }

  async getOptOutByToken(token: string) {
    const subject = this.readOptOutToken(token);
    const [store, state] = await Promise.all([
      this.findStore(subject.storeId, GoneException),
      this.findState(subject.storeId, subject.customerId),
    ]);

    return { storeName: store.name, optedOut: state.status !== 'granted' };
  }

  /** O cliente sai pelo link, sem login. Repetir não muda nada. */
  async optOutByToken(token: string) {
    const subject = this.readOptOutToken(token);
    const store = await this.findStore(subject.storeId, GoneException);

    await this.revoke(subject.storeId, subject.customerId, 'link');

    return { storeName: store.name, optedOut: true };
  }

  private toState(
    consent: Pick<WhatsappConsent, 'status' | 'grantedAt' | 'textVersion'>,
  ): TWhatsappConsentState {
    return {
      status: consent.status,
      grantedAt: consent.grantedAt,
      textVersion: consent.textVersion,
    };
  }

  private async findStore(
    storeId: string,
    NotFound: new (message: string) => Error = BadRequestException,
  ) {
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
      select: { id: true, name: true, country: true },
    });

    if (!store) throw new NotFound('Store not found');

    return store;
  }

  private buildOptOutLink(subject: TWhatsappOptOutSubject) {
    const expiresAt = new Date(
      Date.now() + WHATSAPP_OPT_OUT_LINK_DAYS * 86_400_000,
    );
    const token = createSignedToken(
      this.optOutSecret,
      toWhatsappOptOutSubject(subject),
      expiresAt,
    );

    return `${this.configService.get<string>('FRONTEND_URL')}/whatsapp/sair/${token}`;
  }

  /** Link adulterado ou vencido: 410, como o do marketing. */
  private readOptOutToken(token: string): TWhatsappOptOutSubject {
    const subject = readSignedToken(this.optOutSecret, token);
    const parsed = subject && parseWhatsappOptOutSubject(subject);

    if (!parsed) throw new GoneException('Opt-out link is invalid or expired');

    return parsed;
  }

  private get optOutSecret() {
    const key = parseEncryptionKey(
      this.configService.get<string>('DATA_ENCRYPTION_KEY'),
    );

    if (!key) {
      throw new ServiceUnavailableException(
        'Data encryption is not configured',
      );
    }

    return deriveWhatsappOptOutSecret(key);
  }
}
