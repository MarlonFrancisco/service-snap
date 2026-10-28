import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../database/base.entity';
import { Review } from '../partner/stores/review/review.entity';
import { Schedule } from '../partner/stores/schedule/schedule.entity';
import { StoreMember } from '../partner/stores/store-member/store-member.entity';
import { Store } from '../partner/stores/store.entity';
import { Subscription } from '../subscription/subscription.entity';
import { Favorite } from './favorites/favorite.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', nullable: true, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({ type: 'varchar', nullable: true, unique: true, length: 20 })
  telephone: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ name: 'first_name', type: 'varchar', nullable: true, length: 60 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', nullable: true, length: 60 })
  lastName: string;

  @Column({ name: 'auth_code', type: 'char', length: 6, nullable: true })
  @Index()
  authCode: string;

  @Column({ name: 'auth_code_expires_at', type: 'timestamp', nullable: true })
  authCodeExpiresAt: Date;

  @Column({ type: 'boolean', default: false, nullable: true })
  isDeleted: boolean;

  @Column({
    name: 'payment_customer_id',
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  paymentCustomerId: string;

  @Column({
    name: 'accepted_terms',
    type: 'boolean',
    default: false,
    nullable: true,
  })
  acceptedTerms: boolean;

  @Column({ type: 'char', length: 2, default: 'BR', nullable: true })
  country: string;

  /** Public share code for the bilateral referral program. */
  @Column({
    name: 'referral_code',
    type: 'varchar',
    length: 12,
    unique: true,
    nullable: true,
  })
  @Index()
  referralCode: string | null;

  /** User who referred this account (client or partner). */
  @Column({ name: 'referred_by_id', type: 'uuid', nullable: true })
  referredById: string | null;

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions: Subscription[];

  @OneToMany(() => Store, (store) => store.id)
  stores: Store[];

  @OneToMany(() => StoreMember, (storeMember) => storeMember.user)
  storeMembers: StoreMember[];

  @OneToMany(() => Schedule, (schedule) => schedule.user)
  schedules: Schedule[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];
}
