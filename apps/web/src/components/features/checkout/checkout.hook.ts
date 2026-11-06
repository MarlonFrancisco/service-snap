import { useAnalytics } from '@/providers/analytics.provider';
import { isApiHttpError } from '@/service/api';
import { OnboardingService } from '@/service/partner/onboarding';
import { SubscriptionService } from '@/service/subscription';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { consumePendingPurchase } from './checkout.helpers';
import type { TCheckoutStatus } from './checkout.types';

const POLL_INTERVAL_MS = 2000;
const MAX_WAIT_MS = 30000;

const formatActivationDate = () =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

export const useCheckout = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const router = useRouter();
  const mainButtonRef = useRef<HTMLButtonElement>(null);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const analytics = useAnalytics();
  const hasTrackedOnboardingRef = useRef(false);
  const lastTrackedStatusRef = useRef<TCheckoutStatus | null>(null);

  // O Stripe confirma o pagamento antes de o webhook gravar a assinatura local.
  // Enquanto isso, a resposta é `processing` e consultamos de novo.
  const session = useQuery({
    queryKey: CACHE_QUERY_KEYS.checkoutSession(sessionId ?? ''),
    queryFn: () => SubscriptionService.getCheckoutSessionStatus(sessionId!),
    enabled: Boolean(sessionId),
    staleTime: 0,
    retry: false,
    refetchInterval: (query) =>
      !hasTimedOut &&
      ['processing', 'pending'].includes(query.state.data?.status ?? '')
        ? POLL_INTERVAL_MS
        : false,
  });

  const sessionStatus = session.data?.status;
  const isActive = sessionStatus === 'active';

  const onboarding = useQuery({
    queryKey: CACHE_QUERY_KEYS.onboarding(),
    queryFn: () => OnboardingService.getState(),
    enabled: isActive,
    staleTime: 0,
    retry: false,
  });

  const needsOnboarding =
    isActive &&
    Boolean(onboarding.data) &&
    onboarding.data?.status !== 'not_needed';

  // Pagamento confirmado: a compra sai uma vez, mesmo com polling ou reload.
  useEffect(() => {
    if (!isActive || !sessionId) return;

    const purchase = consumePendingPurchase(sessionId);
    if (!purchase) return;

    analytics.track('purchase', { transaction_id: sessionId, ...purchase });
  }, [isActive, sessionId, analytics]);

  useEffect(() => {
    if (needsOnboarding) {
      if (!hasTrackedOnboardingRef.current) {
        hasTrackedOnboardingRef.current = true;
        analytics.track('partner_onboarding_started', {});
      }
      router.replace('/onboarding');
    }
  }, [needsOnboarding, router, analytics]);

  const isWaiting = sessionStatus === 'processing' || sessionStatus === 'pending';

  useEffect(() => {
    if (!isWaiting) {
      return;
    }

    const timer = setTimeout(() => setHasTimedOut(true), MAX_WAIT_MS);

    return () => clearTimeout(timer);
  }, [isWaiting]);

  const status = ((): TCheckoutStatus => {
    if (!sessionId || sessionStatus === 'invalid') return 'invalid';
    if (session.isError) {
      // Sem sessão ativa não dá para saber de quem é o pagamento.
      return isApiHttpError(session.error) && session.error.status === 401
        ? 'invalid'
        : 'error';
    }
    if (isWaiting) return hasTimedOut ? 'delayed' : 'validating';
    // Com o pagamento confirmado, uma falha aqui não é motivo para bloquear.
    if (isActive && (onboarding.isError || onboarding.data?.status === 'not_needed')) {
      return 'success';
    }
    return 'validating';
  })();

  useEffect(() => {
    if (status === 'success') {
      mainButtonRef.current?.focus();
    }
  }, [status]);

  // Só os desfechos sem sucesso; o sucesso já é medido pelo `purchase`.
  useEffect(() => {
    if (status === 'validating' || status === 'success') return;
    if (lastTrackedStatusRef.current === status) return;

    lastTrackedStatusRef.current = status;
    analytics.track('checkout_status', { status });
  }, [status, analytics]);

  const handleGoToDashboard = () => {
    router.push('/partner/dashboard');
  };

  const handleGoToPricing = () => {
    router.push('/pricing');
  };

  const handleRetry = () => {
    analytics.track('checkout_retry', {});
    setHasTimedOut(false);
    void session.refetch();
  };

  return {
    status,
    activationDate: formatActivationDate(),
    mainButtonRef,
    handleGoToDashboard,
    handleGoToPricing,
    handleRetry,
  };
};
