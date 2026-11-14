'use client';

import { useAnalytics } from '@/providers/analytics.provider';
import type { TWhatsappBotLinkPlacement } from '@repo/analytics';
import { useCallback } from 'react';
import { useGetStore } from '../../booking.hook';

/** Link do bot de WhatsApp da loja; `null` quando a loja não tem o WhatsApp conectado. */
export const useBookingWhatsappLink = (
  placement: TWhatsappBotLinkPlacement,
) => {
  const store = useGetStore();
  const analytics = useAnalytics();
  const storeId = store?.id;

  const handleClick = useCallback(() => {
    if (!storeId) return;
    analytics.track('whatsapp_bot_link_clicked', {
      store_id: storeId,
      placement,
    });
  }, [analytics, storeId, placement]);

  return { whatsappBot: store?.whatsappBot ?? null, handleClick };
};
