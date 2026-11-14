import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toDateKey } from '../../../../utils/helpers/schedule.helpers';
import { getStoreToday } from '../../../../utils/helpers/store-date.helpers';
import { getUserFullName } from '../../../../utils/helpers/user.helpers';
import { Service } from '../category/service/service.entity';
import { CheckoutItem } from '../checkout/checkout.entity';
import { Schedule } from '../schedule/schedule.entity';
import { StoreMember } from '../store-member/store-member.entity';
import { Store } from '../store.entity';
import { CommissionRule } from './commission-rule.entity';
import { buildCommissionReport } from './commissions.helpers';
import type {
  TCommissionReport,
  TCommissionRuleRef,
} from './commissions.types';
import type {
  CommissionReportQueryDto,
  CreateCommissionRuleDto,
} from './dto/commission.dto';

// Um ano de atendimentos é o bastante para folha e evita relatório sem fim
const MAX_REPORT_DAYS = 366;

@Injectable()
export class CommissionsService {
  constructor(
    @InjectRepository(CommissionRule)
    private readonly ruleRepository: Repository<CommissionRule>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(CheckoutItem)
    private readonly checkoutItemRepository: Repository<CheckoutItem>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(StoreMember)
    private readonly memberRepository: Repository<StoreMember>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  /** Todas as versões, da mais nova à mais antiga, para a tela mostrar o histórico. */
  async listRules(storeId: string) {
    const rules = await this.ruleRepository.find({
      where: { store: { id: storeId } },
      relations: ['storeMember', 'storeMember.user', 'service'],
      order: { effectiveFrom: 'DESC', createdAt: 'DESC' },
    });

    return rules.map((rule) => ({
      id: rule.id,
      type: rule.type,
      value: rule.value,
      effectiveFrom: rule.effectiveFrom,
      createdAt: rule.createdAt,
      storeMember: rule.storeMember && {
        id: rule.storeMember.id,
        name: getUserFullName(rule.storeMember.user),
      },
      service: rule.service && {
        id: rule.service.id,
        name: rule.service.name,
      },
    }));
  }

  /** Mudar uma regra é gravar uma versão nova; a anterior segue no histórico. */
  async createRule(
    storeId: string,
    dto: CreateCommissionRuleDto,
    createdById: string,
  ) {
    if (dto.type === 'percent' && dto.value > 100) {
      throw new BadRequestException('Percent commission must be up to 100');
    }

    const [member, service] = await Promise.all([
      dto.storeMemberId &&
        this.memberRepository.exists({
          where: { id: dto.storeMemberId, store: { id: storeId } },
        }),
      dto.serviceId &&
        this.serviceRepository.exists({
          where: { id: dto.serviceId, store: { id: storeId } },
        }),
    ]);

    if (dto.storeMemberId && !member) {
      throw new BadRequestException('Professional not found in this store');
    }
    if (dto.serviceId && !service) {
      throw new BadRequestException('Service not found in this store');
    }

    const saved = await this.ruleRepository.save({
      type: dto.type,
      value: dto.value,
      effectiveFrom: dto.effectiveFrom ?? (await this.storeToday(storeId)),
      createdById,
      store: { id: storeId },
      storeMember: dto.storeMemberId ? { id: dto.storeMemberId } : null,
      service: dto.serviceId ? { id: dto.serviceId } : null,
    });

    return { id: saved.id };
  }

  /** Só versão que ainda não começou a valer: as outras já entraram em relatório. */
  async deleteRule(storeId: string, id: string) {
    const rule = await this.ruleRepository.findOne({
      where: { id, store: { id: storeId } },
    });

    if (!rule) throw new NotFoundException('Commission rule not found');

    if (rule.effectiveFrom <= (await this.storeToday(storeId))) {
      throw new ConflictException(
        'Rule already in effect; create a new version instead',
      );
    }

    await this.ruleRepository.delete(id);

    return { id };
  }

  async report(
    storeId: string,
    { from, to, storeMemberId }: CommissionReportQueryDto,
  ): Promise<TCommissionReport> {
    const days = (Date.parse(to) - Date.parse(from)) / 86_400_000;

    if (days < 0 || days > MAX_REPORT_DAYS) {
      throw new BadRequestException(
        `Period must be between 0 and ${MAX_REPORT_DAYS} days`,
      );
    }

    const [rules, schedules] = await Promise.all([
      this.ruleRepository.find({
        where: { store: { id: storeId } },
        relations: ['storeMember', 'service'],
      }),
      this.scheduleRepository
        .createQueryBuilder('schedule')
        .innerJoinAndSelect('schedule.storeMember', 'member')
        .leftJoinAndSelect('member.user', 'memberUser')
        .leftJoinAndSelect('schedule.service', 'service')
        .leftJoinAndSelect('schedule.user', 'customer')
        .where('schedule.storeId = :storeId', { storeId })
        .andWhere("schedule.status = 'completed'")
        .andWhere('schedule.date BETWEEN :from AND :to', { from, to })
        .andWhere(storeMemberId ? 'member.id = :storeMemberId' : '1 = 1', {
          storeMemberId,
        })
        .orderBy('schedule.date', 'ASC')
        .addOrderBy('schedule.startTime', 'ASC')
        .getMany(),
    ]);

    const items = schedules.length
      ? await this.checkoutItemRepository
          .createQueryBuilder('item')
          .innerJoin('item.checkout', 'checkout')
          .leftJoinAndSelect('item.schedule', 'schedule')
          .leftJoinAndSelect('item.customerPackageItem', 'packageItem')
          .where('item.scheduleId IN (:...ids)', {
            ids: schedules.map((schedule) => schedule.id),
          })
          .getMany()
      : [];
    const baseOf = new Map(
      items.map((item) => [item.schedule.id, item.baseAmount]),
    );
    const fromPackage = new Set(
      items
        .filter((item) => item.customerPackageItem)
        .map((item) => item.schedule.id),
    );

    return buildCommissionReport(
      from,
      to,
      rules.map(
        (rule): TCommissionRuleRef => ({
          id: rule.id,
          type: rule.type,
          value: rule.value,
          effectiveFrom: rule.effectiveFrom,
          storeMemberId: rule.storeMember?.id ?? null,
          serviceId: rule.service?.id ?? null,
        }),
      ),
      schedules.map((schedule) => {
        const fromCheckout = baseOf.get(schedule.id);

        return {
          scheduleId: schedule.id,
          date: toDateKey(schedule.date),
          startTime: schedule.startTime,
          storeMemberId: schedule.storeMember.id,
          professionalName: getUserFullName(schedule.storeMember.user),
          serviceId: schedule.service?.id ?? null,
          serviceName: schedule.service?.name ?? 'Serviço',
          customerName: getUserFullName(schedule.user) || 'Cliente',
          baseAmount: fromCheckout ?? schedule.price ?? 0,
          baseSource: fromPackage.has(schedule.id)
            ? 'package'
            : fromCheckout !== undefined
              ? 'checkout'
              : 'price',
        };
      }),
    );
  }

  private async storeToday(storeId: string) {
    const store = await this.storeRepository.findOneBy({ id: storeId });

    return getStoreToday(store);
  }
}
