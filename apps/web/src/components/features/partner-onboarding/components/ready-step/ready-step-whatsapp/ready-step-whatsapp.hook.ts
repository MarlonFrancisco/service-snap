'use client';

import { useWhatsappBotQrActions } from '@/components/ui/whatsapp-bot-qr';
import { useWhatsappQuery } from '@/hooks/use-query/use-whatsapp-query';
import { useState } from 'react';
import type {
  TReadyStepWhatsappConfig,
  TReadyStepWhatsappView,
} from './ready-step-whatsapp.types';

export const useReadyStepWhatsapp = ({ store }: TReadyStepWhatsappConfig) => {
  const { whatsappStatus, isWhatsappStatusPending, isWhatsappStatusError } =
    useWhatsappQuery(store.id);
  const [isInviteHidden, setIsInviteHidden] = useState(false);

  const botLink =
    whatsappStatus?.status === 'connected' ? whatsappStatus.botLink : undefined;

  const actions = useWhatsappBotQrActions({
    link: botLink ?? '',
    storeName: store.name,
    displayPhoneNumber: whatsappStatus?.displayPhoneNumber,
  });

  // Sem resposta do status (plano sem a integração, falha), vale o convite.
  const getView = (): TReadyStepWhatsappView => {
    if (botLink) return 'connected';
    if (isWhatsappStatusPending && !isWhatsappStatusError) return 'loading';
    return isInviteHidden ? 'hidden' : 'invite';
  };

  return {
    ...actions,
    view: getView(),
    botLink,
    handleHideInvite: () => setIsInviteHidden(true),
  };
};
