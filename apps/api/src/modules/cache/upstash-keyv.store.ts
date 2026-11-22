import { Redis } from '@upstash/redis';
import { EventEmitter } from 'node:events';

/**
 * Store do Keyv sobre a API REST do Upstash Redis. No Worker uma conexão TCP
 * (node-redis) aberta numa requisição não pode ser usada por outra; o REST
 * faz um `fetch` por operação e não tem esse problema.
 * O Keyv já entrega o valor serializado: guardamos o texto como veio.
 */
export class UpstashKeyvStore extends EventEmitter {
  namespace?: string;
  opts: Record<string, unknown> = {};

  constructor(private readonly redis: Redis) {
    super();
  }

  static fromCredentials(url: string, token: string) {
    return new UpstashKeyvStore(
      new Redis({ url, token, automaticDeserialization: false }),
    );
  }

  async get(key: string) {
    return (await this.redis.get<string>(key)) ?? undefined;
  }

  async set(key: string, value: string, ttl?: number) {
    await (ttl
      ? this.redis.set(key, value, { px: ttl })
      : this.redis.set(key, value));
    return true;
  }

  async delete(key: string) {
    return (await this.redis.del(key)) > 0;
  }

  /** Só apaga as chaves do namespace; sem namespace não limpa o banco todo. */
  async clear() {
    if (!this.namespace) return;
    let cursor = '0';
    do {
      const [next, keys] = await this.redis.scan(cursor, {
        match: `${this.namespace}:*`,
        count: 500,
      });
      if (keys.length) await this.redis.del(...keys);
      cursor = String(next);
    } while (cursor !== '0');
  }
}
