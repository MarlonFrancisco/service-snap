import { useAnalytics } from '@/providers/analytics.provider';
import {
  instagramLabel,
  storePublicUrl,
  toInstagramUrl,
} from '@/utils/helpers/social.helper';
import { useCallback } from 'react';
import { toast } from 'sonner';
import type { TStorePublicPresenceConfig } from './store-public-presence.types';

export const useStorePublicPresence = ({
  storeId,
  slug,
  instagram,
}: TStorePublicPresenceConfig) => {
  const analytics = useAnalytics();
  const publicUrl = storePublicUrl(slug || storeId);

  const handleCopyPublicUrl = useCallback(() => {
    void navigator.clipboard.writeText(publicUrl).then(
      () => {
        analytics.track('booking_link_copied', {
          store_id: storeId,
          source: 'store_details',
          method: 'clipboard',
        });
        toast.success('Link copiado');
      },
      () => toast.error('Falha ao copiar o link'),
    );
  }, [analytics, publicUrl, storeId]);

  return {
    instagramUrl: toInstagramUrl(instagram),
    instagramHandle: instagramLabel(instagram),
    publicUrl,
    handleCopyPublicUrl,
  };
};
