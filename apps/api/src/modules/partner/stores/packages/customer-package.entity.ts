import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { numericTransformer } from '../../../../utils/helpers/database.helpers';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../../users/user.entity';
import { Service } from '../category/service/service.entity';
import { Store } from '../store.entity';
import { ServicePackage } from './service-package.entity';
import type { TCustomerPackageStatus } from './packages.types';

export const CUSTOMER_PACKAGE_CUSTOMER_INDEX =
  'idx_customer_packages_store_customer';

/**
 * Pacote vendido a um cliente, com o saldo por serviço. Nome e serviços são
 * copiados do modelo: mudar o modelo depois não altera o que já foi vendido.
 */
@Entity('customer_packages')
@Index(CUSTOMER_PACKAGE_CUSTOMER_INDEX, ['store', 'customer'])
export class CustomerPackage extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  pricePaid: number;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  purchasedAt: Date;

  /** Último dia de uso (`YYYY-MM-DD`); vazio não vence. */
  @Column({ type: 'date', nullable: true })
  expiresOn: string | null;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: TCustomerPackageStatus;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  soldById: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  notes: string | null;

  @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: false })
  store: Store;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  customer: User;

  @ManyToOne(() => ServicePackage, { onDelete: 'SET NULL', nullable: true })
  package: ServicePackage | null;

  @OneToMany(() => CustomerPackageItem, (item) => item.customerPackage, {
    cascade: true,
  })
  items: CustomerPackageItem[];
}

/** Saldo de um serviço dentro do pacote vendido. */
@Entity('customer_package_items')
export class CustomerPackageItem extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  serviceName: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  used: number;

  @ManyToOne(
    () => CustomerPackage,
    (customerPackage) => customerPackage.items,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  customerPackage: CustomerPackage;

  @ManyToOne(() => Service, { onDelete: 'SET NULL', nullable: true })
  service: Service | null;
}
