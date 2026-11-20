'use client';

import { WhatsappConsentService } from '@/service/whatsapp-consent';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

type TUseWhatsappOptInConfig = {
  storeId: string;
  /** A loja tem o WhatsApp conectado e ativo. */
  hasWhatsapp: boolean;
  hasPhone: boolean;
  isLoggedIn: boolean;
};

/**
 * Caixa do checkout para receber os lembretes por WhatsApp (#37). Começa
 * desmarcada e só aparece com o WhatsApp da loja ativo, um telefone no
 * cadastro e sem um "sim" já dado a esta loja.
 */
export const useWhatsappOptIn = ({
  storeId,
  hasWhatsapp,
  hasPhone,
  isLoggedIn,
}: TUseWhatsappOptInConfig) => {
  const [isChecked, setIsChecked] = useState(false);
  const canAsk = hasWhatsapp && hasPhone && isLoggedIn;

  const { data: consentText } = useQuery({
    queryKey: CACHE_QUERY_KEYS.whatsappConsentText(storeId),
    queryFn: () => WhatsappConsentService.getText(storeId),
    enabled: canAsk,
    staleTime: Infinity,
  });
  const { data: consent } = useQuery({
    queryKey: CACHE_QUERY_KEYS.whatsappConsent(storeId),
    queryFn: () => WhatsappConsentService.getMine(storeId),
    enabled: canAsk,
  });

  const isVisible =
    canAsk && !!consentText && !!consent && consent.status !== 'granted';

  /** Depois da reserva: uma falha aqui não desfaz o agendamento. */
  const grantIfChecked = useCallback(async () => {
    if (!isVisible || !isChecked) return;

    try {
      const state = await WhatsappConsentService.grant(storeId, 'checkout');
      getQueryClient().setQueryData(
        CACHE_QUERY_KEYS.whatsappConsent(storeId),
        state,
      );
    } catch {
      toast.error(
        'Não deu para ativar o WhatsApp. O lembrete chega por e-mail.',
      );
    }
  }, [isVisible, isChecked, storeId]);

  return {
    isVisible,
    text: consentText?.text ?? '',
    isChecked,
    setIsChecked,
    grantIfChecked,
  };
};
