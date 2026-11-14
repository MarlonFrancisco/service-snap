'use client';

import {
  formatDateTime,
  formatShortDay,
} from '@/components/features/anamnesis/anamnesis.helpers';
import { useAnamnesisMutations } from '@/hooks/partner/use-anamnesis-mutations';
import {
  useAnamnesisFormsQuery,
  useCustomerAnamnesisQuery,
} from '@/hooks/partner/use-anamnesis-query';
import type { TAnamnesisLink } from '@/types/api/anamnesis.types';
import { generateWhatsAppLink } from '@/utils/helpers/whatsapp.helper';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getCustomerName } from '../../../customers-module/customers-module.helpers';
import { useAnamnesisAccess } from '../../anamnesis-module.hook';
import { getApplicableForms } from '../../anamnesis-module.helpers';
import type { TAnamnesisLinkStatus } from '../../anamnesis-module.types';
import type { TAnamnesisLinkCardConfig } from './anamnesis-link-card.types';

const LINK_ERROR = 'Não foi possível gerar o link. Tente de novo.';

/**
 * Ficha de anamnese do agendamento: se foi preenchida e o link para o
 * cliente (copiar ou mandar pelo WhatsApp). O link é assinado e não é salvo;
 * sai na hora em que alguém pede.
 */
export const useAnamnesisLinkCard = ({
  appointment,
}: TAnamnesisLinkCardConfig) => {
  const { storeId, storeName, storeState } = useAnamnesisAccess();
  const [link, setLink] = useState<TAnamnesisLink | null>(null);
  const [isCopyFallback, setIsCopyFallback] = useState(false);

  const scheduleId = appointment.id;
  const customerId = appointment.user?.id;
  const isReady = storeState === 'ready';

  // Outro agendamento aberto: o link anterior não vale para ele
  useEffect(() => {
    setLink(null);
    setIsCopyFallback(false);
  }, [scheduleId]);

  const { forms, isLoadingForms } = useAnamnesisFormsQuery({
    storeId,
    enabled: isReady,
  });
  const { entries } = useCustomerAnamnesisQuery({
    storeId,
    customerId,
    enabled: isReady,
  });
  const { createLinkMutation } = useAnamnesisMutations({ storeId });

  const applicableForms = useMemo(
    () => getApplicableForms(forms, appointment.service?.id),
    [forms, appointment.service?.id],
  );
  const submitted = entries.find((entry) => entry.schedule?.id === scheduleId);
  const status: TAnamnesisLinkStatus = submitted ? 'submitted' : 'pending';

  const dateLabel = `${formatShortDay(appointment.date)} às ${appointment.startTime.slice(0, 5)}`;
  const customerName = appointment.user
    ? getCustomerName(appointment.user)
    : 'Cliente';
  const telephone = appointment.user?.telephone;
  const hasPhone = !!telephone && telephone.replace(/\D/g, '').length >= 8;

  const ensureLink = useCallback(
    async () => link ?? (await createLinkMutation.mutateAsync(scheduleId)),
    [link, createLinkMutation, scheduleId],
  );

  const handleCopy = useCallback(async () => {
    try {
      const created = await ensureLink();

      setLink(created);
      try {
        await navigator.clipboard.writeText(created.url);
        toast.success('Link copiado');
      } catch {
        // Sem permissão de área de transferência: o link aparece para copiar
        setIsCopyFallback(true);
      }
    } catch {
      toast.error(LINK_ERROR);
    }
  }, [ensureLink]);

  const handleWhatsapp = useCallback(async () => {
    if (!telephone) return;

    // A aba abre no clique; o endereço entra quando o link fica pronto
    const popup = link ? null : window.open('about:blank', '_blank');

    try {
      const created = await ensureLink();
      const firstName = appointment.user?.firstName?.trim();
      const message = `Olá${firstName ? `, ${firstName}` : ''}! Antes do seu horário de ${dateLabel}${storeName ? ` na ${storeName}` : ''}, preencha a ficha de saúde: ${created.url}`;
      const whatsappUrl = generateWhatsAppLink(telephone, message);

      setLink(created);
      if (popup) {
        popup.opener = null;
        popup.location.href = whatsappUrl;
      } else {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      popup?.close();
      toast.error(LINK_ERROR);
    }
  }, [telephone, link, ensureLink, appointment.user, dateLabel, storeName]);

  return {
    // Sem ficha pedida para o serviço, não há o que mostrar
    isVisible: isReady && !isLoadingForms && applicableForms.length > 0,
    title: applicableForms.map(({ name }) => name).join(', '),
    subtitle: [customerName, dateLabel, appointment.service?.name]
      .filter(Boolean)
      .join(' · '),
    status,
    statusLabel: submitted
      ? `Preenchida em ${formatDateTime(submitted.submittedAt)}`
      : 'Ainda não preenchida',
    hasPhone,
    linkUrl: isCopyFallback ? link?.url ?? null : null,
    isGenerating: createLinkMutation.isPending,
    handleCopy: () => void handleCopy(),
    handleWhatsapp: () => void handleWhatsapp(),
  };
};
