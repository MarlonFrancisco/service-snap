import { isApiHttpError } from '@/service/api';
import { CampaignsService } from '@/service/partner/campaigns';
import { WhatsappService } from '@/service/whatsapp';
import type { ICampaign } from '@/types/api/campaigns.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
  TUseCampaignQueryConfig,
  TUseCampaignsQueryConfig,
  TUseInactiveCustomersQueryConfig,
} from './use-campaigns-query.types';

const NO_RETRY_STATUS = [400, 401, 403, 404];
/** Enquanto alguma campanha está saindo, a tela acompanha sozinha. */
const SENDING_REFRESH_MS = 5000;

const retryCampaigns = (failureCount: number, error: unknown) =>
  !(isApiHttpError(error) && NO_RETRY_STATUS.includes(error.status)) &&
  failureCount < 2;

const isForbidden = (error: unknown) =>
  isApiHttpError(error) && error.status === 403;

const isSending = (campaign: Pick<ICampaign, 'status'>) =>
  campaign.status !== 'done';

export const useInactiveCustomersQuery = ({
  storeId,
  inactiveDays,
  enabled = true,
}: TUseInactiveCustomersQueryConfig) => {
  const canFetch = enabled && !!storeId;

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.inactiveCustomers(storeId!, inactiveDays),
    queryFn: () =>
      CampaignsService.getInactiveCustomers(storeId!, inactiveDays),
    enabled: canFetch,
    placeholderData: keepPreviousData,
    retry: retryCampaigns,
  });

  return {
    inactiveCustomers: data ?? [],
    isLoadingInactiveCustomers: canFetch && isPending,
    isFetchingInactiveCustomers: isFetching,
    isInactiveCustomersError: canFetch && isError,
    isInactiveCustomersForbidden: isForbidden(error),
    refetchInactiveCustomers: refetch,
  };
};

export const useCampaignsQuery = ({
  storeId,
  enabled = true,
}: TUseCampaignsQueryConfig) => {
  const canFetch = enabled && !!storeId;

  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.campaigns(storeId!),
    queryFn: () => CampaignsService.getAll(storeId!),
    enabled: canFetch,
    retry: retryCampaigns,
    refetchInterval: (query) =>
      query.state.data?.some(isSending) ? SENDING_REFRESH_MS : false,
  });

  return {
    campaigns: data ?? [],
    isLoadingCampaigns: canFetch && isPending,
    isFetchingCampaigns: isFetching,
    isCampaignsError: canFetch && isError,
    refetchCampaigns: refetch,
  };
};

export const useCampaignQuery = ({
  storeId,
  campaignId,
  enabled = true,
}: TUseCampaignQueryConfig) => {
  const canFetch = enabled && !!storeId && !!campaignId;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.campaign(storeId!, campaignId!),
    queryFn: () => CampaignsService.get(storeId!, campaignId!),
    enabled: canFetch,
    retry: retryCampaigns,
    refetchInterval: (query) =>
      query.state.data && isSending(query.state.data)
        ? SENDING_REFRESH_MS
        : false,
  });

  return {
    campaign: data,
    isLoadingCampaign: canFetch && isPending,
    isCampaignError: canFetch && isError,
    refetchCampaign: refetch,
  };
};

/**
 * Templates da conta da loja na Meta. Sem WhatsApp conectado a rota falha:
 * vale como "nenhum template", sem tentar de novo.
 */
export const useCampaignTemplatesQuery = ({
  storeId,
  enabled = true,
}: TUseCampaignsQueryConfig) => {
  const canFetch = enabled && !!storeId;

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: CACHE_QUERY_KEYS.whatsappTemplates(storeId!),
    queryFn: () => WhatsappService.getTemplates(storeId!),
    enabled: canFetch,
    retry: false,
  });

  return {
    templates: data ?? [],
    isLoadingTemplates: canFetch && isPending,
    isTemplatesError: canFetch && isError,
    isFetchingTemplates: isFetching,
    refetchTemplates: refetch,
  };
};
