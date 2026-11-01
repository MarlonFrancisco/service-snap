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
  instagram,
}: TStorePublicPresenceConfig) => {
  const publicUrl = storePublicUrl(storeId);

  const handleCopyPublicUrl = useCallback(() => {
    void navigator.clipboard.writeText(publicUrl).then(
      () => toast.success('Link copiado'),
      () => toast.error('Falha ao copiar o link'),
    );
  }, [publicUrl]);

  return {
    instagramUrl: toInstagramUrl(instagram),
    instagramHandle: instagramLabel(instagram),
    publicUrl,
    handleCopyPublicUrl,
  };
};
