import type { TPushEnvironment } from '@/types/api/push.types';
import type { TPushAlertsView, TPushDeviceStatus } from './push-alerts.types';

const DISMISSED_STORAGE_KEY = 'servicesnap:push-alerts-dismissed';

const dismissalListeners = new Set<() => void>();

/** Sem acesso ao armazenamento (aba privada, bloqueio), o aviso aparece de novo. */
export const readPushAlertsDismissed = () => {
  try {
    return window.localStorage.getItem(DISMISSED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

export const dismissPushAlerts = () => {
  try {
    window.localStorage.setItem(DISMISSED_STORAGE_KEY, '1');
  } catch {
    // Some só nesta visita: o armazenamento não está disponível.
  }
  dismissalListeners.forEach((listener) => listener());
};

/** Avisa quem lê a dispensa, nesta aba e nas outras abertas. */
export const subscribePushAlertsDismissed = (listener: () => void) => {
  dismissalListeners.add(listener);
  window.addEventListener('storage', listener);

  return () => {
    dismissalListeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
};

export const getPushAlertsView = ({
  environment,
  isPushEnabled,
  isDismissed,
  deviceStatus,
}: {
  environment: TPushEnvironment | null;
  isPushEnabled: boolean;
  isDismissed: boolean;
  deviceStatus: TPushDeviceStatus | null;
}): TPushAlertsView => {
  if (!environment || environment === 'unsupported') return 'hidden';
  if (!isPushEnabled || isDismissed) return 'hidden';
  if (environment === 'ios-needs-install') return 'ios-install';
  if (!deviceStatus) return 'hidden';
  if (deviceStatus.permission === 'denied') return 'blocked';
  return deviceStatus.isSubscribed ? 'active' : 'prompt';
};
