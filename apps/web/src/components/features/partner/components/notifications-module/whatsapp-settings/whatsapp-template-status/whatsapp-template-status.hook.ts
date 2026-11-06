import { useAnalytics } from '@/providers/analytics.provider';
import { WhatsappService } from '@/service/whatsapp';
import type { TWhatsappReminderTemplateStatus } from '@/types/api/whatsapp.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  TWhatsappTemplateStatusConfig,
  TWhatsappTemplateView,
} from './whatsapp-template-status.types';

const TEMPLATE_VIEWS: Record<string, TWhatsappTemplateView> = {
  APPROVED: {
    tone: 'success',
    title: 'Template aprovado pela Meta',
    description: 'Os lembretes por WhatsApp já podem ser enviados.',
  },
  PENDING: {
    tone: 'waiting',
    title: 'Template em análise pela Meta',
    description:
      'A aprovação costuma levar de minutos a algumas horas. Até lá, os lembretes ficam em espera.',
  },
  IN_APPEAL: {
    tone: 'waiting',
    title: 'Template em recurso na Meta',
    description:
      'A Meta está revisando o template de novo. Até lá, os lembretes ficam em espera.',
  },
  REJECTED: {
    tone: 'danger',
    title: 'A Meta recusou o template',
    description:
      'Sem um template aprovado, os lembretes por WhatsApp não são enviados. Revise o template no Gerenciador do WhatsApp da Meta.',
  },
  PAUSED: {
    tone: 'danger',
    title: 'Template pausado pela Meta',
    description:
      'A Meta pausou o template por avaliações dos clientes. Os lembretes voltam quando ele for reativado.',
  },
  DISABLED: {
    tone: 'danger',
    title: 'Template desativado pela Meta',
    description:
      'Os lembretes por WhatsApp estão parados. Veja o motivo no Gerenciador do WhatsApp da Meta.',
  },
  MISSING: {
    tone: 'waiting',
    title: 'Template do lembrete ainda não criado',
    description:
      'Ele é criado na sua conta WhatsApp Business quando você ativa os lembretes. Também dá para criar agora.',
    canCreate: true,
  },
};

const getTemplateView = (
  status: TWhatsappReminderTemplateStatus,
): TWhatsappTemplateView =>
  TEMPLATE_VIEWS[status] ?? {
    tone: 'waiting',
    title: `Status do template na Meta: ${status}`,
    description: 'Os lembretes saem só quando o template estiver aprovado.',
  };

export const useWhatsappTemplateStatus = ({
  storeId,
  isConnected,
}: TWhatsappTemplateStatusConfig) => {
  const queryClient = useQueryClient();
  const analytics = useAnalytics();
  const queryKey = CACHE_QUERY_KEYS.whatsappReminderTemplate(storeId);

  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: () => WhatsappService.getReminderTemplate(storeId),
    enabled: Boolean(storeId) && isConnected,
    retry: false,
  });

  const createTemplateMutation = useMutation({
    mutationFn: () => WhatsappService.createReminderTemplate(storeId),
    onSuccess: (template) => {
      queryClient.setQueryData(queryKey, template);
      analytics.track('whatsapp_template_submitted', {});
      toast.success('Template enviado para análise da Meta');
    },
    onError: (error) => {
      analytics.track('whatsapp_template_failed', {});
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : 'Não foi possível criar o template na Meta',
      );
    },
  });

  return {
    isVisible: isConnected,
    view: data ? getTemplateView(data.status) : null,
    rejectedReason: data?.rejectedReason,
    isLoading: isPending,
    isError,
    isRefreshing: isFetching,
    handleRefresh: () => void refetch(),
    handleCreate: () => createTemplateMutation.mutate(),
    isCreating: createTemplateMutation.isPending,
  };
};
