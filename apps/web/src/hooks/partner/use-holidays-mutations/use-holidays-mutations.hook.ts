import { isApiHttpError } from '@/service/api';
import { HolidaysService } from '@/service/partner/holidays';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  TCreateHolidayVariables,
  TDeleteHolidayVariables,
} from './use-holidays-mutations.types';

export const useHolidaysMutations = () => {
  const queryClient = useQueryClient();

  /**
   * Todos os períodos da loja (aba Feriados e agenda) começam pela mesma chave,
   * e a agenda deixa de oferecer horário no dia fechado.
   */
  const invalidateStoreCalendar = (storeId: string) => {
    const [holidaysPrefix] = CACHE_QUERY_KEYS.holidays(storeId);

    void queryClient.invalidateQueries({ queryKey: [holidaysPrefix] });
    void queryClient.invalidateQueries({
      queryKey: CACHE_QUERY_KEYS.schedules(storeId),
    });
  };

  const createHolidayMutation = useMutation({
    mutationFn: ({ storeId, holiday }: TCreateHolidayVariables) =>
      HolidaysService.create(storeId, holiday),
    onSuccess: (_data, { storeId }) => {
      invalidateStoreCalendar(storeId);
      toast.success('Feriado adicionado');
    },
    onError: (error) => {
      // O 409 (data repetida) aparece no próprio campo de data
      if (isApiHttpError(error) && error.status === 409) return;

      toast.error('Não foi possível adicionar o feriado');
    },
  });

  const deleteHolidayMutation = useMutation({
    mutationFn: ({ storeId, holidayId }: TDeleteHolidayVariables) =>
      HolidaysService.delete(storeId, holidayId),
    onSuccess: (_data, { storeId }) => {
      invalidateStoreCalendar(storeId);
      toast.success('Feriado removido');
    },
    onError: () => {
      toast.error('Não foi possível remover o feriado');
    },
  });

  return { createHolidayMutation, deleteHolidayMutation };
};
