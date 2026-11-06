import type { IStoreCardData } from '@/components/ui/store-card/store-card.types';
import { useAnalytics } from '@/providers/analytics.provider';
import { OnboardingService } from '@/service/partner/onboarding';
import type { TOnboardingResult } from '@/types/api/onboarding.types';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { formatCurrency } from '../../partner-onboarding.helpers';

export const useReadyStep = ({ store, services, gallery }: TOnboardingResult) => {
  const bookingPath = `/booking/${store.id}`;
  // O link depende do domínio do navegador, que o servidor não conhece.
  const [origin, setOrigin] = useState('');
  const analytics = useAnalytics();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const bookingUrl = `${origin}${bookingPath}`;

  const previewStore = useMemo<IStoreCardData>(() => {
    const total = services.reduce((sum, service) => sum + service.price, 0);
    const mainFirst = [...gallery].sort(
      (a, b) => Number(b.isMain) - Number(a.isMain),
    );

    return {
      id: store.id,
      name: store.name,
      location: `${store.city}, ${store.state}`,
      rating: 0,
      reviewCount: 0,
      averagePrice: services.length
        ? formatCurrency(total / services.length)
        : null,
      gallery: mainFirst.map((image) => image.url),
      services,
    };
  }, [store, services, gallery]);

  const markShared = () => {
    // Só alimenta o checklist: uma falha aqui não deve atrapalhar quem compartilhou.
    void OnboardingService.markLinkShared(store.id).catch(() => undefined);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      markShared();
      analytics.track('booking_link_copied', {
        store_id: store.id,
        source: 'onboarding_ready',
        method: 'clipboard',
      });
      toast.success('Link copiado');
    } catch {
      toast.error('Não foi possível copiar. Selecione o link e copie.');
    }
  };

  const handleShare = async () => {
    if (!navigator.share) {
      await handleCopy();
      return;
    }

    try {
      await navigator.share({ title: store.name, url: bookingUrl });
      markShared();
      analytics.track('booking_link_copied', {
        store_id: store.id,
        source: 'onboarding_ready',
        method: 'native_share',
      });
    } catch {
      // Cancelar o menu de compartilhar não é erro.
    }
  };

  return {
    bookingPath,
    bookingUrl,
    previewStore,
    handleCopy: () => void handleCopy(),
    handleShare: () => void handleShare(),
  };
};
