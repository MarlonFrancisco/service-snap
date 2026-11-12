import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository, type FindOptionsWhere } from 'typeorm';
import { getUserFullName } from '../../utils/helpers/user.helpers';
import { User } from '../users/user.entity';
import { AuditLog } from './audit-log.entity';
import type { TAuditEntry, TAuditLogPage } from './audit.types';
import type { AuditLogQueryDto } from './dto/audit-log-query.dto';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /** Falha ao registrar não desfaz a ação: só fica no log da aplicação. */
  async record(entry: TAuditEntry): Promise<void> {
    try {
      await this.auditLogRepository.insert(entry);
    } catch (error) {
      this.logger.error(
        `Auditoria de ${entry.action} não registrada`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /** `storeId` nulo é a visão da plataforma (painel administrativo). */
  async list(
    storeId: string | null,
    query: AuditLogQueryDto,
  ): Promise<TAuditLogPage<AuditLog & { actorName: string | null }>> {
    // Sem `transform` no ValidationPipe, a query chega como texto
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Number(query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const where: FindOptionsWhere<AuditLog> = {
      ...(storeId && { storeId }),
      ...(query.storeId && !storeId && { storeId: query.storeId }),
      ...(query.actorUserId && { actorUserId: query.actorUserId }),
      ...(query.resourceType && { resourceType: query.resourceType }),
      ...(query.from &&
        query.to && {
          createdAt: Between(
            new Date(`${query.from}T00:00:00Z`),
            new Date(`${query.to}T23:59:59.999Z`),
          ),
        }),
    };

    const [items, total] = await this.auditLogRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const actorIds = [
      ...new Set(items.map((item) => item.actorUserId).filter(Boolean)),
    ];
    const actors = actorIds.length
      ? await this.userRepository.find({
          where: { id: In(actorIds) },
          select: ['id', 'firstName', 'lastName', 'email'],
        })
      : [];
    const nameOf = new Map(
      actors.map((actor) => [
        actor.id,
        getUserFullName(actor) || actor.email || null,
      ]),
    );

    return {
      data: items.map((item) => ({
        ...item,
        actorName: nameOf.get(item.actorUserId) ?? null,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
