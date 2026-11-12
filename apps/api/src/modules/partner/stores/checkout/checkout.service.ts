import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, type EntityManager } from 'typeorm';
import { runInBackground } from '../../../../utils/helpers/background.helpers';
import { isUniqueViolation } from '../../../../utils/helpers/database.helpers';
import { sumMoney } from '../../../../utils/helpers/money.helpers';
import { getStoreToday } from '../../../../utils/helpers/store-date.helpers';
import { getUserFullName } from '../../../../utils/helpers/user.helpers';
import { PaymentsService } from '../cash/payments.service';
import { getRewardDiscount } from '../loyalty/loyalty.helpers';
import { LoyaltyService } from '../loyalty/loyalty.service';
import {
  CustomerPackage,
  CustomerPackageItem,
} from '../packages/customer-package.entity';
import { getSessionValue, pickPackageItem } from '../packages/packages.helpers';
import { ScheduleDto } from '../schedule/dto/schedule.dto';
import { Schedule } from '../schedule/schedule.entity';
import { ScheduleService } from '../schedule/schedule.service';
import { Store } from '../store.entity';
import { Checkout, CheckoutItem } from './checkout.entity';
import { calculateCheckout } from './checkout.helpers';
import type { TCheckoutLine } from './checkout.types';
import type { CreateCheckoutDto } from './dto/checkout.dto';

const CHECKOUT_RELATIONS = [
  'items',
  'items.schedule',
  'items.schedule.service',
  'items.customerPackageItem',
  'customer',
  'loyaltyReward',
];

/**
 * Fechar o atendimento: conclui, dá baixa no pacote, resgata a recompensa e
 * registra o que a loja recebeu. O app não cobra nada: só anota.
 */
@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(Checkout)
    private readonly checkoutRepository: Repository<Checkout>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(CustomerPackage)
    private readonly customerPackageRepository: Repository<CustomerPackage>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private readonly scheduleService: ScheduleService,
    private readonly paymentsService: PaymentsService,
    private readonly loyaltyService: LoyaltyService,
  ) {}

  /** O que a tela precisa para montar o fechamento de uma visita. */
  async preview(storeId: string, scheduleIds: string[]) {
    const schedules = await this.loadVisit(storeId, scheduleIds);
    const customerId = schedules[0].user?.id ?? null;
    const [store, packages, loyalty, existing] = await Promise.all([
      this.storeRepository.findOneBy({ id: storeId }),
      customerId ? this.findCustomerPackages(storeId, customerId) : [],
      customerId ? this.loyaltyService.getProgress(storeId, customerId) : null,
      this.findItems(scheduleIds),
    ]);
    const today = getStoreToday(store);

    return {
      customer: schedules[0].user && {
        id: schedules[0].user.id,
        name: getUserFullName(schedules[0].user),
      },
      items: schedules.map((schedule) => {
        const packageItem = schedule.service
          ? pickPackageItem(packages, schedule.service.id, today)
          : null;

        return {
          scheduleId: schedule.id,
          date: schedule.date,
          startTime: schedule.startTime,
          status: schedule.status,
          service: schedule.service && {
            id: schedule.service.id,
            name: schedule.service.name,
          },
          price: schedule.price ?? 0,
          checkoutId:
            existing.find((item) => item.schedule.id === schedule.id)?.checkout
              .id ?? null,
          package: packageItem && {
            customerPackageId: packageItem.customerPackage.id,
            name: packageItem.customerPackage.name,
            remaining: packageItem.quantity - packageItem.used,
          },
        };
      }),
      rewards: (loyalty?.rewards ?? []).filter(
        (reward) => reward.status === 'available',
      ),
    };
  }

  async create(storeId: string, dto: CreateCheckoutDto, userId: string) {
    const scheduleIds = [...new Set(dto.scheduleIds)];
    const schedules = await this.loadVisit(storeId, scheduleIds);

    if ((await this.findItems(scheduleIds)).length) {
      throw new ConflictException('Schedule already checked out');
    }

    const customerId = schedules[0].user?.id ?? null;

    // Pela agenda: valida como qualquer mudança de status e dispara o webhook
    for (const schedule of schedules.filter((s) => s.status !== 'completed')) {
      await this.scheduleService.update(
        Object.assign(new ScheduleDto(), {
          id: schedule.id,
          status: 'completed',
          store: { id: storeId },
        }),
      );
    }

    let checkoutId: string;

    try {
      checkoutId = await this.checkoutRepository.manager.transaction(
        (manager) =>
          this.saveCheckout(manager, storeId, schedules, dto, userId),
      );
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Schedule already checked out');
      }
      throw error;
    }

    // Nova visita concluída pode ter liberado uma recompensa
    if (customerId) {
      runInBackground('Fidelidade depois do fechamento', () =>
        this.loyaltyService.getProgress(storeId, customerId),
      );
    }

    return this.findOne(storeId, checkoutId);
  }

  async findOne(storeId: string, id: string) {
    const checkout = await this.checkoutRepository.findOne({
      where: { id, store: { id: storeId } },
      relations: CHECKOUT_RELATIONS,
    });

    if (!checkout) throw new NotFoundException('Checkout not found');

    return {
      ...checkout,
      customer: checkout.customer && {
        id: checkout.customer.id,
        name: getUserFullName(checkout.customer),
      },
      items: checkout.items.map((item) => ({
        id: item.id,
        price: item.price,
        baseAmount: item.baseAmount,
        scheduleId: item.schedule.id,
        serviceName: item.schedule.service?.name ?? null,
        fromPackage: Boolean(item.customerPackageItem),
      })),
    };
  }

  /**
   * Desfaz o lado financeiro: estorna os pagamentos, devolve a sessão do pacote
   * e a recompensa. Os atendimentos continuam concluídos. Não vale depois de o
   * caixa daqueles pagamentos fechar.
   */
  async undo(storeId: string, id: string, userId: string) {
    await this.checkoutRepository.manager.transaction(async (manager) => {
      const checkout = await manager.findOne(Checkout, {
        where: { id, store: { id: storeId } },
        relations: ['items', 'items.customerPackageItem', 'loyaltyReward'],
      });

      if (!checkout) throw new NotFoundException('Checkout not found');

      await this.paymentsService.voidByCheckout(manager, id, userId);

      for (const item of checkout.items) {
        if (!item.customerPackageItem) continue;

        await manager.decrement(
          CustomerPackageItem,
          { id: item.customerPackageItem.id },
          'used',
          1,
        );
      }

      if (checkout.loyaltyReward) {
        await this.loyaltyService.release(manager, checkout.loyaltyReward.id);
      }

      await manager.delete(Checkout, id);
    });

    return { id };
  }

  private async saveCheckout(
    manager: EntityManager,
    storeId: string,
    schedules: Schedule[],
    dto: CreateCheckoutDto,
    userId: string,
  ): Promise<string> {
    const customerId = schedules[0].user?.id ?? null;
    const store = await manager.findOneBy(Store, { id: storeId });
    const today = getStoreToday(store);
    const packages =
      customerId && dto.usePackages !== false
        ? await this.findCustomerPackages(storeId, customerId, manager)
        : [];

    // Uma sessão por atendimento; o UPDATE condicional barra saldo negativo
    const usedItems: Array<CustomerPackageItem | null> = [];
    for (const schedule of schedules) {
      const item = schedule.service
        ? pickPackageItem(packages, schedule.service.id, today)
        : null;

      if (item) {
        const result = await manager
          .createQueryBuilder()
          .update(CustomerPackageItem)
          .set({ used: () => '"used" + 1' })
          .where('id = :id AND "used" < "quantity"', { id: item.id })
          .execute();

        if (!result.affected) {
          throw new ConflictException('Package has no sessions left');
        }

        item.used += 1;
      }

      usedItems.push(item);
    }

    const lines: TCheckoutLine[] = schedules.map((schedule, index) => ({
      scheduleId: schedule.id,
      serviceId: schedule.service?.id ?? null,
      price: schedule.price ?? 0,
      sessionValue: usedItems[index]
        ? getSessionValue(usedItems[index].customerPackage)
        : null,
    }));

    const reward = dto.rewardId
      ? await this.loyaltyService.redeem(
          manager,
          storeId,
          dto.rewardId,
          customerId,
          userId,
        )
      : null;
    const rewardDiscount = reward
      ? getRewardDiscount(
          reward,
          lines.filter((line) => line.sessionValue === null),
        )
      : 0;

    if (rewardDiscount === null) {
      throw new BadRequestException('Reward service is not in this visit');
    }

    const totals = calculateCheckout(
      lines,
      sumMoney([dto.discount ?? 0, rewardDiscount]),
      sumMoney(dto.payments.map((payment) => payment.amount)),
    );

    const checkout = await manager.save(Checkout, {
      closedById: userId,
      subtotal: totals.subtotal,
      discount: totals.discount,
      total: totals.total,
      received: totals.received,
      notes: dto.notes ?? null,
      store: { id: storeId },
      customer: customerId ? { id: customerId } : null,
      loyaltyReward: reward ? { id: reward.id } : null,
      items: lines.map((line, index) =>
        manager.create(CheckoutItem, {
          price: line.price,
          baseAmount: totals.baseAmounts[index],
          schedule: { id: line.scheduleId },
          customerPackageItem: usedItems[index]
            ? { id: usedItems[index].id }
            : null,
        }),
      ),
    });

    await this.paymentsService.record(
      manager,
      storeId,
      dto.payments,
      { checkoutId: checkout.id, customerId },
      userId,
    );

    return checkout.id;
  }

  /** Atendimentos da loja, todos do mesmo cliente e não cancelados. */
  private async loadVisit(storeId: string, scheduleIds: string[]) {
    const schedules = await this.scheduleRepository.find({
      where: { id: In(scheduleIds), store: { id: storeId } },
      relations: ['service', 'user'],
      order: { date: 'ASC', startTime: 'ASC' },
    });

    if (schedules.length !== new Set(scheduleIds).size) {
      throw new NotFoundException('Schedule not found');
    }

    if (new Set(schedules.map((schedule) => schedule.user?.id)).size > 1) {
      throw new BadRequestException('Schedules belong to different customers');
    }

    if (
      schedules.some((schedule) =>
        ['cancelled', 'no-show'].includes(schedule.status),
      )
    ) {
      throw new ConflictException('Cancelled schedules cannot be checked out');
    }

    return schedules;
  }

  private findItems(scheduleIds: string[]) {
    return this.checkoutRepository.manager.find(CheckoutItem, {
      where: { schedule: { id: In(scheduleIds) } },
      relations: ['schedule', 'checkout'],
    });
  }

  private findCustomerPackages(
    storeId: string,
    customerId: string,
    manager: EntityManager = this.customerPackageRepository.manager,
  ) {
    return manager.find(CustomerPackage, {
      where: {
        store: { id: storeId },
        customer: { id: customerId },
        status: 'active',
      },
      relations: ['items', 'items.service'],
    });
  }
}
