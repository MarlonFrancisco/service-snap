import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { PaginationQueryDto } from '../../../../utils/dto/pagination.dto';
import {
  toPage,
  toSkipTake,
} from '../../../../utils/helpers/pagination.helpers';
import type { TPage } from '../../../../utils/helpers/pagination.types';
import { normalizePhoneNumber } from '../../../../utils/helpers/user.helpers';
import { UsersService } from '../../../users/users.service';
import { Schedule } from '../schedule/schedule.entity';
import { Store } from '../store.entity';
import {
  CreateCustomerDto,
  CustomerQueryDto,
  UpdateCustomerDto,
} from './customer.dto';
import { StoreCustomer } from './customer.entity';
import { normalizeTags, toStoreCustomer } from './customer.helpers';
import type {
  TCustomerListFilter,
  TStoreCustomer,
  TStoreCustomerRow,
} from './customer.types';

/**
 * Clientes da loja: quem já agendou nela (está em `schedules`) e quem a equipe
 * cadastrou (`store_customers`). As contas de visitas saem dos agendamentos;
 * uma visita com vários serviços conta uma vez.
 */
const CUSTOMER_SELECT = `
  WITH "base" AS (
    SELECT "userId" AS "user_id" FROM "schedules"
    WHERE "storeId" = $1 AND "userId" IS NOT NULL
    UNION
    SELECT "userId" FROM "store_customers" WHERE "storeId" = $1
  )
  SELECT u."id", u."first_name", u."last_name", u."email", u."telephone",
    c."notes", c."tags",
    count(DISTINCT coalesce(s."bookingId"::text, s."id"::text))
      FILTER (WHERE s."status" <> 'cancelled') AS "visits",
    count(s."id") FILTER (WHERE s."status" = 'completed') AS "completed",
    count(s."id") FILTER (WHERE s."status" = 'no-show') AS "no_shows",
    count(DISTINCT coalesce(s."bookingId"::text, s."id"::text))
      FILTER (WHERE s."status" = 'cancelled') AS "cancelled",
    max(s."date") FILTER (WHERE s."status" IN ('completed', 'scheduled')
      AND s."date" <= current_date) AS "last_visit",
    min(s."date") FILTER (WHERE s."status" = 'scheduled'
      AND s."date" >= current_date) AS "next_visit",
    coalesce(sum(s."price") FILTER (WHERE s."status" = 'completed'), 0)
      AS "total_spent"
  FROM "base" b
  JOIN "users" u ON u."id" = b."user_id"
  LEFT JOIN "store_customers" c ON c."userId" = u."id" AND c."storeId" = $1
  LEFT JOIN "schedules" s ON s."userId" = u."id" AND s."storeId" = $1
`;

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(StoreCustomer)
    private readonly customerRepository: Repository<StoreCustomer>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private readonly usersService: UsersService,
  ) {}

  async findAll(
    storeId: string,
    { page, limit, search, tag }: CustomerQueryDto,
  ): Promise<TPage<TStoreCustomer>> {
    const { skip, take } = toSkipTake(page, limit);
    const { where, params } = this.buildFilter(storeId, { search, tag });
    const [rows, [{ total }]] = await Promise.all([
      this.customerRepository.query(
        `${CUSTOMER_SELECT} ${where}
         GROUP BY u."id", c."id"
         ORDER BY "last_visit" DESC NULLS LAST, u."first_name" ASC NULLS LAST
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, take, skip],
      ),
      this.customerRepository.query(
        `SELECT count(*)::int AS "total" FROM (
           ${CUSTOMER_SELECT} ${where} GROUP BY u."id", c."id"
         ) AS "list"`,
        params,
      ),
    ]);

    return toPage(
      (rows as TStoreCustomerRow[]).map(toStoreCustomer),
      total,
      page,
      take,
    );
  }

  /** Etiquetas já usadas na loja, para o filtro da lista. */
  async findTags(storeId: string): Promise<string[]> {
    const rows: { tag: string }[] = await this.customerRepository.query(
      `SELECT DISTINCT jsonb_array_elements_text("tags") AS "tag"
       FROM "store_customers" WHERE "storeId" = $1 ORDER BY "tag"`,
      [storeId],
    );

    return rows.map(({ tag }) => tag);
  }

  /** Ficha com o resumo; o histórico vem paginado em `findHistory`. */
  async findOne(storeId: string, userId: string): Promise<TStoreCustomer> {
    const [row] = await this.customerRepository.query(
      `${CUSTOMER_SELECT} WHERE u."id" = $2 GROUP BY u."id", c."id"`,
      [storeId, userId],
    );

    if (!row) {
      throw new NotFoundException('Customer not found');
    }

    return toStoreCustomer(row);
  }

  /** Atendimentos do cliente na loja, do mais recente para o mais antigo. */
  async findHistory(
    storeId: string,
    userId: string,
    { page, limit }: PaginationQueryDto,
  ): Promise<TPage<Schedule>> {
    await this.findOne(storeId, userId);

    const { skip, take } = toSkipTake(page, limit);
    const [schedules, total] = await this.scheduleRepository.findAndCount({
      where: { store: { id: storeId }, user: { id: userId } },
      relations: ['service', 'storeMember', 'storeMember.user', 'booking'],
      select: {
        service: { id: true, name: true, duration: true },
        storeMember: {
          id: true,
          user: { id: true, firstName: true, lastName: true },
        },
      },
      order: { date: 'DESC', startTime: 'DESC' },
      skip,
      take,
    });

    return toPage(schedules, total, page, take);
  }

  /** Grava notas e etiquetas, criando a ficha na primeira vez. */
  async update(
    storeId: string,
    userId: string,
    { notes, tags }: UpdateCustomerDto,
  ): Promise<TStoreCustomer> {
    await this.findOne(storeId, userId);
    await this.saveRecord(storeId, userId, { notes, tags });

    return this.findOne(storeId, userId);
  }

  /**
   * Cadastro manual, para quem ainda não agendou. Telefone sem DDI é lido como
   * do país da loja; se já houver conta com o contato, ela é reaproveitada.
   */
  async create(
    storeId: string,
    { firstName, lastName, telephone, email, notes, tags }: CreateCustomerDto,
  ): Promise<TStoreCustomer> {
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
      select: { id: true, country: true },
    });
    const phone = normalizePhoneNumber(telephone, store?.country);
    const cleanEmail = email?.trim() || undefined;

    // Sem contato, a busca do upsert fica sem filtro e devolve um usuário qualquer
    if (!phone && !cleanEmail) {
      throw new BadRequestException('Telephone or e-mail is required');
    }

    const user = await this.usersService.upsert({
      email: cleanEmail,
      telephone: phone,
      firstName: firstName.trim(),
      lastName: lastName?.trim() || undefined,
    });

    await this.saveRecord(storeId, user.id, { notes, tags });

    return this.findOne(storeId, user.id);
  }

  private async saveRecord(
    storeId: string,
    userId: string,
    { notes, tags }: UpdateCustomerDto,
  ) {
    const existing = await this.customerRepository.findOne({
      where: { store: { id: storeId }, user: { id: userId } },
    });

    await this.customerRepository.save({
      ...(existing ?? { store: { id: storeId }, user: { id: userId } }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
      ...(tags !== undefined && { tags: normalizeTags(tags) }),
      ...(!existing && tags === undefined && { tags: [] }),
    });
  }

  private buildFilter(storeId: string, { search, tag }: TCustomerListFilter) {
    const params: unknown[] = [storeId];
    const conditions: string[] = [];
    const term = search?.trim();

    if (term) {
      params.push(`%${term}%`);
      const at = `$${params.length}`;
      conditions.push(
        `(concat_ws(' ', u."first_name", u."last_name") ILIKE ${at}
          OR u."email" ILIKE ${at} OR u."telephone" ILIKE ${at})`,
      );
    }

    if (tag?.trim()) {
      params.push(tag.trim());
      conditions.push(`c."tags" ? $${params.length}`);
    }

    return {
      where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
      params,
    };
  }
}
