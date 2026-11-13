import { HolidaysService } from '@/service/partner/holidays';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';
import type { TUseHolidaysQueryConfig } from './use-holidays-query.types';

/** Feriados da loja; `from`/`to` em YYYY-MM-DD, inclusivos. */
export const useHolidaysQuery = ({
  storeId,
  from,
  to,
  enabled = true,
}: TUseHolidaysQueryConfig) => {
  const canFetch = enabled && !!storeId;
  const range = { from, to };

  const { data: holidays = [], isPending, isError, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.holidays(storeId!, range),
    queryFn: () => HolidaysService.getAll(storeId!, range),
    enabled: canFetch,
  });

  return {
    holidays,
    isPendingHolidays: canFetch && isPending,
    isErrorHolidays: canFetch && isError,
    refetchHolidays: refetch,
  };
};
