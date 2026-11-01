import { PARTNER_MUTED_TEXT_CLASS } from '@/components/features/partner/partner.styles';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { cn } from '@repo/ui';
import {
  STORES_COMPACT_BUTTON_CLASS,
  STORES_DANGER_TEXT_CLASS,
  STORES_ERROR_TEXT_CLASS,
} from '../../stores-module.styles';
import { getStoreImageUrl } from '../../utils/stores-module.helpers';
import { useMultiImageUpload } from './multiple-image-upload.hook';
import type { TMultiImageUploadConfig } from './multiple-image-upload.types';

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

export const MultiImageUpload = ({
  images,
  maxImages = 5,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  className,
  onChange,
  onChangeMain,
  onDelete,
}: TMultiImageUploadConfig) => {
  const {
    fileInputRef,
    dragActive,
    error,
    maxFileSizeInMb,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleInputChange,
    openFileDialog,
  } = useMultiImageUpload({ images, maxImages, maxFileSize, onChange });

  return (
    <div className={cn('grid gap-4', className)}>
      {error ? (
        <p role="alert" className={STORES_ERROR_TEXT_CLASS}>
          {error}
        </p>
      ) : null}

      {images.length < maxImages ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'grid justify-items-center gap-2 rounded-[18px] border-2 border-dashed bg-[#F7F6FA] p-6 text-center text-sm transition-colors',
            PARTNER_MUTED_TEXT_CLASS,
            dragActive ? 'border-[#0B0B0F]' : 'border-[#D5D2DE]',
          )}
        >
          <p className="font-bold text-[#0B0B0F]">
            {dragActive ? 'Solte as fotos aqui' : 'Arraste fotos para cá'}
          </p>
          <p>ou</p>
          <button
            type="button"
            onClick={openFileDialog}
            className={STORES_COMPACT_BUTTON_CLASS}
          >
            Escolher arquivos
          </button>
          <p>Máximo de {maxFileSizeInMb}MB por arquivo</p>
        </div>
      ) : null}

      <p className={cn('text-[13px] font-semibold', PARTNER_MUTED_TEXT_CLASS)}>
        {images.length}/{maxImages} fotos
      </p>

      {images.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {images.map((image, index) => (
            <li key={image.id} className="min-w-0">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#F4F3F7]">
                <ImageWithFallback
                  src={getStoreImageUrl(image.url)}
                  alt={`Foto ${index + 1} da loja`}
                  fill
                  sizes="(min-width: 768px) 280px, 100vw"
                  className="object-cover"
                />
                {image.isMain ? (
                  <span className="absolute top-2 left-2 rounded-full bg-[#0B0B0F] px-2.5 py-[5px] text-xs font-bold text-white">
                    Principal
                  </span>
                ) : null}
              </div>

              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {image.isMain ? null : (
                  <button
                    type="button"
                    onClick={() => onChangeMain(image)}
                    aria-label={`Marcar foto ${index + 1} como principal`}
                    className={cn(STORES_COMPACT_BUTTON_CLASS, 'flex-1 px-2.5')}
                  >
                    Marcar como principal
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(image.id)}
                  aria-label={`Remover foto ${index + 1}`}
                  className={cn(
                    STORES_COMPACT_BUTTON_CLASS,
                    STORES_DANGER_TEXT_CLASS,
                    'flex-1 px-2.5',
                  )}
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleInputChange}
        aria-label="Selecionar fotos da loja"
        className="hidden"
      />
    </div>
  );
};
