'use client';

import { usePartnerStore } from '@/store';

const SMS_SEGMENT_LENGTH = 160;

export const useNotificationPreviewModal = (customMessage: string) => {
  const activeStore = usePartnerStore((state) => state.activeStore);

  const storeName = activeStore?.name || '[Nome da loja]';
  const storeAddress = activeStore?.address || '[Endereço da loja]';
  const storePhone = activeStore?.telephone || '[Telefone da loja]';
  const message = customMessage.trim();

  const smsText = [
    `Lembrete: [Serviço] em ${storeName}, [Dia, data] às [hh:mm].`,
    message,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    storeName,
    storeAddress,
    storePhone,
    message,
    smsText,
    smsLength: smsText.length,
    smsSegmentLength: SMS_SEGMENT_LENGTH,
    smsParts: Math.ceil(smsText.length / SMS_SEGMENT_LENGTH),
  };
};
