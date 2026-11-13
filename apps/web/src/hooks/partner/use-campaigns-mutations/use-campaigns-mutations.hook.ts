import { CampaignsService } from '@/service/partner/campaigns';
import type { TCreateCampaign } from '@/types/api/campaigns.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TUseCampaignsMutationsConfig } from './use-campaigns-mutations.types';

export const useCampaignsMutations = ({
  storeId,
}: TUseCampaignsMutationsConfig) => {
  const queryClient = useQueryClient();

  // Qualquer período de inatividade: quem saiu da lista some de todos
  const invalidateInactiveCustomers = () =>
    queryClient.invalidateQueries({
      queryKey: CACHE_QUERY_KEYS.inactiveCustomers(storeId, 0).slice(0, 1),
    });

  const createCampaignMutation = useMutation({
    mutationFn: (campaign: TCreateCampaign) =>
      CampaignsService.create(storeId, campaign),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: CACHE_QUERY_KEYS.campaigns(storeId),
      }),
  });

  const optOutMutation = useMutation({
    mutationFn: (customerId: string) =>
      CampaignsService.optOut(storeId, customerId),
    onSuccess: invalidateInactiveCustomers,
  });

  const optInMutation = useMutation({
    mutationFn: (customerId: string) =>
      CampaignsService.optIn(storeId, customerId),
    onSuccess: invalidateInactiveCustomers,
  });

  return { createCampaignMutation, optOutMutation, optInMutation };
};
