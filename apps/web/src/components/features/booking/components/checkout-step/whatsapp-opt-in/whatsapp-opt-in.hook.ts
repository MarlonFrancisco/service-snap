'use client';

import { useAnalytics } from '@/providers/analytics.provider';
import { WhatsappConsentService } from '@/service/whatsapp-consent';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
 * Opt-in do checkout para os lembretes por WhatsApp (#37). A caixa começa
 * desmarcada e só aparece com o WhatsApp da loja ativo e um telefone no
 * cadastro. Quem já aceitou vê o estado e pode retirar ali mesmo (RGPD).
 */
export const useWhatsappOptIn = ({
  storeId,
  hasWhatsapp,
  hasPhone,
  isLoggedIn,
}: TUseWhatsappOptInConfig) => {
  const analytics = useAnalytics();
  const queryClient = useQueryClient();
  const [isChecked, setIsChecked] = useState(false);
  const canAsk = hasWhatsapp && hasPhone && isLoggedIn;
  const consentKey = CACHE_QUERY_KEYS.whatsappConsent(storeId);

  const { data: consentText } = useQuery({
    queryKey: CACHE_QUERY_KEYS.whatsappConsentText(storeId),
    queryFn: () => WhatsappConsentService.getText(storeId),
    enabled: canAsk,
    staleTime: Infinity,
  });
  const { data: consent } = useQuery({
    queryKey: consentKey,
    queryFn: () => WhatsappConsentService.getMine(storeId),
    enabled: canAsk,
  });

  const { mutate: revoke, isPending: isRevoking } = useMutation({
    mutationFn: () => WhatsappConsentService.revoke(storeId),
    onSuccess: (state) => {
      queryClient.setQueryData(consentKey, state);
      setIsChecked(false);
      analytics.track('whatsapp_opt_out', {
        store_id: storeId,
        method: 'checkout',
      });
    },
    onError: () => {
      toast.error('Não deu para retirar agora. Tente de novo.');
    },
  });

  const isReady = canAsk && !!consentText && !!consent;
  const isGranted = isReady && consent.status === 'granted';

  /** Depois da reserva: uma falha aqui não desfaz o agendamento. */
  const grantIfChecked = useCallback(async () => {
    if (!isReady || isGranted || !isChecked) return;

    try {
      const state = await WhatsappConsentService.grant(storeId, 'checkout');
      queryClient.setQueryData(consentKey, state);
      analytics.track('whatsapp_opt_in', {
        store_id: storeId,
        source: 'checkout',
      });
    } catch {
      toast.error(
        'Não deu para ativar o WhatsApp. O lembrete chega por e-mail.',
      );
    }
  }, [
    isReady,
    isGranted,
    isChecked,
    storeId,
    consentKey,
    analytics,
    queryClient,
  ]);

  return {
    isVisible: isReady && !isGranted,
    isGranted,
    text: consentText?.text ?? '',
    isChecked,
    setIsChecked,
    grantIfChecked,
    handleRevoke: () => revoke(),
    isRevoking,
  };
};
