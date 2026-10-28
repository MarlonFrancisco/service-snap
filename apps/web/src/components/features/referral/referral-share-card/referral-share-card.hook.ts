'use client';

import { useReferralQuery } from '@/hooks/use-query/use-referral-query';
import { toast } from 'sonner';
import type { TReferralShareCardConfig } from './referral-share-card.types';

async function copyText(value: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(successMessage);
  } catch {
    toast.error('Falha ao copiar. Tente novamente.');
  }
}

export function useReferralShareCard({ variant }: TReferralShareCardConfig) {
  const { referral, isPendingReferral, isErrorReferral, refetchReferral } =
    useReferralQuery();

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
    void copyText(referral.code, 'Código copiado!');
  };

  const handleCopyPrimary = () => {
    if (!primaryUrl) return;
    void copyText(primaryUrl, 'Link copiado!');
  };

  const handleCopySecondary = () => {
    if (!secondaryUrl) return;
    void copyText(secondaryUrl, 'Link copiado!');
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
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }

    await copyText(primaryUrl, 'Link copiado!');
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
    handleCopyCode,
    handleCopyPrimary,
    handleCopySecondary,
    handleShare,
  };
}
