import type { IStoreGallery } from '@/types/api/stores.types';

export const readFileAsGalleryImage = (file: File): Promise<IStoreGallery> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = (event) => {
      resolve({
        id: Math.random().toString(36).substring(2, 15),
        url: event.target?.result as string,
        isMain: false,
      });
    };
    fileReader.onerror = reject;

    fileReader.readAsDataURL(file);
  });
