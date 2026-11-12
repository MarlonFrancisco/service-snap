import { Injectable, Logger } from '@nestjs/common';
import type {
  TScheduleSlotFreed,
  TScheduleSlotFreedListener,
} from './schedule-events.types';

/**
 * Avisa quem depende da agenda sem a agenda depender dele (a lista de espera
 * importa este módulo; o contrário criaria um ciclo). Quem emite espera os
 * ouvintes: em função serverless, trabalho solto depois da resposta se perde.
 */
@Injectable()
export class ScheduleEventsService {
  private readonly logger = new Logger(ScheduleEventsService.name);
  private readonly slotFreedListeners: TScheduleSlotFreedListener[] = [];

  onSlotFreed(listener: TScheduleSlotFreedListener) {
    this.slotFreedListeners.push(listener);
  }

  /** Um ouvinte com erro não impede os outros nem desfaz a operação na agenda. */
  async emitSlotFreed(event: TScheduleSlotFreed) {
    await Promise.all(
      this.slotFreedListeners.map(async (listener) => {
        try {
          await listener(event);
        } catch (error) {
          this.logger.error(
            `Horário liberado em ${event.date} na loja ${event.storeId} não processado`,
            error instanceof Error ? error.stack : undefined,
          );
        }
      }),
    );
  }
}
