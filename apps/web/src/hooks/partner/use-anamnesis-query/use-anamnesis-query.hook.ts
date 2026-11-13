import { isApiHttpError } from '@/service/api';
import { AnamnesisService } from '@/service/partner/anamnesis';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';
import type {
  TUseAnamnesisFormsQueryConfig,
  TUseAnamnesisResponseQueryConfig,
  TUseCustomerAnamnesisQueryConfig,
} from './use-anamnesis-query.types';

const NO_RETRY_STATUS = [400, 401, 403, 404];

/** Sem acesso ou sem ficha não melhora tentando de novo. */
const retryAnamnesis = (failureCount: number, error: unknown) =>
  !(isApiHttpError(error) && NO_RETRY_STATUS.includes(error.status)) &&
  failureCount < 2;

export const isAnamnesisForbidden = (error: unknown) =>
  isApiHttpError(error) && error.status === 403;

export const useAnamnesisFormsQuery = ({
  storeId,
  enabled = true,
}: TUseAnamnesisFormsQueryConfig) => {
  const canFetch = enabled && !!storeId;

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.anamnesisForms(storeId!),
    queryFn: () => AnamnesisService.getForms(storeId!),
    enabled: canFetch,
    retry: retryAnamnesis,
  });

  return {
    forms: data ?? [],
    isLoadingForms: canFetch && isPending,
    isFetchingForms: isFetching,
    isFormsError: canFetch && isError,
    isFormsForbidden: isAnamnesisForbidden(error),
    refetchForms: refetch,
  };
};

/** Lista sem respostas: qual ficha, de quando e de qual atendimento. */
export const useCustomerAnamnesisQuery = ({
  storeId,
  customerId,
  enabled = true,
}: TUseCustomerAnamnesisQueryConfig) => {
  const canFetch = enabled && !!storeId && !!customerId;

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.customerAnamnesis(storeId!, customerId!),
    queryFn: () => AnamnesisService.getCustomerEntries(storeId!, customerId!),
    enabled: canFetch,
    retry: retryAnamnesis,
  });

  return {
    entries: data ?? [],
    isLoadingEntries: canFetch && isPending,
    isFetchingEntries: isFetching,
    isEntriesError: canFetch && isError,
    isEntriesForbidden: isAnamnesisForbidden(error),
    refetchEntries: refetch,
  };
};

/**
 * Respostas abertas. Dado de saúde: nada fica no cache depois de fechar, e
 * cada abertura passa pela API (que registra a leitura no histórico).
 */
export const useAnamnesisResponseQuery = ({
  storeId,
  responseId,
  enabled = true,
}: TUseAnamnesisResponseQueryConfig) => {
  const canFetch = enabled && !!storeId && !!responseId;

  const { data, dataUpdatedAt, isPending, isError, error, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.anamnesisResponse(storeId!, responseId!),
    queryFn: () => AnamnesisService.getResponse(storeId!, responseId!),
    enabled: canFetch,
    staleTime: 0,
    gcTime: 0,
    retry: retryAnamnesis,
  });

  return {
    response: data,
    /** Quando a leitura (registrada pela API) chegou, em ms. */
    responseReadAt: dataUpdatedAt,
    isLoadingResponse: canFetch && isPending,
    isResponseError: canFetch && isError,
    isResponseForbidden: isAnamnesisForbidden(error),
    isResponseNotFound:
      isApiHttpError(error) && [400, 404].includes(error.status),
    refetchResponse: refetch,
  };
};
