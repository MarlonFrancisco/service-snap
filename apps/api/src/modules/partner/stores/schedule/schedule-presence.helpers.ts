import type { TPresenceAnswer } from './schedule-presence.types';

const PRESENCE_PREFIX = 'presence';

/**
 * Payloads dos botões do lembrete, na ordem dos botões do template. Voltam no
 * webhook quando o cliente toca, com o agendamento junto.
 */
export const buildPresencePayloads = (scheduleId: string) => [
  `${PRESENCE_PREFIX}:yes:${scheduleId}`,
  `${PRESENCE_PREFIX}:no:${scheduleId}`,
];

export const parsePresencePayload = (
  payload?: string | null,
): { answer: TPresenceAnswer; scheduleId: string } | null => {
  const [prefix, answer, scheduleId] = (payload ?? '').split(':');

  if (prefix !== PRESENCE_PREFIX || !scheduleId) return null;
  if (answer !== 'yes' && answer !== 'no') return null;

  return { answer, scheduleId };
};
