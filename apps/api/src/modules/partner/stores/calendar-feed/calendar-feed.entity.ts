import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { StoreMember } from '../store-member/store-member.entity';

export const CALENDAR_FEED_TOKEN_INDEX = 'uq_calendar_feeds_token';

/**
 * Link secreto da agenda de um profissional, para assinar no Google Agenda
 * (ou Apple/Outlook). Uma linha por profissional; gerar de novo troca o token
 * e o link antigo para de funcionar. Tabela própria para não mexer em
 * `store_members`.
 */
@Entity('calendar_feeds')
@Index(CALENDAR_FEED_TOKEN_INDEX, ['token'], { unique: true })
export class CalendarFeed extends BaseEntity {
  @Column({ type: 'varchar', length: 64 })
  token: string;

  @OneToOne(() => StoreMember, { onDelete: 'CASCADE' })
  @JoinColumn()
  storeMember: StoreMember;
}
