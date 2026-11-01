import { OnboardingService } from '@/service/partner/onboarding';
import { GalleryService } from '@/service/store/gallery.service';
import type {
  TOnboardingResult,
  TOnboardingStep,
} from '@/types/api/onboarding.types';
import type { IStoreGallery } from '@/types/api/stores.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import {
  MAX_PHOTOS,
  MAX_PHOTO_SIZE,
} from '../../partner-onboarding.constants';
import {
  getApiErrorMessage,
  getApiErrorStep,
  readFileAsDataUrl,
} from '../../partner-onboarding.helpers';
import { useOnboardingState } from '../../partner-onboarding.hook';

type TUsePhotosStepParams = {
  storeId: string;
  gallery: IStoreGallery[];
  onCompleted: (result: TOnboardingResult) => void;
  onGoToStep: (step: TOnboardingStep) => void;
};

export const usePhotosStep = ({
  storeId,
  gallery,
  onCompleted,
  onGoToStep,
}: TUsePhotosStepParams) => {
  const queryClient = useQueryClient();
  const { refetch } = useOnboardingState();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeMutation = useMutation({
    mutationFn: () => OnboardingService.complete(),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({
        queryKey: CACHE_QUERY_KEYS.stores(),
      });
      onCompleted(result);
    },
    onError: (mutationError) => {
      const step = getApiErrorStep(mutationError) as TOnboardingStep | null;
      setError(
        getApiErrorMessage(
          mutationError,
          'Não foi possível concluir. Tente de novo.',
        ),
      );
      if (step) onGoToStep(step);
    },
  });

  const uploadFiles = async (files: File[]) => {
    setError(null);

    const remaining = MAX_PHOTOS - gallery.length;
    const images = files.filter((file) => file.type.startsWith('image/'));
    const valid = images.filter((file) => file.size <= MAX_PHOTO_SIZE);
    const accepted = valid.slice(0, Math.max(remaining, 0));

    if (images.length !== files.length) {
      setError('Envie apenas arquivos de imagem.');
    } else if (valid.length !== images.length) {
      setError('Cada foto pode ter no máximo 5MB.');
    } else if (accepted.length !== valid.length) {
      setError(`Você pode enviar até ${MAX_PHOTOS} fotos.`);
    }

    if (!accepted.length) return;

    setIsUploading(true);

    try {
      // Uma de cada vez: a primeira foto vira a principal, e várias imagens em
      // base64 juntas passariam do limite de corpo da API.
      let hasMain = gallery.some((image) => image.isMain);

      for (const file of accepted) {
        const url = await readFileAsDataUrl(file);
        await GalleryService.create(storeId, { url, isMain: !hasMain });
        hasMain = true;
      }
    } catch (uploadError) {
      setError(
        getApiErrorMessage(
          uploadError,
          'Não foi possível enviar a foto. Tente de novo.',
        ),
      );
    } finally {
      await refetch();
      setIsUploading(false);
    }
  };

  const handleRemove = async (image: IStoreGallery) => {
    setError(null);

    try {
      await GalleryService.delete(storeId, image.id);

      // Sem esta troca, o cartão público ficaria sem foto de capa.
      const next = gallery.find((other) => other.id !== image.id);
      if (image.isMain && next) {
        await GalleryService.update(storeId, next.id);
      }
    } catch (removeError) {
      setError(
        getApiErrorMessage(
          removeError,
          'Não foi possível remover a foto. Tente de novo.',
        ),
      );
    }

    await refetch();
  };

  const handleSetMain = async (image: IStoreGallery) => {
    setError(null);

    try {
      await GalleryService.update(storeId, image.id);
    } catch (mainError) {
      setError(
        getApiErrorMessage(
          mainError,
          'Não foi possível marcar a foto. Tente de novo.',
        ),
      );
    }

    await refetch();
  };

  return {
    inputRef,
    isDragging,
    isUploading,
    isCompleting: completeMutation.isPending,
    error,
    canAddMore: gallery.length < MAX_PHOTOS,
    openFilePicker: () => inputRef.current?.click(),
    handleFileChange: (event: ChangeEvent<HTMLInputElement>) => {
      void uploadFiles([...(event.target.files ?? [])]);
      event.target.value = '';
    },
    handleDragOver: (event: DragEvent) => {
      event.preventDefault();
      setIsDragging(true);
    },
    handleDragLeave: () => setIsDragging(false),
    handleDrop: (event: DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      void uploadFiles([...event.dataTransfer.files]);
    },
    handleRemove: (image: IStoreGallery) => void handleRemove(image),
    handleSetMain: (image: IStoreGallery) => void handleSetMain(image),
    handleComplete: () => completeMutation.mutate(),
  };
};
