import { Column, Entity, Index, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { Favorite } from '../../users/favorites/favorite.entity';
import { User } from '../../users/user.entity';
import { StoreOnboarding } from '../onboarding/store-onboarding.entity';
import { Category } from './category/category.entity';
import { Service } from './category/service/service.entity';
import { Gallery } from './gallery/gallery.entity';
import { NotificationsHistory } from './notifications/history/history.entity';
import { NotificationsSettings } from './notifications/settings/settings.entity';
import { Review } from './review/review.entity';
import { Schedule } from './schedule/schedule.entity';
import { StoreMember } from './store-member/store-member.entity';
import { WhatsappConfig } from './whatsapp/whatsapp.entity';

export const STORE_SLUG_UNIQUE = 'UQ_stores_slug';

@Entity('stores')
@Index(STORE_SLUG_UNIQUE, ['slug'], { unique: true })
export class Store extends BaseEntity {
  // general information

  @Column({ type: 'varchar', nullable: true })
  name: string;

  /** Link curto: `/booking/<slug>` (ver `pnpm migrate:store-slugs`). */
  @Column({ type: 'varchar', length: 80, nullable: true })
  slug: string | null;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  amenities: string[];

  @Column({ type: 'boolean', default: false, nullable: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  isDeleted: boolean;

  // goals

  @Column({ type: 'int', default: 0 })
  weeklyGoal: number;

  @Column({ type: 'int', default: 0 })
  monthlyGoal: number;

  @Column({ type: 'int', default: 0 })
  quarterlyGoal: number;

  // business hours
  @Column({ type: 'char', length: 5, nullable: true })
  openTime: string;

  @Column({ type: 'char', length: 5, nullable: true })
  closeTime: string;

  @Column({ type: 'char', length: 5, nullable: true })
  lunchStartTime: string;

  @Column({ type: 'char', length: 5, nullable: true })
  lunchEndTime: string;

  @Column({ type: 'jsonb', nullable: true })
  businessDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };

  // schedule rules (ver `pnpm migrate:schedule-rules`)

  /** Passo da grade de horários oferecidos ao cliente. */
  @Column({ type: 'int', default: 30 })
  slotIntervalMinutes: number;

  /** Folga mínima entre dois atendimentos do mesmo profissional. */
  @Column({ type: 'int', default: 0 })
  bufferMinutes: number;

  /** Antecedência mínima para o cliente reservar. */
  @Column({ type: 'int', default: 0 })
  minAdvanceMinutes: number;

  /** Até quantos dias à frente o cliente reserva. 0 é sem limite. */
  @Column({ type: 'int', default: 0 })
  maxAdvanceDays: number;

  /** Horas antes do início até quando o cliente cancela. 0 é até o início. */
  @Column({ type: 'int', default: 0 })
  cancellationNoticeHours: number;

  /** Horas antes do início até quando o cliente remarca. 0 é até o início. */
  @Column({ type: 'int', default: 0 })
  rescheduleNoticeHours: number;

  // location & internationalization

  @Column({ type: 'char', length: 2, default: 'BR', nullable: true })
  country: string;

  @Column({ type: 'char', length: 3, default: 'BRL', nullable: true })
  currency: string;

  @Column({ type: 'varchar', default: 'America/Sao_Paulo', nullable: true })
  timezone: string;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  state: string;

  @Column({ type: 'varchar', nullable: true })
  zipCode: string;

  // contact

  @Column({ type: 'varchar', nullable: true })
  telephone: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  website: string;

  @Column({ type: 'varchar', nullable: true })
  instagram: string;

  @Column({ type: 'varchar', nullable: true })
  facebook: string;

  // relations

  @OneToMany(() => StoreMember, (storeMember) => storeMember.store)
  storeMembers: StoreMember[];

  @OneToMany(() => Service, (service) => service.store)
  services: Service[];

  @OneToMany(() => Category, (category) => category.store)
  categories: Category[];

  @OneToMany(() => Gallery, (gallery) => gallery.store)
  gallery: Gallery[];

  @ManyToOne(() => User, (user) => user.stores, { onDelete: 'CASCADE' })
  @Index(['owner'])
  owner: User;

  @OneToMany(() => Schedule, (schedule) => schedule.store)
  schedules: Schedule[];

  @OneToMany(
    () => NotificationsHistory,
    (notificationsHistory) => notificationsHistory.store,
  )
  notificationsHistory: NotificationsHistory[];

  @OneToOne(
    () => NotificationsSettings,
    (notificationsSettings) => notificationsSettings.store,
  )
  notificationsSettings: NotificationsSettings;

  @OneToOne(() => WhatsappConfig, (whatsappConfig) => whatsappConfig.store)
  whatsappConfig: WhatsappConfig;

  @OneToOne(() => StoreOnboarding, (onboarding) => onboarding.store)
  onboarding: StoreOnboarding;

  @OneToMany(() => Review, (review) => review.store)
  reviews: Review[];

  @OneToMany(() => Favorite, (favorite) => favorite.store)
  favorites: Favorite[];
}
