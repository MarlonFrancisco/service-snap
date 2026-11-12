import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { hashToken } from '../../../../utils/helpers/crypto.helpers';
import { ApiKey } from './api-key.entity';
import { generateApiKey } from './api-keys.helpers';
import type { TApiKeyContext, TCreatedApiKey } from './api-keys.types';

// Atualizar a cada chamada seria uma escrita por requisição da integração
const LAST_USED_PRECISION_MS = 5 * 60 * 1000;

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  list(storeId: string) {
    return this.apiKeyRepository.find({
      where: { store: { id: storeId } },
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    storeId: string,
    name: string,
    createdById: string,
  ): Promise<TCreatedApiKey> {
    const { prefix, key } = generateApiKey();
    const saved = await this.apiKeyRepository.save({
      name,
      prefix,
      keyHash: hashToken(key),
      createdById,
      store: { id: storeId },
    });

    return {
      id: saved.id,
      name: saved.name,
      prefix: saved.prefix,
      createdAt: saved.createdAt,
      key,
    };
  }

  /** Revogar é definitivo: a integração precisa de uma chave nova. */
  async revoke(storeId: string, id: string) {
    const result = await this.apiKeyRepository.update(
      { id, store: { id: storeId }, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );

    if (!result.affected) throw new NotFoundException('API key not found');

    return { id };
  }

  /** Chave válida de uma loja ativa, ou `null`. */
  async authenticate(key: string): Promise<TApiKeyContext | null> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { keyHash: hashToken(key), revokedAt: IsNull() },
      relations: ['store'],
    });

    if (!apiKey?.store || apiKey.store.isDeleted) return null;

    return { id: apiKey.id, storeId: apiKey.store.id };
  }

  async touch(id: string, now = new Date()) {
    await this.apiKeyRepository
      .createQueryBuilder()
      .update()
      .set({ lastUsedAt: now })
      .where('id = :id', { id })
      .andWhere('("lastUsedAt" IS NULL OR "lastUsedAt" < :limit)', {
        limit: new Date(now.getTime() - LAST_USED_PRECISION_MS),
      })
      .execute();
  }
}
