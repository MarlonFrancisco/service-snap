import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import type {
  TOnboardingResult,
  TOnboardingStep,
} from '@/types/api/onboarding.types';
import type { IStoreGallery } from '@/types/api/stores.types';
import { cn } from '@repo/ui';
import { MAX_PHOTOS } from '../../partner-onboarding.constants';
import {
  ONBOARDING_BUTTON_CLASS,
  ONBOARDING_PRIMARY_BUTTON_CLASS,
} from '../../partner-onboarding.styles';
import { OnboardingStepLayout } from '../onboarding-step-layout';
import { usePhotosStep } from './photos-step.hook';

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';

type TPhotosStepProps = {
  storeId: string;
  gallery: IStoreGallery[];
  onBack: () => void;
  onExit: () => void;
  onCompleted: (result: TOnboardingResult) => void;
  onGoToStep: (step: TOnboardingStep) => void;
};

export const PhotosStep = ({
  storeId,
  gallery,
  onBack,
  onExit,
  onCompleted,
  onGoToStep,
}: TPhotosStepProps) => {
  const {
    inputRef,
    isDragging,
    isUploading,
    isCompleting,
    error,
    canAddMore,
    openFilePicker,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRemove,
    handleSetMain,
    handleComplete,
  } = usePhotosStep({ storeId, gallery, onCompleted, onGoToStep });

  const isBusy = isUploading || isCompleting;

  return (
    <OnboardingStepLayout
      step={5}
      stepLabel="Etapa 5 de 5 · opcional"
      title="Adicione fotos do espaço"
      lead="Mostre o ambiente para quem está escolhendo onde agendar."
      error={error}
      isSaving={isBusy}
      primaryLabel="Concluir"
      onBack={onBack}
      onPrimary={handleComplete}
      onSaveAndExit={onExit}
      secondaryAction={
        <button
          type="button"
          onClick={handleComplete}
          disabled={isBusy}
          className={cn(
            ONBOARDING_BUTTON_CLASS,
            'border-transparent bg-transparent px-3 md:px-[26px]',
          )}
        >
          Pular por enquanto
        </button>
      }
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'grid justify-items-center gap-2 rounded-[22px] border-2 border-dashed border-[#C9C6D4] px-5 py-[34px] text-center',
          isDragging && 'border-[#0B0B0F] bg-[#F7F6FA]',
        )}
      >
        <b className="text-base">Arraste as fotos para cá</b>
        <span className="text-[13px] text-[#5F5C6E]">
          Até {MAX_PHOTOS} fotos, com no máximo 5MB cada
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          aria-label="Escolher fotos do espaço"
          onChange={handleFileChange}
          className="sr-only"
          tabIndex={-1}
        />
        <button
          type="button"
          onClick={openFilePicker}
          disabled={!canAddMore || isUploading}
          className={cn(
            ONBOARDING_PRIMARY_BUTTON_CLASS,
            'min-h-12 px-[22px] text-sm',
          )}
        >
          {isUploading ? 'Enviando…' : 'Escolher arquivos'}
        </button>
      </div>

      {gallery.length > 0 && (
        <>
          <p
            aria-live="polite"
            className="mt-[18px] mb-2 text-[13px] font-semibold text-[#5F5C6E]"
          >
            {gallery.length}/{MAX_PHOTOS} fotos
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(190px,100%),1fr))] gap-3">
            {gallery.map((image, index) => (
              <div
                key={image.id}
                className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-[#E9E3F5]"
              >
                <ImageWithFallback
                  src={image.url}
                  alt={`Foto ${index + 1} do espaço`}
                  fill
                  sizes="(max-width: 700px) 100vw, 320px"
                  className="object-cover"
                />
                <button
                  type="button"
                  aria-pressed={image.isMain}
                  onClick={() => handleSetMain(image)}
                  className={cn(
                    'absolute bottom-2 left-2 min-h-11 cursor-pointer rounded-full border-0 bg-white px-3.5 text-xs font-bold text-[#0B0B0F]',
                    image.isMain && 'bg-[#0B0B0F] text-white',
                    FOCUS_RING,
                  )}
                >
                  {image.isMain ? 'Principal' : 'Marcar como principal'}
                </button>
                <button
                  type="button"
                  aria-label={`Remover foto ${index + 1}`}
                  onClick={() => handleRemove(image)}
                  className={cn(
                    'absolute top-1.5 right-1.5 grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-white/92 text-[17px] text-[#0B0B0F]',
                    FOCUS_RING,
                  )}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </OnboardingStepLayout>
  );
};
