import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../../users/user.entity';
import { Store } from '../store.entity';
import type {
  TCampaignChannel,
  TCampaignRecipientStatus,
  TCampaignStatus,
  TCampaignTemplate,
} from './campaigns.types';

export const CAMPAIGN_RECIPIENT_UNIQUE_INDEX =
  'uq_campaign_recipients_customer';
export const MARKETING_OPT_OUT_UNIQUE_INDEX = 'uq_marketing_opt_outs_customer';

/** Campanha de reativação: quem sumiu há `inactiveDays` dias recebe a mensagem. */
@Entity('campaigns')
export class Campaign extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  channel: TCampaignChannel;

  @Column({ type: 'int' })
  inactiveDays: number;

  @Column({ type: 'jsonb' })
  template: TCampaignTemplate;

  @Column({ type: 'varchar', length: 20, default: 'queued' })
  status: TCampaignStatus;

  @Column({ type: 'int', default: 0 })
  recipientsCount: number;

  @Column({ type: 'uuid', nullable: true })
  createdById: string | null;

  @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: false })
  store: Store;

  @OneToMany(() => CampaignRecipient, (recipient) => recipient.campaign)
  recipients: CampaignRecipient[];
}

/** Um envio. O status impede mandar duas vezes se o QStash repetir a chamada. */
@Entity('campaign_recipients')
@Index(CAMPAIGN_RECIPIENT_UNIQUE_INDEX, ['campaign', 'customer'], {
  unique: true,
})
export class CampaignRecipient extends BaseEntity {
  @Column({ type: 'varchar', length: 20, default: 'queued' })
  status: TCampaignRecipientStatus;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'varchar', length: 300, nullable: true })
  error: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt: Date | null;

  @ManyToOne(() => Campaign, (campaign) => campaign.recipients, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  campaign: Campaign;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  customer: User;
}

/** Cliente que pediu para não receber campanhas desta loja. */
@Entity('marketing_opt_outs')
@Index(MARKETING_OPT_OUT_UNIQUE_INDEX, ['store', 'customer'], { unique: true })
export class MarketingOptOut extends BaseEntity {
  /** Por onde veio o pedido: a loja anotou, ou o próprio cliente. */
  @Column({ type: 'varchar', length: 20 })
  source: 'store' | 'whatsapp' | 'email';

  @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: false })
  store: Store;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  customer: User;
}
