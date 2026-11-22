import KeyvRedis from '@keyv/redis';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isWorkerRuntime } from '../../utils/runtime';
import { UpstashKeyvStore } from './upstash-keyv.store';

const DEFAULT_TTL_MS = 300000; // 5 minutos em milissegundos
const REDIS_CONNECT_TIMEOUT_MS = 2000;
const REDIS_MAX_RECONNECT_RETRIES = 3;

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger(CacheModule.name);
        const redisUrl = configService.get<string>('REDIS_URL');
        const upstashUrl = configService.get<string>('UPSTASH_REDIS_REST_URL');
        const upstashToken = configService.get<string>(
          'UPSTASH_REDIS_REST_TOKEN',
        );

        // REST do Upstash quando configurado. No Worker é o único Redis possível:
        // o socket TCP do node-redis não pode ser compartilhado entre requisições.
        if (upstashUrl && upstashToken) {
          const store = UpstashKeyvStore.fromCredentials(
            upstashUrl,
            upstashToken,
          );
          store.on('error', (error: Error) =>
            logger.error(`❌ Erro no Redis (REST): ${error.message}`),
          );
          return { ttl: DEFAULT_TTL_MS, stores: [store] };
        }

        if (isWorkerRuntime()) {
          logger.warn(
            '⚠️  UPSTASH_REDIS_REST_URL/TOKEN ausentes no Worker. Usando cache em memória.',
          );
          return { ttl: DEFAULT_TTL_MS };
        }

        if (!redisUrl) {
          logger.warn(
            '⚠️  REDIS_URL não configurada. Usando cache em memória.',
          );
          // Se não houver Redis configurado, usa cache em memória
          return { ttl: DEFAULT_TTL_MS };
        }

        // @nestjs/cache-manager v3 só lê `stores`; a opção `store` é ignorada
        // e faria o cache cair silenciosamente em memória.
        // Redis fora do ar não pode travar requests: sem fila offline e com
        // retries limitados, a operação falha rápido e o cache vira miss.
        const store = new KeyvRedis(
          {
            url: redisUrl,
            disableOfflineQueue: true,
            socket: {
              connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
              reconnectStrategy: (retries) =>
                retries < REDIS_MAX_RECONNECT_RETRIES ? retries * 100 : false,
            },
          },
          { throwOnConnectError: false },
        );

        const onError = (error: Error) => {
          logger.error(`❌ Erro no Redis: ${error.message}`);
        };

        // O client do node-redis emite 'error' por conta própria: sem listener,
        // uma queda de conexão vira exceção não capturada e derruba o processo.
        store.client.on('error', onError);
        store.on('error', onError);

        return { ttl: DEFAULT_TTL_MS, stores: [store] };
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
