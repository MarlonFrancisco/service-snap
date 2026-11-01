import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { readFileAsGalleryImage } from './multiple-image-upload.helpers';
import type { TUseMultiImageUploadConfig } from './multiple-image-upload.types';

export const useMultiImageUpload = ({
  images,
  maxImages,
  maxFileSize,
  onChange,
}: TUseMultiImageUploadConfig) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxFileSizeInMb = Math.round(maxFileSize / 1024 / 1024);

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const selectedFiles = Array.from(files);
      const filesInLimit = selectedFiles.slice(0, maxImages - images.length);
      const hasInvalidType = filesInLimit.some(
        (file) => !file.type.startsWith('image/'),
      );
      const hasOversizedFile = filesInLimit.some(
        (file) => file.size > maxFileSize,
      );
      const validFiles = filesInLimit.filter(
        (file) => file.type.startsWith('image/') && file.size <= maxFileSize,
      );

      if (hasInvalidType) {
        setError('Um ou mais arquivos não são imagens válidas');
      } else if (hasOversizedFile) {
        setError(`Arquivo muito grande. Máximo: ${maxFileSizeInMb}MB`);
      } else if (filesInLimit.length < selectedFiles.length) {
        setError(`A galeria aceita até ${maxImages} fotos`);
      } else {
        setError(null);
      }

      if (validFiles.length > 0) {
        void Promise.all(validFiles.map(readFileAsGalleryImage))
          .then(onChange)
          .catch(() => setError('Não foi possível ler um dos arquivos'));
      }
    },
    [images.length, maxFileSize, maxFileSizeInMb, maxImages, onChange],
  );

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      setDragActive(false);
      handleFileSelect(event.dataTransfer.files);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(event.target.files);
      // Sem limpar, escolher o mesmo arquivo de novo não dispara `change`.
      event.target.value = '';
    },
    [handleFileSelect],
  );

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    fileInputRef,
    dragActive,
    error,
    maxFileSizeInMb,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleInputChange,
    openFileDialog,
  };
};
