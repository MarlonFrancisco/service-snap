import { useNotificationsMutations } from '@/hooks/partner/use-notifications-mutations/use-notifications-mutations.hook';
import { useWhatsappQuery } from '@/hooks/use-query/use-whatsapp-query/use-whatsapp-query.hook';
import { isNotFoundError } from '@/service/api';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useReminderSettingsLoad } from '../notifications-module.hook';
import type { TNotificationsSettingsData } from '../notifications-module.types';
import {
  TWhatsappSettingsFormData,
  whatsappSettingsSchema,
} from './whatsapp-settings.schema';

const getWhatsappFormValues = (
  settings: TNotificationsSettingsData,
): TWhatsappSettingsFormData => ({
  whatsappReminderEnabled: settings?.whatsappReminderEnabled ?? false,
  whatsappReminderAdvanceHours: settings?.whatsappReminderAdvanceHours ?? '24h',
  whatsappReminderCustomMessage: settings?.whatsappReminderCustomMessage ?? '',
});

export const useWhatsappSettings = () => {
  const queryClient = useQueryClient();
  const form = useForm<TWhatsappSettingsFormData>({
    resolver: zodResolver(whatsappSettingsSchema),
    defaultValues: getWhatsappFormValues(null),
  });

  const { storeId, notificationsSettings, loadState, handleRetry, isRetrying } =
    useReminderSettingsLoad({
      reset: form.reset,
      getFormValues: getWhatsappFormValues,
    });

  const { whatsappConfig, isWhatsappPending, isWhatsappError, whatsappError } =
    useWhatsappQuery(storeId);

  const { updateNotificationsSettingsMutation } = useNotificationsMutations({
    storeId,
    notificationHistoryParams: {},
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!isConnected) return;

    updateNotificationsSettingsMutation.mutate(
      {
        ...data,
        id: notificationsSettings?.id,
      },
      {
        // Ativar cria o template na Meta: o status no painel precisa ser relido
        onSuccess: () =>
          queryClient.invalidateQueries({
            queryKey: CACHE_QUERY_KEYS.whatsappReminderTemplate(storeId),
          }),
      },
    );
  });

  // Não afirma que falta ativar enquanto carrega ou quando a leitura falhou.
  const isConfigUnknown =
    isWhatsappPending || (isWhatsappError && !isNotFoundError(whatsappError));
  const isConnected = Boolean(whatsappConfig?.isActive);

  // Sem integração ativa o lembrete não tem por onde sair: o canal fica bloqueado.
  const getLockedHint = () => {
    if (isConnected) return undefined;
    if (isWhatsappPending) return 'Verificando a integração do WhatsApp...';
    if (isConfigUnknown) {
      return 'Não foi possível verificar a integração do WhatsApp. Recarregue a página para tentar de novo.';
    }
    return 'Disponível depois que o WhatsApp da loja estiver conectado.';
  };

  return {
    form,
    isUpdatingNotificationsSettings:
      updateNotificationsSettingsMutation.isPending,
    showActivationNotice: !isConfigUnknown && !isConnected,
    lockedHint: getLockedHint(),
    handleSubmit,
    loadState,
    handleRetry,
    isRetrying,
    storeId,
    isConnected,
  };
};
