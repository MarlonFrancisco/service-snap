import { Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import { QUEUE_PATH, readRawBody } from './queue.helpers';
import { QueueService } from './queue.service';
import type { TQueueJob } from './queue.types';

/**
 * Entrada do QStash. Vale a assinatura sobre o corpo cru (o `main.ts` não
 * parseia `/queue`); erro aqui vira 5xx e o QStash tenta de novo.
 */
@Controller()
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post(QUEUE_PATH)
  @HttpCode(200)
  async handle(
    @Req() request: { body: unknown },
    @Headers('upstash-signature') signature: string,
    @Headers('upstash-retried') retried: string,
  ) {
    const body = readRawBody(request.body);

    await this.queueService.verify(signature, body);

    return this.queueService.handle(
      JSON.parse(body) as TQueueJob,
      Number(retried) || 0,
    );
  }
}
