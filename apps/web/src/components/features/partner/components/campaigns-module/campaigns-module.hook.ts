'use client';

import { useCampaignsMutations } from '@/hooks/partner/use-campaigns-mutations';
import { useInactiveCustomersQuery } from '@/hooks/partner/use-campaigns-query';
import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useRetentionAccess } from '../packages-module/packages-module.hook';
import type { TRetentionView } from '../packages-module/packages-module.types';
import { hasPlanAccess } from '../plan-feature-gate';
import {
  canReceiveBy,
  DEFAULT_INACTIVE_DAYS,
  formatCustomersCount,
  getChannels,
  getPersonName,
  toInactiveCustomerRow,
} from './campaigns-module.helpers';
import type {
  TCampaignAudience,
  TCampaignChannelChoice,
  TChannelOption,
} from './campaigns-module.types';

const WHATSAPP_FEATURE = ['WHATSAPP_INTEGRATION'] as const;

/**
 * Quem sumiu, quem está marcado e por qual canal. A tabela e o formulário
 * leem daqui: a escolha do canal muda quem pode ser marcado.
 */
export const useCampaignsModule = () => {
  const { storeId, storeState, isProfessional, timeZone, storeName } =
    useRetentionAccess();
  const { currentPlan, isGettingCurrentPlan } = useSubscriptionQuery();
  const hasWhatsappPlan = hasPlanAccess(
    WHATSAPP_FEATURE,
    currentPlan?.features,
  );
  const [inactiveDays, setInactiveDays] = useState(DEFAULT_INACTIVE_DAYS);
  const [channel, setChannel] = useState<TCampaignChannelChoice>('whatsapp');
  const [deselectedIds, setDeselectedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const canQuery = storeState === 'ready' && !isProfessional;

  // Sem WhatsApp no plano, o e-mail é o canal que sobra
  useEffect(() => {
    if (!isGettingCurrentPlan && !hasWhatsappPlan) setChannel('email');
  }, [isGettingCurrentPlan, hasWhatsappPlan]);

  // Outro período ou outra loja: todo mundo volta marcado
  useEffect(() => {
    setDeselectedIds(new Set());
  }, [inactiveDays, storeId]);

  const {
    inactiveCustomers,
    isLoadingInactiveCustomers,
    isFetchingInactiveCustomers,
    isInactiveCustomersError,
    isInactiveCustomersForbidden,
    refetchInactiveCustomers,
  } = useInactiveCustomersQuery({ storeId, inactiveDays, enabled: canQuery });
  const { optOutMutation, optInMutation } = useCampaignsMutations({ storeId });

  const rows = useMemo(
    () =>
      inactiveCustomers.map((customer) =>
        toInactiveCustomerRow(customer, channel, deselectedIds),
      ),
    [inactiveCustomers, channel, deselectedIds],
  );

  const audience = useMemo<TCampaignAudience>(() => {
    const selected = rows
      .filter((row) => row.isSelected)
      .map((row) => row.source);
    const idsFor = (target: 'whatsapp' | 'email') =>
      getChannels(channel).includes(target)
        ? selected
            .filter((customer) => canReceiveBy(customer, target))
            .map((customer) => customer.id)
        : [];

    return {
      channel,
      inactiveDays,
      whatsappIds: idsFor('whatsapp'),
      emailIds: idsFor('email'),
      total: selected.length,
      sample: selected[0] ?? null,
    };
  }, [rows, channel, inactiveDays]);

  const reachableRows = rows.filter((row) => row.canReceive);
  const areAllSelected =
    reachableRows.length > 0 && reachableRows.every((row) => row.isSelected);

  const handleToggleCustomer = useCallback((customerId: string) => {
    setDeselectedIds((current) => {
      const next = new Set(current);
      if (next.has(customerId)) next.delete(customerId);
      else next.add(customerId);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setDeselectedIds(
      areAllSelected ? new Set(reachableRows.map((row) => row.id)) : new Set(),
    );
  }, [areAllSelected, reachableRows]);

  /** A loja anota que o cliente pediu para sair; dá para desfazer no aviso. */
  const handleOptOut = useCallback(
    (customerId: string) => {
      const customer = inactiveCustomers.find((item) => item.id === customerId);
      const name = customer ? getPersonName(customer) : 'O cliente';

      optOutMutation.mutate(customerId, {
        onSuccess: () =>
          toast.success(`${name} não recebe mais campanhas`, {
            action: {
              label: 'Desfazer',
              onClick: () =>
                optInMutation.mutate(customerId, {
                  onError: () => toast.error('Não foi possível desfazer'),
                }),
            },
          }),
        onError: () => toast.error('Não foi possível marcar o pedido'),
      });
    },
    [inactiveCustomers, optOutMutation, optInMutation],
  );

  const channelOptions: TChannelOption[] = [
    { value: 'whatsapp', label: 'WhatsApp', disabled: !hasWhatsappPlan },
    { value: 'email', label: 'E-mail' },
    { value: 'both', label: 'Os dois', disabled: !hasWhatsappPlan },
  ];

  const getView = (): TRetentionView => {
    if (storeState === 'no-store') return 'no-store';
    if (isProfessional || isInactiveCustomersForbidden) return 'no-access';
    if (storeState === 'error') return 'error';
    if (storeState === 'loading') return 'loading';
    return 'ready';
  };

  return {
    storeId,
    storeName,
    timeZone,
    view: getView(),
    inactiveDays,
    setInactiveDays,
    rows,
    countLabel: `${formatCustomersCount(rows.length)} · quem pediu para não receber já fica de fora`,
    isLoadingRows: isLoadingInactiveCustomers,
    isRowsError: isInactiveCustomersError,
    isRefreshingRows:
      isFetchingInactiveCustomers && !isLoadingInactiveCustomers,
    handleRetryRows: () => void refetchInactiveCustomers(),
    areAllSelected,
    canToggleAll: reachableRows.length > 0,
    handleToggleAll,
    handleToggleCustomer,
    handleOptOut,
    optingOutId: optOutMutation.isPending ? optOutMutation.variables : null,
    channel,
    setChannel,
    channelOptions,
    hasWhatsappPlan,
    audience,
  };
};
