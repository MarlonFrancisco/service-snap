'use client';

import { isApiHttpError } from '@/service/api';
import { AnamnesisPublicService } from '@/service/anamnesis';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';
import { formatDayMonth, getLongWeekday } from './anamnesis.helpers';
import type {
  TAnamnesisInviteHeader,
  TAnamnesisInviteState,
} from './anamnesis.types';

/** Link vencido, cancelado ou adulterado: tentar de novo não resolve. */
const EXPIRED_STATUS = [400, 404, 410];

/** Link público da ficha: o que mostrar ao cliente, sem login. */
export const useAnamnesisInvite = (token: string) => {
  const { data, isPending, isError, error, refetch, isRefetching } = useQuery({
    queryKey: CACHE_QUERY_KEYS.anamnesisInvite(token),
    queryFn: () => AnamnesisPublicService.getInvite(token),
    enabled: !!token,
    staleTime: 0,
    retry: (failureCount, queryError) =>
      !(
        isApiHttpError(queryError) && EXPIRED_STATUS.includes(queryError.status)
      ) && failureCount < 2,
  });

  const getState = (): TAnamnesisInviteState => {
    if (isError) {
      return isApiHttpError(error) && EXPIRED_STATUS.includes(error.status)
        ? 'expired'
        : 'error';
    }
    if (isPending || !data) return 'loading';
    return 'ready';
  };

  const header: TAnamnesisInviteHeader | null = data
    ? {
        storeName: data.storeName,
        customerFirstName: data.customerFirstName,
        title:
          data.forms.length === 1 && data.forms[0]
            ? data.forms[0].name
            : 'Fichas de saúde',
        lead: `Antes do seu horário de ${getLongWeekday(data.date)}, ${formatDayMonth(data.date)} às ${data.startTime.slice(0, 5)}. Leva uns 2 minutos.`,
        weekday: getLongWeekday(data.date),
      }
    : null;

  return {
    state: getState(),
    invite: data,
    header,
    handleRetry: () => void refetch(),
    isRetrying: isRefetching,
  };
};
