'use client';

import {
  formatWhatsappBotLinkLabel,
  useWhatsappBotQrActions,
} from '@/components/ui/whatsapp-bot-qr';
import { usePartnerStore } from '@/store/partner';
import type { TUseWhatsappBotPromoConfig } from './whatsapp-bot-promo.types';

export const useWhatsappBotPromo = ({
  botLink,
  displayPhoneNumber,
}: TUseWhatsappBotPromoConfig) => {
  const storeName = usePartnerStore((state) => state.activeStore?.name) ?? '';
  const actions = useWhatsappBotQrActions({
    link: botLink,
    storeName,
    displayPhoneNumber,
  });

  return { ...actions, linkLabel: formatWhatsappBotLinkLabel(botLink) };
};
