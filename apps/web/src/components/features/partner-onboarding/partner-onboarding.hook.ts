'use client';

import { useAnalytics } from '@/providers/analytics.provider';
import { OnboardingService } from '@/service/partner/onboarding';
import type {
  TOnboardingResult,
  TOnboardingState,
  TOnboardingStep,
} from '@/types/api/onboarding.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ALL_BUSINESS_TYPES } from './partner-onboarding.constants';

export type TOnboardingView = 'welcome' | TOnboardingStep | 'ready';

const VIEW_ORDER: TOnboardingView[] = [
  'welcome',
  'space',
  'hours',
  'services',
  'team',
  'photos',
];

export const useOnboardingState = () =>
  useQuery({
    queryKey: CACHE_QUERY_KEYS.onboarding(),
    queryFn: () => OnboardingService.getState(),
  });

/** Toda escrita devolve o estado novo: a tela não precisa buscar de novo. */
export const useOnboardingMutation = <TVariables,>(
  mutationFn: (variables: TVariables) => Promise<TOnboardingState>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (state) => {
      queryClient.setQueryData(CACHE_QUERY_KEYS.onboarding(), state);
    },
  });
};

export const usePartnerOnboarding = () => {
  const router = useRouter();
  const { data: state, isPending, isError, refetch } = useOnboardingState();
  const [view, setView] = useState<TOnboardingView | null>(null);
  // O tipo escolhido na boas-vindas só vai para a API junto com o espaço.
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [result, setResult] = useState<TOnboardingResult | null>(null);
  const analytics = useAnalytics();
  const lastTrackedViewRef = useRef<TOnboardingView | null>(null);

  const initialView: TOnboardingView | null = !state
    ? null
    : state.status === 'in_progress'
      ? (state.step ?? 'hours')
      : state.status === 'welcome'
        ? 'welcome'
        : null;

  const currentView = view ?? initialView;

  // Concluir muda o status para `not_needed`: a tela Pronto precisa continuar.
  const isDone = state?.status === 'not_needed' && currentView !== 'ready';

  useEffect(() => {
    if (isDone) {
      router.replace('/partner/dashboard');
    }
  }, [isDone, router]);

  // A primeira etapa vinda da API, sem navegação local, é uma retomada.
  useEffect(() => {
    if (!currentView || isDone || lastTrackedViewRef.current === currentView) {
      return;
    }
    lastTrackedViewRef.current = currentView;

    const index = VIEW_ORDER.indexOf(currentView);
    analytics.track('onboarding_step_viewed', {
      step: currentView,
      step_index: index >= 0 ? index : VIEW_ORDER.length,
      is_resume: view === null && state?.status === 'in_progress',
    });
  }, [currentView, isDone, view, state?.status, analytics]);

  const goBack = useCallback(() => {
    if (!currentView) return;
    const previous = VIEW_ORDER[VIEW_ORDER.indexOf(currentView) - 1];
    if (previous) setView(previous);
    window.scrollTo({ top: 0 });
  }, [currentView]);

  const goTo = useCallback((next: TOnboardingView) => {
    setView(next);
    window.scrollTo({ top: 0 });
  }, []);

  // Texto digitado fora da lista não vai para o analytics.
  const handleStart = useCallback(() => {
    const selected = businessType ?? state?.businessType ?? null;
    if (selected) {
      const isCustom = !ALL_BUSINESS_TYPES.includes(selected);
      analytics.track('onboarding_business_type_selected', {
        business_type: isCustom ? 'custom' : selected,
        is_custom: isCustom,
      });
    }
    goTo('space');
  }, [businessType, state?.businessType, goTo, analytics]);

  const handleExit = useCallback(() => {
    // Fora do painel: qualquer rota de `/partner` traria de volta ao assistente.
    router.push('/');
  }, [router]);

  const handleCompleted = useCallback((completed: TOnboardingResult) => {
    setResult(completed);
    setView('ready');
    window.scrollTo({ top: 0 });
  }, []);

  return {
    state,
    isPending,
    isError,
    refetch,
    view: currentView,
    isDone,
    businessType: businessType ?? state?.businessType ?? null,
    result,
    setBusinessType,
    goBack,
    goTo,
    handleStart,
    handleExit,
    handleCompleted,
  };
};
