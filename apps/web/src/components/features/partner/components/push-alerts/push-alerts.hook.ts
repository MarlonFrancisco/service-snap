'use client';

import { usePushMutations } from '@/hooks/partner/use-push-mutations';
import { usePushPublicKeyQuery } from '@/hooks/use-query/use-push-public-key-query';
import { getPushEnvironment, PushDeviceService } from '@/service/push';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import {
  dismissPushAlerts,
  getPushAlertsView,
  readPushAlertsDismissed,
  subscribePushAlertsDismissed,
} from './push-alerts.helpers';
import type { TPushDeviceStatus } from './push-alerts.types';

const subscribeToNothing = () => () => undefined;

export const usePushAlerts = () => {
  // No servidor e na hidratação não há aparelho: o aviso só nasce no navegador.
  const environment = useSyncExternalStore(
    subscribeToNothing,
    getPushEnvironment,
    () => null,
  );
  const isDismissed = useSyncExternalStore(
    subscribePushAlertsDismissed,
    readPushAlertsDismissed,
    () => true,
  );
  const canAskServer = Boolean(environment && environment !== 'unsupported');
  const { isPushEnabled, pushPublicKey } = usePushPublicKeyQuery({
    enabled: canAskServer && !isDismissed,
  });

  const [deviceStatus, setDeviceStatus] = useState<TPushDeviceStatus | null>(
    null,
  );

  useEffect(() => {
    if (environment !== 'supported' || isDismissed) return;

    const state = { isCancelled: false };
    const applyStatus = (isSubscribed: boolean) => {
      if (state.isCancelled) return;
      setDeviceStatus({ permission: Notification.permission, isSubscribed });
    };

    PushDeviceService.getSubscription()
      .then((subscription) =>
        applyStatus(
          Boolean(subscription) && Notification.permission === 'granted',
        ),
      )
      .catch(() => applyStatus(false));

    return () => {
      state.isCancelled = true;
    };
  }, [environment, isDismissed]);

  const {
    subscribePush,
    isSubscribePending,
    unsubscribePush,
    isUnsubscribePending,
  } = usePushMutations({
    onSubscribed: () =>
      setDeviceStatus({ permission: 'granted', isSubscribed: true }),
    onUnsubscribed: () =>
      setDeviceStatus({
        permission: Notification.permission,
        isSubscribed: false,
      }),
  });

  // A permissão é pedida aqui, no clique: o Safari recusa o pedido fora do gesto.
  const handleActivate = async () => {
    if (!pushPublicKey) return;

    const permission =
      Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();

    if (permission !== 'granted') {
      setDeviceStatus({ permission, isSubscribed: false });
      if (permission === 'default') {
        toast.info('Os avisos continuam desligados neste aparelho.');
      }
      return;
    }

    subscribePush(pushPublicKey);
  };

  return {
    view: getPushAlertsView({
      environment,
      isPushEnabled,
      isDismissed,
      deviceStatus,
    }),
    handleActivate: () => void handleActivate(),
    isActivating: isSubscribePending,
    handleDeactivate: () => unsubscribePush(),
    isDeactivating: isUnsubscribePending,
    handleDismiss: dismissPushAlerts,
  };
};
