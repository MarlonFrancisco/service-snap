import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../../users/user.entity';
import { Store } from '../store.entity';
import type {
  TWhatsappConsentRevokedVia,
  TWhatsappConsentSource,
  TWhatsappConsentStatus,
} from './whatsapp-consent.types';

/**
 * Consentimento do cliente final para receber lembretes e avisos da loja por
 * WhatsApp (#37). Um por cliente e loja, com o texto aceito e o número a que
 * vale: trocar de número pede um consentimento novo.
 */
@Entity('whatsapp_consents')
@Unique('UQ_whatsapp_consents_store_customer', ['store', 'customer'])
export class WhatsappConsent extends BaseEntity {
  @Column({ type: 'varchar', length: 10 })
  status: TWhatsappConsentStatus;

  @Column({ type: 'varchar', length: 20 })
  source: TWhatsappConsentSource;

  @Column({ type: 'varchar', length: 40 })
  textVersion: string;

  @Column({ type: 'varchar', length: 500 })
  consentText: string;

  /** Número em E.164 sem `+`, como a Meta o recebe. */
  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'timestamptz' })
  grantedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  revokedVia: TWhatsappConsentRevokedVia | null;

  @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: false })
  store: Store;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  customer: User;
}
