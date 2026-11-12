/** Resposta do cliente ao lembrete: vem ou não vem. */
export type TPresenceAnswer = 'yes' | 'no';

/** Lembrete com a pergunta enviado e ainda sem resposta do cliente. */
export type TPresenceAwaiting = {
  scheduleId: string;
  reminderSentAt: Date;
};
