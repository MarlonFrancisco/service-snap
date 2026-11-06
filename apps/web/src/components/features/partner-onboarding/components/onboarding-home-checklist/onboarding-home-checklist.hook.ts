'use client';

import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import { useAnalytics } from '@/providers/analytics.provider';
import { OnboardingService } from '@/service/partner/onboarding';
import { usePartnerStore } from '@/store/partner';
import type {
  TChecklistItemId,
  TOnboardingChecklist,
} from '@/types/api/onboarding.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type TChecklistItemContent = {
  title: string;
  description: string;
  action: string;
  href: string;
  doneAction?: string;
};

export const CHECKLIST_ITEM_CONTENT: Record<
  TChecklistItemId,
  TChecklistItemContent
> = {
  share_link: {
    title: 'Compartilhar seu link',
    description: 'Copie e envie para os seus clientes',
    action: 'Copiar link →',
    doneAction: 'Ver link →',
    href: '',
  },
  photos: {
    title: 'Adicionar fotos',
    description: 'Mostre o ambiente aos clientes',
    action: 'Lojas →',
    href: '/partner/stores',
  },
  email_reminders: {
    title: 'Ativar lembretes por e-mail',
    description: 'Avise os clientes antes do horário',
    action: 'Notificações →',
    href: '/partner/notifications/email-settings',
  },
  whatsapp: {
    title: 'Conectar WhatsApp',
    description: 'Disponível no seu plano',
    action: 'Integrações →',
    href: '/partner/settings/whatsapp',
  },
  team: {
    title: 'Convidar sua equipe',
    description: 'Adicione outros profissionais',
    action: 'Equipe →',
    href: '/partner/stores',
  },
  monthly_goal: {
    title: 'Definir meta mensal',
    description: 'Acompanhe seu progresso em Vendas',
    action: 'Definir →',
    doneAction: 'Vendas →',
    href: '/partner/dashboard/sales',
  },
};

export const useOnboardingHomeChecklist = () => {
  const queryClient = useQueryClient();
  const { stores } = useStoresQuery();
  const activeStore = usePartnerStore((state) => state.activeStore);
  const storeId = activeStore?.id || stores[0]?.id || '';
  const queryKey = CACHE_QUERY_KEYS.onboardingChecklist(storeId);

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goal, setGoal] = useState('');
  const [goalError, setGoalError] = useState<string | null>(null);
  const analytics = useAnalytics();
  const trackedStoreRef = useRef<string | null>(null);

  const { data: checklist } = useQuery({
    queryKey,
    queryFn: () => OnboardingService.getChecklist(storeId),
    enabled: Boolean(storeId),
  });

  const updateCache = (next: TOnboardingChecklist) => {
    queryClient.setQueryData(queryKey, next);
  };

  const dismissMutation = useMutation({
    mutationFn: () => OnboardingService.dismissChecklist(storeId),
    onSuccess: (next) => {
      analytics.track('onboarding_checklist_dismissed', {
        store_id: storeId,
        completed_count: completedCount,
      });
      updateCache(next);
    },
    onError: () => toast.error('Não foi possível dispensar. Tente de novo.'),
  });

  const shareMutation = useMutation({
    mutationFn: () => OnboardingService.markLinkShared(storeId),
    onSuccess: updateCache,
  });

  const goalMutation = useMutation({
    mutationFn: (monthlyGoal: number) =>
      OnboardingService.setMonthlyGoal(storeId, monthlyGoal),
    onSuccess: (next, monthlyGoal) => {
      updateCache(next);
      setIsEditingGoal(false);
      setGoal('');
      // O checklist só oferece a meta enquanto ela ainda não foi definida.
      analytics.track('monthly_goal_set', {
        store_id: storeId,
        value: monthlyGoal,
        had_goal: false,
        source: 'checklist',
      });
    },
    onError: () => setGoalError('Não foi possível salvar. Tente de novo.'),
  });

  const items = checklist?.items ?? [];
  const completedCount = items.filter((item) => item.done).length;

  const isVisible = Boolean(checklist?.visible);

  // Uma vez por loja exibida.
  useEffect(() => {
    if (!isVisible || !storeId || trackedStoreRef.current === storeId) return;
    trackedStoreRef.current = storeId;

    analytics.track('onboarding_checklist_viewed', {
      store_id: storeId,
      completed_count: completedCount,
      total: items.length,
    });
  }, [isVisible, storeId, completedCount, items.length, analytics]);

  const handleItemClick = (itemId: TChecklistItemId) => {
    analytics.track('onboarding_checklist_item_clicked', { item_id: itemId });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/booking/${storeId}`,
      );
      shareMutation.mutate();
      analytics.track('booking_link_copied', {
        store_id: storeId,
        source: 'home_checklist',
        method: 'clipboard',
      });
      toast.success('Link copiado');
    } catch {
      toast.error('Não foi possível copiar o link.');
    }
  };

  const handleSaveGoal = () => {
    const value = Number(goal.replace(/\D/g, ''));

    if (!value) {
      setGoalError('Informe um valor em reais, a partir de R$ 1.');
      return;
    }

    setGoalError(null);
    goalMutation.mutate(value);
  };

  return {
    isVisible,
    storeId,
    items,
    completedCount,
    isEditingGoal,
    goal,
    goalError,
    isSavingGoal: goalMutation.isPending,
    setGoal: (value: string) => setGoal(value.replace(/\D/g, '')),
    openGoalEditor: () => {
      handleItemClick('monthly_goal');
      setIsEditingGoal(true);
    },
    handleItemClick,
    handleCopyLink: () => {
      handleItemClick('share_link');
      void handleCopyLink();
    },
    handleSaveGoal,
    handleDismiss: () => dismissMutation.mutate(),
  };
};
