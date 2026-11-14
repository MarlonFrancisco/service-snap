import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../../../database/base.entity';
import { Schedule } from '../../schedule/schedule.entity';

export const SCHEDULE_REMINDER_ATTEMPTS = 3;

export type TScheduleReminderChannel = 'email' | 'whatsapp';

/**
 * Trava de envio: a linha única por horário e canal impede dois lembretes mesmo
 * com o cron entregue em duplicidade. Não usa o histórico porque o parceiro pode apagá-lo.
 */
@Entity('schedule_reminders')
@Unique('UQ_schedule_reminders_slot', ['schedule', 'channel', 'appointmentKey'])
export class ScheduleReminder extends BaseEntity {
  @Column({ type: 'varchar' })
  channel: TScheduleReminderChannel;

  // Data e hora do atendimento: remarcar gera um novo lembrete
  @Column({ type: 'varchar' })
  appointmentKey: string;

  @Column({ type: 'varchar' })
  status: 'sending' | 'sent' | 'failed';

  @Column({ type: 'int', default: 1 })
  attempts: number;

  /** O lembrete perguntou se o cliente vem: a agenda mostra "aguardando resposta". */
  @Column({ type: 'boolean', default: false })
  asksPresence: boolean;

  @ManyToOne(() => Schedule, { onDelete: 'CASCADE', nullable: false })
  schedule: Schedule;
}
