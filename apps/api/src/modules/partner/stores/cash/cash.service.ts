import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { isUniqueViolation } from '../../../../utils/helpers/database.helpers';
import { sumMoney } from '../../../../utils/helpers/money.helpers';
import { CashSession } from './cash-session.entity';
import { summarizePayments } from './cash.helpers';
import type { CloseCashSessionDto, OpenCashSessionDto } from './dto/cash.dto';
import { StorePayment } from './store-payment.entity';

const SESSIONS_PAGE = 30;

@Injectable()
export class CashService {
  constructor(
    @InjectRepository(CashSession)
    private readonly sessionRepository: Repository<CashSession>,
    @InjectRepository(StorePayment)
    private readonly paymentRepository: Repository<StorePayment>,
  ) {}

  /** O índice parcial garante um caixa aberto por vez, mesmo com dois cliques. */
  async open(storeId: string, dto: OpenCashSessionDto, userId: string) {
    try {
      return await this.sessionRepository.save({
        openingAmount: dto.openingAmount,
        openedById: userId,
        store: { id: storeId },
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('There is already an open cash session');
      }
      throw error;
    }
  }

  /** Caixa aberto com os totais até agora, ou `null`. */
  async current(storeId: string) {
    const session = await this.sessionRepository.findOne({
      where: { store: { id: storeId }, closedAt: IsNull() },
    });

    return session ? this.withSummary(session) : null;
  }

  async findOne(storeId: string, id: string) {
    return this.withSummary(await this.findInStore(storeId, id), true);
  }

  async list(storeId: string, page = 1) {
    const current = Math.max(Number(page) || 1, 1);
    const [data, total] = await this.sessionRepository.findAndCount({
      where: { store: { id: storeId } },
      order: { openedAt: 'DESC' },
      skip: (current - 1) * SESSIONS_PAGE,
      take: SESSIONS_PAGE,
    });

    return {
      data,
      meta: {
        total,
        page: current,
        limit: SESSIONS_PAGE,
        totalPages: Math.ceil(total / SESSIONS_PAGE),
      },
    };
  }

  /** Grava os totais do momento e a diferença entre contado e esperado. */
  async close(
    storeId: string,
    id: string,
    dto: CloseCashSessionDto,
    userId: string,
  ) {
    const session = await this.findInStore(storeId, id);

    if (session.closedAt) {
      throw new ConflictException('Cash session already closed');
    }

    const { summary } = await this.withSummary(session);

    await this.sessionRepository.update(
      { id, closedAt: IsNull() },
      {
        closedAt: new Date(),
        closedById: userId,
        countedCash: dto.countedCash,
        expectedCash: summary.expectedCash,
        totals: summary.totals,
        notes: dto.notes ?? null,
      },
    );

    return this.findOne(storeId, id);
  }

  private async findInStore(storeId: string, id: string) {
    const session = await this.sessionRepository.findOne({
      where: { id, store: { id: storeId } },
    });

    if (!session) throw new NotFoundException('Cash session not found');

    return session;
  }

  private async withSummary(session: CashSession, withPayments = false) {
    const payments = await this.paymentRepository.find({
      where: { cashSession: { id: session.id } },
      relations: withPayments ? ['customer'] : [],
      order: { paidAt: 'ASC' },
    });
    const summary = summarizePayments(payments, session.openingAmount);

    return {
      ...session,
      summary,
      difference:
        session.countedCash == null
          ? null
          : sumMoney([session.countedCash, -summary.expectedCash]),
      ...(withPayments && {
        payments: payments.map((payment) => ({
          ...payment,
          customer: payment.customer && {
            id: payment.customer.id,
            firstName: payment.customer.firstName,
            lastName: payment.customer.lastName,
          },
        })),
      }),
    };
  }
}
