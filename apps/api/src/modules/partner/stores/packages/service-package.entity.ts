import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { numericTransformer } from '../../../../utils/helpers/database.helpers';
import { BaseEntity } from '../../../database/base.entity';
import { Service } from '../category/service/service.entity';
import { Store } from '../store.entity';

/** Modelo de pacote que a loja vende (ex.: 4 cortes em 30 dias). */
@Entity('service_packages')
export class ServicePackage extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  /** Preço de tabela; o cobrado de cada cliente fica em `CustomerPackage`. */
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  price: number;

  /** Dias de validade a partir da venda; vazio não vence. */
  @Column({ type: 'int', nullable: true })
  validityDays: number | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: false })
  store: Store;

  @OneToMany(() => ServicePackageItem, (item) => item.package, {
    cascade: true,
  })
  items: ServicePackageItem[];
}

@Entity('service_package_items')
export class ServicePackageItem extends BaseEntity {
  @Column({ type: 'int' })
  quantity: number;

  @ManyToOne(() => ServicePackage, (servicePackage) => servicePackage.items, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  package: ServicePackage;

  @ManyToOne(() => Service, { onDelete: 'CASCADE', nullable: false })
  service: Service;
}
