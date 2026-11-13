import { AnamnesisService } from '@/service/partner/anamnesis';
import type {
  IAnamnesisForm,
  TCreateAnamnesisForm,
} from '@/types/api/anamnesis.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  TDeleteAnamnesisResponseVariables,
  TUpdateAnamnesisFormVariables,
  TUseAnamnesisMutationsConfig,
} from './use-anamnesis-mutations.types';

export const useAnamnesisMutations = ({
  storeId,
}: TUseAnamnesisMutationsConfig) => {
  const queryClient = useQueryClient();

  /** A ficha já volta pronta: entra na lista sem esperar a releitura. */
  const upsertFormInCache = (form: IAnamnesisForm) => {
    queryClient.setQueryData<IAnamnesisForm[]>(
      CACHE_QUERY_KEYS.anamnesisForms(storeId),
      (forms = []) =>
        forms.some(({ id }) => id === form.id)
          ? forms.map((item) => (item.id === form.id ? form : item))
          : [...forms, form],
    );
    return queryClient.invalidateQueries({
      queryKey: CACHE_QUERY_KEYS.anamnesisForms(storeId),
    });
  };

  const createFormMutation = useMutation({
    mutationFn: (form: TCreateAnamnesisForm) =>
      AnamnesisService.createForm(storeId, form),
    onSuccess: upsertFormInCache,
  });

  const updateFormMutation = useMutation({
    mutationFn: ({ formId, changes }: TUpdateAnamnesisFormVariables) =>
      AnamnesisService.updateForm(storeId, formId, changes),
    onSuccess: upsertFormInCache,
  });

  /** Link assinado: nada é gravado, então não há cache para atualizar. */
  const createLinkMutation = useMutation({
    mutationFn: (scheduleId: string) =>
      AnamnesisService.createLink(storeId, scheduleId),
  });

  const deleteResponseMutation = useMutation({
    mutationFn: ({ responseId }: TDeleteAnamnesisResponseVariables) =>
      AnamnesisService.deleteResponse(storeId, responseId),
    onSuccess: (_, { responseId, customerId }) => {
      queryClient.removeQueries({
        queryKey: CACHE_QUERY_KEYS.anamnesisResponse(storeId, responseId),
      });
      return queryClient.invalidateQueries({
        queryKey: CACHE_QUERY_KEYS.customerAnamnesis(storeId, customerId),
      });
    },
  });

  return {
    createFormMutation,
    updateFormMutation,
    createLinkMutation,
    deleteResponseMutation,
  };
};
