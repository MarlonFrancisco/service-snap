import { useGalleryMutations } from '@/hooks/partner/store/use-gallery-mutations/use-gallery-mutations.hook';
import type { IStoreGallery } from '@/types/api/stores.types';
import { useFormContext } from 'react-hook-form';
import type { TStoreFormSchema } from '../store-form.schema';

export const useGalleryTab = () => {
  const { createImageMutation, deleteImageMutation, updateMainImageMutation } =
    useGalleryMutations();
  const form = useFormContext<TStoreFormSchema>();

  const gallery = form.watch('gallery') as IStoreGallery[];

  // Os callbacks leem o valor atual: em upload múltiplo, cada resposta chega
  // depois de a anterior ter alterado a lista.
  const onGalleryChange = (images: IStoreGallery[]) => {
    images.forEach((image) =>
      createImageMutation.mutate(
        {
          storeId: form.getValues('id')!,
          image: { url: image.url, isMain: image.isMain },
        },
        {
          onSuccess: (data) => {
            form.setValue('gallery', [...form.getValues('gallery'), data]);
          },
        },
      ),
    );
  };

  const onChangeMainImage = (image: IStoreGallery) => {
    updateMainImageMutation.mutate(
      {
        storeId: form.getValues('id')!,
        imageId: image.id,
      },
      {
        onSuccess: () => {
          form.setValue(
            'gallery',
            form.getValues('gallery').map((img) => ({
              ...img,
              isMain: img.id === image.id,
            })),
          );
        },
      },
    );
  };

  const onDeleteImage = (imageId: string) => {
    deleteImageMutation.mutate(
      { storeId: form.getValues('id')!, imageId },
      {
        onSuccess: () => {
          form.setValue(
            'gallery',
            form.getValues('gallery').filter((img) => img.id !== imageId),
          );
        },
      },
    );
  };

  return {
    gallery,
    onGalleryChange,
    onChangeMainImage,
    onDeleteImage,
  };
};
