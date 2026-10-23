import { Redis } from 'ioredis';

export class RedisStorage {
  public redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    connectTimeout: 1500,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  private async ensureConnected() {
    if (this.redis.status === 'ready' || this.redis.status === 'connecting') {
      if (this.redis.status === 'connecting') {
        await new Promise<void>((resolve, reject) => {
          const onReady = () => {
            cleanup();
            resolve();
          };
          const onError = (error: Error) => {
            cleanup();
            reject(error);
          };
          const cleanup = () => {
            this.redis.off('ready', onReady);
            this.redis.off('error', onError);
          };
          this.redis.once('ready', onReady);
          this.redis.once('error', onError);
        });
      }
      return;
    }

    await this.redis.connect();
  }

  async getItem(key: string) {
    try {
      await this.ensureConnected();
      return await this.redis.get(key);
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string) {
    try {
      await this.ensureConnected();
      await this.redis.set(key, value);
    } catch {
      // best-effort SSR cache
    }
  }

  async removeItem(key: string) {
    try {
      await this.ensureConnected();
      await this.redis.del(key);
    } catch {
      // best-effort SSR cache
    }
  }
}
