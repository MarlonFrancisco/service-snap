'use client';

import {
  useWhatsappBotQrActions,
  type TWhatsappBotShareAction,
} from '@/components/ui/whatsapp-bot-qr';
import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import { useWhatsappQuery } from '@/hooks/use-query/use-whatsapp-query';
import { usePartnerStore } from '@/store/partner';
import { useCallback, useEffect, useState } from 'react';
import {
  persistWhatsappBotHomeDismissed,
  readWhatsappBotHomeDismissed,
} from './whatsapp-bot-home-card.helpers';

/** Lembrete do Início: some quando o parceiro baixa o QR, copia o link ou fecha. */
export const useWhatsappBotHomeCard = () => {
  const { stores } = useStoresQuery();
  const activeStore = usePartnerStore((state) => state.activeStore);
  const store = activeStore?.id ? activeStore : stores[0];
  const storeId = store?.id ?? '';
  const { whatsappStatus } = useWhatsappQuery(storeId);

  // Começa escondido: o servidor não conhece o localStorage.
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (!storeId) return;
    setIsDismissed(readWhatsappBotHomeDismissed(storeId));
  }, [storeId]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    persistWhatsappBotHomeDismissed(storeId);
  }, [storeId]);

  const handleShareAction = useCallback(
    (action: TWhatsappBotShareAction) => {
      if (action === 'download_qr' || action === 'copy_link') handleDismiss();
    },
    [handleDismiss],
  );

  const botLink =
    whatsappStatus?.status === 'connected' ? whatsappStatus.botLink : undefined;

  const actions = useWhatsappBotQrActions({
    link: botLink ?? '',
    storeName: store?.name ?? '',
    displayPhoneNumber: whatsappStatus?.displayPhoneNumber,
    onAction: handleShareAction,
  });

  return {
    ...actions,
    botLink,
    isVisible: Boolean(botLink) && !isDismissed,
    handleDismiss,
  };
};
