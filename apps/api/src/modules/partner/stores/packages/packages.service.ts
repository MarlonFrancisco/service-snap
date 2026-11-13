import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  addDaysToDateKey,
  getStoreToday,
} from '../../../../utils/helpers/store-date.helpers';
import { normalizePhoneNumber } from '../../../../utils/helpers/user.helpers';
import { UsersService } from '../../../users/users.service';
import { PaymentsService } from '../cash/payments.service';
import { Service } from '../category/service/service.entity';
import { CheckoutItem } from '../checkout/checkout.entity';
import { Store } from '../store.entity';
import {
  CustomerPackage,
  CustomerPackageItem,
} from './customer-package.entity';
import type {
  CreateServicePackageDto,
  PackageItemDto,
  SellPackageDto,
  UpdateServicePackageDto,
} from './dto/package.dto';
import { toPackageBalance, toPackageUsage } from './packages.helpers';
import { ServicePackage, ServicePackageItem } from './service-package.entity';

/**
 * Pacotes vendidos e cobrados fora do app. O app só controla o saldo de
 * sessões; a baixa acontece no fechamento do atendimento.
 */
@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(ServicePackage)
    private readonly packageRepository: Repository<ServicePackage>,
    @InjectRepository(CustomerPackage)
    private readonly customerPackageRepository: Repository<CustomerPackage>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(CheckoutItem)
    private readonly checkoutItemRepository: Repository<CheckoutItem>,
    private readonly paymentsService: PaymentsService,
    private readonly usersService: UsersService,
  ) {}

  list(storeId: string, onlyActive = false) {
    return this.packageRepository.find({
      where: { store: { id: storeId }, ...(onlyActive && { isActive: true }) },
      relations: ['items', 'items.service'],
      order: { name: 'ASC' },
    });
  }

  async create(storeId: string, dto: CreateServicePackageDto) {
    const items = await this.buildItems(storeId, dto.items);
    const { id } = await this.packageRepository.save({
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price,
      validityDays: dto.validityDays ?? null,
      store: { id: storeId },
      items,
    });

    return this.findInStore(storeId, id);
  }

  async update(storeId: string, id: string, dto: UpdateServicePackageDto) {
    await this.findInStore(storeId, id);
    const items = dto.items && (await this.buildItems(storeId, dto.items));

    await this.packageRepository.manager.transaction(async (manager) => {
      await manager.update(ServicePackage, id, {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.validityDays !== undefined && {
          validityDays: dto.validityDays,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      });

      if (items) {
        await manager.delete(ServicePackageItem, { package: { id } });
        await manager.save(
          ServicePackageItem,
          items.map((item) => ({ ...item, package: { id } })),
        );
      }
    });

    return this.findInStore(storeId, id);
  }

  /** Vende: copia nome e serviços do modelo e registra o pagamento, se veio. */
  async sell(
    storeId: string,
    packageId: string,
    dto: SellPackageDto,
    soldById: string,
  ) {
    const [servicePackage, store] = await Promise.all([
      this.findInStore(storeId, packageId),
      this.storeRepository.findOneBy({ id: storeId }),
    ]);

    if (!servicePackage.isActive) {
      throw new ConflictException('Package is not available for sale');
    }

    const customerId = await this.resolveCustomer(dto, store);
    const today = getStoreToday(store);

    const saved = await this.customerPackageRepository.manager.transaction(
      async (manager) => {
        const customerPackage = await manager.save(CustomerPackage, {
          name: servicePackage.name,
          pricePaid: dto.pricePaid ?? servicePackage.price,
          expiresOn: servicePackage.validityDays
            ? addDaysToDateKey(today, servicePackage.validityDays - 1)
            : null,
          soldById,
          notes: dto.notes ?? null,
          store: { id: storeId },
          customer: { id: customerId },
          package: { id: servicePackage.id },
          items: servicePackage.items.map((item) =>
            manager.create(CustomerPackageItem, {
              serviceName: item.service.name,
              quantity: item.quantity,
              used: 0,
              service: { id: item.service.id },
            }),
          ),
        });

        await this.paymentsService.record(
          manager,
          storeId,
          dto.payments ?? [],
          { customerPackageId: customerPackage.id, customerId },
          soldById,
        );

        return customerPackage;
      },
    );

    return this.findCustomerPackage(storeId, saved.id);
  }

  /** Pacotes do cliente na loja, com saldo; `onlyUsable` tira vencidos e cancelados. */
  async listForCustomer(
    storeId: string,
    customerId: string,
    onlyUsable = false,
  ) {
    const [store, packages] = await Promise.all([
      this.storeRepository.findOneBy({ id: storeId }),
      this.customerPackageRepository.find({
        where: { store: { id: storeId }, customer: { id: customerId } },
        relations: ['items', 'items.service'],
        order: { purchasedAt: 'DESC' },
      }),
    ]);
    const today = getStoreToday(store);
    const usages = await this.findUsages(packages);
    const balances = packages.map((item) =>
      toPackageBalance(item, today, usages.get(item.id)),
    );

    return onlyUsable
      ? balances.filter(
          (balance) =>
            balance.status === 'active' &&
            !balance.isExpired &&
            balance.items.some((item) => item.remaining > 0),
        )
      : balances;
  }

  /** Sessões usadas por pacote, a partir dos fechamentos que deram baixa. */
  private async findUsages(packages: CustomerPackage[]) {
    const itemIds = packages.flatMap((pkg) =>
      (pkg.items ?? []).map((item) => item.id),
    );
    const byPackage = new Map<string, ReturnType<typeof toPackageUsage>[]>();

    if (!itemIds.length) return byPackage;

    const packageOfItem = new Map(
      packages.flatMap((pkg) =>
        (pkg.items ?? []).map((item) => [item.id, pkg.id] as const),
      ),
    );
    const checkoutItems = await this.checkoutItemRepository.find({
      where: { customerPackageItem: { id: In(itemIds) } },
      relations: [
        'customerPackageItem',
        'schedule',
        'schedule.service',
        'schedule.storeMember',
        'schedule.storeMember.user',
      ],
      order: { schedule: { date: 'DESC', startTime: 'DESC' } },
    });

    for (const item of checkoutItems) {
      const packageId = packageOfItem.get(item.customerPackageItem.id);
      byPackage.set(packageId, [
        ...(byPackage.get(packageId) ?? []),
        toPackageUsage(item),
      ]);
    }

    return byPackage;
  }

  /** Cancela o saldo restante; o que já foi usado continua no histórico. */
  async cancelCustomerPackage(storeId: string, id: string) {
    const result = await this.customerPackageRepository.update(
      { id, store: { id: storeId }, status: 'active' },
      { status: 'cancelled', cancelledAt: new Date() },
    );

    if (!result.affected) throw new NotFoundException('Package not found');

    return this.findCustomerPackage(storeId, id);
  }

  private async findCustomerPackage(storeId: string, id: string) {
    const [store, customerPackage] = await Promise.all([
      this.storeRepository.findOneBy({ id: storeId }),
      this.customerPackageRepository.findOne({
        where: { id, store: { id: storeId } },
        relations: ['items', 'items.service'],
      }),
    ]);

    if (!customerPackage) throw new NotFoundException('Package not found');

    return toPackageBalance(customerPackage, getStoreToday(store));
  }

  private async findInStore(storeId: string, id: string) {
    const servicePackage = await this.packageRepository.findOne({
      where: { id, store: { id: storeId } },
      relations: ['items', 'items.service'],
    });

    if (!servicePackage) throw new NotFoundException('Package not found');

    return servicePackage;
  }

  /** Serviços da própria loja; o mesmo serviço repetido soma as quantidades. */
  private async buildItems(storeId: string, items: PackageItemDto[]) {
    const quantities = new Map<string, number>();
    for (const item of items) {
      quantities.set(
        item.serviceId,
        (quantities.get(item.serviceId) ?? 0) + item.quantity,
      );
    }

    const services = await this.serviceRepository.find({
      where: { id: In([...quantities.keys()]), store: { id: storeId } },
    });

    if (services.length !== quantities.size) {
      throw new BadRequestException('Service not found in this store');
    }

    return [...quantities.entries()].map(([serviceId, quantity]) =>
      this.packageRepository.manager.create(ServicePackageItem, {
        quantity,
        service: { id: serviceId },
      }),
    );
  }

  /** Telefone sem DDI é lido como do país da loja, como no agendamento manual. */
  private async resolveCustomer(dto: SellPackageDto, store: Store) {
    if (dto.customerId) {
      await this.usersService.findById(dto.customerId);
      return dto.customerId;
    }

    const telephone = normalizePhoneNumber(
      dto.customer?.telephone,
      store?.country,
    );

    if (!dto.customer?.email && !telephone) {
      throw new BadRequestException('Customer is required');
    }

    const customer = await this.usersService.upsert({
      email: dto.customer.email,
      telephone,
      firstName: dto.customer.firstName,
      lastName: dto.customer.lastName,
    });

    return customer.id;
  }
}
