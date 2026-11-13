import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Receiver } from '@upstash/qstash';
import {
  QSTASH_BATCH_SIZE,
  QUEUE_PATH,
  QUEUE_RETRIES,
  chunk,
} from './queue.helpers';
import type {
  TQueueAttempt,
  TQueueHandler,
  TQueueJob,
  TQueueJobType,
} from './queue.types';

/**
 * Fila de trabalhos depois da resposta, pelo QStash: a API publica, o QStash
 * guarda e chama `/queue/jobs` de volta, tentando de novo quando a resposta não
 * é 2xx. Cada módulo registra quem trata o seu tipo de trabalho, para a fila
 * não depender de agenda, webhook ou campanha.
 */
@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private readonly handlers = new Map<TQueueJobType, TQueueHandler<never>>();

  constructor(private readonly configService: ConfigService) {}

  register<T extends TQueueJobType>(type: T, handler: TQueueHandler<T>) {
    this.handlers.set(type, handler as TQueueHandler<never>);
  }

  get isConfigured() {
    return Boolean(this.token && this.apiPublicUrl);
  }

  /**
   * Sem QStash (API local de quem não tem conta) o trabalho roda ali mesmo,
   * esperando, numa tentativa só: o recurso continua testável.
   */
  async enqueue(jobs: TQueueJob | TQueueJob[]) {
    const list = Array.isArray(jobs) ? jobs : [jobs];

    if (!list.length) return;

    if (!this.isConfigured) {
      this.logger.warn('QStash não configurado: trabalho roda na requisição');

      for (const job of list) {
        await this.handle(job, QUEUE_RETRIES).catch((error: unknown) =>
          this.logger.error(
            `Trabalho ${job.type} falhou`,
            error instanceof Error ? error.stack : String(error),
          ),
        );
      }
      return;
    }

    const client = new Client({
      token: this.token,
      baseUrl: this.configService.get<string>('QSTASH_URL') || undefined,
    });
    const url = `${this.apiPublicUrl}${QUEUE_PATH}`;

    for (const group of chunk(list, QSTASH_BATCH_SIZE)) {
      await client.batchJSON(
        group.map((job) => ({ url, body: job, retries: QUEUE_RETRIES })),
      );
    }
  }

  /** Tipo sem quem trate volta 200: repetir não vai mudar nada. */
  async handle(job: TQueueJob, retried: number) {
    const handler = this.handlers.get(job?.type) as
      | ((data: unknown, attempt: TQueueAttempt) => Promise<unknown>)
      | undefined;

    if (!handler) {
      this.logger.error(`Trabalho sem tratamento: ${job?.type}`);
      return { status: 'ignored' };
    }

    const result = await handler(job.data, {
      retried,
      isLastAttempt: retried >= QUEUE_RETRIES,
    });

    return result ?? { status: 'done' };
  }

  /** Assinatura `Upstash-Signature` sobre o corpo cru e a URL publicada. */
  async verify(signature: string, body: string) {
    const currentSigningKey = this.configService.get<string>(
      'QSTASH_CURRENT_SIGNING_KEY',
    );
    const nextSigningKey = this.configService.get<string>(
      'QSTASH_NEXT_SIGNING_KEY',
    );

    if (!currentSigningKey || !nextSigningKey || !this.apiPublicUrl) {
      throw new ServiceUnavailableException('Queue is not configured');
    }

    const receiver = new Receiver({
      currentSigningKey,
      nextSigningKey,
      // Nunca aceitar as chaves públicas do servidor local do QStash
      devMode: false,
    });

    try {
      await receiver.verify({
        signature,
        body,
        url: `${this.apiPublicUrl}${QUEUE_PATH}`,
      });
    } catch {
      throw new UnauthorizedException('Invalid QStash signature');
    }
  }

  private get token() {
    return this.configService.get<string>('QSTASH_TOKEN');
  }

  private get apiPublicUrl() {
    return this.configService.get<string>('API_PUBLIC_URL')?.replace(/\/$/, '');
  }
}
