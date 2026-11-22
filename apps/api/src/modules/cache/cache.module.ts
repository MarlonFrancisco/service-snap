import KeyvRedis from '@keyv/redis';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const DEFAULT_TTL_MS = 300000; // 5 minutos em milissegundos
const REDIS_CONNECT_TIMEOUT_MS = 2000;
const REDIS_MAX_RECONNECT_RETRIES = 3;
const REDIS_MAX_RECONNECT_DELAY_MS = 5000;

/**
 * Serverless: a instância morre logo, então desistir após poucas tentativas é
 * seguro. Servidor contínuo (Railway): desistir deixaria o cache fora até o
 * próximo restart, então tenta sempre, com espera crescente até 5s.
 */
const reconnectStrategy = (retries: number) => {
  if (process.env.IS_SERVELESS === 'true') {
    return retries < REDIS_MAX_RECONNECT_RETRIES ? retries * 100 : false;
  }
  return Math.min(retries * 200, REDIS_MAX_RECONNECT_DELAY_MS);
};

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger(CacheModule.name);
        const redisUrl = configService.get<string>('REDIS_URL');

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
              reconnectStrategy,
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
