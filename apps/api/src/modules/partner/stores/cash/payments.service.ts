import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, type EntityManager } from 'typeorm';
import { getStoreTimezone } from '../../../../utils/helpers/region.helpers';
import { Store } from '../store.entity';
import { CashSession } from './cash-session.entity';
import { summarizePayments } from './cash.helpers';
import type { TPaymentLinks } from './cash.types';
import type {
  PaymentInputDto,
  PaymentQueryDto,
  RegisterPaymentDto,
} from './dto/cash.dto';
import { StorePayment } from './store-payment.entity';

const MAX_PERIOD_DAYS = 366;

/**
 * Registro do que a loja recebeu fora do app. Fechamento e venda de pacote
 * chamam `record` dentro da própria transação; o pagamento entra no caixa
 * aberto, se houver.
 */
@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(StorePayment)
    private readonly paymentRepository: Repository<StorePayment>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async record(
    manager: EntityManager,
    storeId: string,
    inputs: PaymentInputDto[],
    links: TPaymentLinks,
    registeredById: string,
  ): Promise<StorePayment[]> {
    if (!inputs.length) return [];

    const session = await manager.findOne(CashSession, {
      where: { store: { id: storeId }, closedAt: IsNull() },
    });

    return manager.save(
      StorePayment,
      inputs.map((input) =>
        manager.create(StorePayment, {
          method: input.method,
          amount: input.amount,
          notes: input.notes ?? null,
          registeredById,
          store: { id: storeId },
          cashSession: session ? { id: session.id } : null,
          checkout: links.checkoutId ? { id: links.checkoutId } : null,
          customerPackage: links.customerPackageId
            ? { id: links.customerPackageId }
            : null,
          customer: links.customerId ? { id: links.customerId } : null,
        }),
      ),
    );
  }

  /** Pagamento avulso, sem fechamento nem pacote. */
  async register(storeId: string, dto: RegisterPaymentDto, userId: string) {
    const [payment] = await this.paymentRepository.manager.transaction(
      (manager) =>
        this.record(
          manager,
          storeId,
          [dto],
          { customerId: dto.customerId },
          userId,
        ),
    );

    return payment;
  }

  /**
   * Estorno marca o pagamento em vez de apagar. Depois de o caixa fechar não
   * dá mais: os totais gravados no fechamento deixariam de bater.
   */
  async void(storeId: string, id: string, reason: string, userId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id, store: { id: storeId } },
      relations: ['cashSession'],
    });

    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.voidedAt) throw new ConflictException('Payment already voided');
    if (payment.cashSession?.closedAt) {
      throw new ConflictException('Cash session already closed');
    }

    await this.paymentRepository.update(id, {
      voidedAt: new Date(),
      voidedById: userId,
      voidReason: reason,
    });

    return { id };
  }

  /** Estorna os pagamentos de um fechamento desfeito. */
  async voidByCheckout(
    manager: EntityManager,
    checkoutId: string,
    userId: string,
  ) {
    const payments = await manager.find(StorePayment, {
      where: { checkout: { id: checkoutId }, voidedAt: IsNull() },
      relations: ['cashSession'],
    });

    if (payments.some((payment) => payment.cashSession?.closedAt)) {
      throw new ConflictException('Cash session already closed');
    }

    if (!payments.length) return;

    await manager.update(
      StorePayment,
      payments.map((payment) => payment.id),
      {
        voidedAt: new Date(),
        voidedById: userId,
        voidReason: 'Fechamento desfeito',
      },
    );
  }

  /** Período em dias do fuso da loja, com totais por forma de pagamento. */
  async list(storeId: string, { from, to, method }: PaymentQueryDto) {
    const days = (Date.parse(to) - Date.parse(from)) / 86_400_000;

    if (days < 0 || days > MAX_PERIOD_DAYS) {
      throw new BadRequestException(
        `Period must be between 0 and ${MAX_PERIOD_DAYS} days`,
      );
    }

    const store = await this.storeRepository.findOneBy({ id: storeId });
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.customer', 'customer')
      .leftJoinAndSelect('payment.checkout', 'checkout')
      .leftJoinAndSelect('payment.customerPackage', 'customerPackage')
      .where('payment.storeId = :storeId', { storeId })
      .andWhere(
        '(payment.paidAt AT TIME ZONE :timezone)::date BETWEEN :from AND :to',
        { timezone: getStoreTimezone(store), from, to },
      )
      .orderBy('payment.paidAt', 'DESC');

    if (method) query.andWhere('payment.method = :method', { method });

    const payments = await query.getMany();

    return {
      summary: summarizePayments(payments),
      payments: payments.map((payment) => ({
        ...payment,
        customer: payment.customer && {
          id: payment.customer.id,
          firstName: payment.customer.firstName,
          lastName: payment.customer.lastName,
        },
        checkout: payment.checkout && { id: payment.checkout.id },
        customerPackage: payment.customerPackage && {
          id: payment.customerPackage.id,
          name: payment.customerPackage.name,
        },
      })),
    };
  }
}
