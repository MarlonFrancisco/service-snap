'use client';

import { useReferralQuery } from '@/hooks/use-query/use-referral-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { toast } from 'sonner';
import type { TReferralShareCardConfig } from './referral-share-card.types';

/** Retorna se a cópia deu certo, para registrar só o que aconteceu. */
async function copyText(value: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(successMessage);
    return true;
  } catch {
    toast.error('Falha ao copiar. Tente novamente.');
    return false;
  }
}

const toDisplayUrl = (url?: string) => url?.replace(/^https?:\/\//, '') ?? '';

const getReferredLabel = (count: number) => {
  if (count === 0) return 'Nenhuma indicação registrada ainda.';
  if (count === 1) return '1 pessoa entrou com o seu link.';
  return `${count} pessoas entraram com o seu link.`;
};

export function useReferralShareCard({ variant }: TReferralShareCardConfig) {
  const { referral, isPendingReferral, isErrorReferral, refetchReferral } =
    useReferralQuery();
  const analytics = useAnalytics();

  const trackShared = (
    action: 'copy_code' | 'copy_link' | 'share',
    method: 'clipboard' | 'native_share',
  ) => analytics.track('referral_shared', { action, variant, method });

  const copyAndTrack = async (
    value: string,
    successMessage: string,
    action: 'copy_code' | 'copy_link' | 'share',
  ) => {
    if (await copyText(value, successMessage)) trackShared(action, 'clipboard');
  };

  const primaryUrl =
    variant === 'partner'
      ? referral?.partnerInviteUrl
      : referral?.clientInviteUrl;

  const primaryLabel =
    variant === 'partner'
      ? 'Link para ser parceiro'
      : 'Link para convidar clientes';

  const secondaryUrl =
    variant === 'partner'
      ? referral?.clientInviteUrl
      : referral?.partnerInviteUrl;

  const secondaryLabel =
    variant === 'partner'
      ? 'Link para convidar clientes'
      : 'Link para ser parceiro';

  const handleCopyCode = () => {
    if (!referral?.code) return;
    void copyAndTrack(referral.code, 'Código copiado!', 'copy_code');
  };

  const handleCopyPrimary = () => {
    if (!primaryUrl) return;
    void copyAndTrack(primaryUrl, 'Link copiado!', 'copy_link');
  };

  const handleCopySecondary = () => {
    if (!secondaryUrl) return;
    void copyAndTrack(secondaryUrl, 'Link copiado!', 'copy_link');
  };

  const handleShare = async () => {
    if (!primaryUrl) return;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'ServiceSnap',
          text: 'Te indico o ServiceSnap — agenda e serviços em um só lugar.',
          url: primaryUrl,
        });
        trackShared('share', 'native_share');
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }

    await copyAndTrack(primaryUrl, 'Link copiado!', 'share');
  };

  return {
    referral,
    isPendingReferral,
    isErrorReferral,
    refetchReferral,
    primaryUrl,
    primaryLabel,
    secondaryUrl,
    secondaryLabel,
    primaryDisplayUrl: toDisplayUrl(primaryUrl),
    secondaryDisplayUrl: toDisplayUrl(secondaryUrl),
    referredLabel: getReferredLabel(referral?.referredCount ?? 0),
    handleCopyCode,
    handleCopyPrimary,
    handleCopySecondary,
    handleShare,
  };
}
