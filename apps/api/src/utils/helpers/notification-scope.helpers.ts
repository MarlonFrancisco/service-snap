import { AsyncLocalStorage } from 'async_hooks';

const scope = new AsyncLocalStorage<{ muted: boolean }>();

/**
 * Roda `task` sem os avisos por e-mail, WhatsApp e push de agendamento (os
 * webhooks continuam). Para operações em lote, como uma série recorrente, que
 * mandam um aviso só no fim. O contexto segue pelos `await` e pelo trabalho
 * disparado em segundo plano dentro dele.
 */
export const runWithoutNotifications = <T>(task: () => Promise<T>) =>
  scope.run({ muted: true }, task);

export const areNotificationsMuted = () => scope.getStore()?.muted === true;
