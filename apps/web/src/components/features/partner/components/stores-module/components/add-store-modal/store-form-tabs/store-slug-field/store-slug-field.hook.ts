import { useAnalytics } from '@/providers/analytics.provider';
import { storePublicUrl } from '@/utils/helpers/social.helper';
import { useCallback } from 'react';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { TStoreFormSchema } from '../store-form.schema';
import { normalizeSlugInput } from './store-slug-field.helpers';

export const useStoreSlugField = () => {
  const form = useFormContext<TStoreFormSchema>();
  const [storeId, slug] = useWatch({
    control: form.control,
    name: ['id', 'slug'],
  });
  const { errors, dirtyFields } = useFormState({
    control: form.control,
    name: 'slug',
  });
  const analytics = useAnalytics();

  const hasError = !!errors.slug;
  const isUnsaved = !!dirtyFields.slug;
  // Só o link salvo abre a loja; o digitado passa a valer depois de salvar.
  const canCopy = !!slug && !hasError && !isUnsaved;

  const handleCopyLink = useCallback(() => {
    if (!canCopy || !slug) return;

    void navigator.clipboard.writeText(storePublicUrl(slug)).then(
      () => {
        analytics.track('booking_link_copied', {
          store_id: storeId ?? '',
          source: 'store_details',
          method: 'clipboard',
        });
        toast.success('Link copiado');
      },
      () => toast.error('Falha ao copiar o link'),
    );
  }, [analytics, canCopy, slug, storeId]);

  return {
    isVisible: !!storeId,
    canCopy,
    isUnsaved: isUnsaved && !hasError,
    normalizeSlugInput,
    handleCopyLink,
  };
};
