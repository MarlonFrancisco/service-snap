import { PARTNER_MUTED_TEXT_CLASS } from '@/components/features/partner/partner.styles';
import { cn, TabsContent } from '@repo/ui';
import { STORES_TAB_PANEL_CLASS } from '../../../../stores-module.styles';
import { MultiImageUpload } from '../../../multiple-image-upload/multiple-image-upload';
import { useGalleryTab } from './gallery-tab.hook';

export const GalleryTab = () => {
  const { gallery, onGalleryChange, onChangeMainImage, onDeleteImage } =
    useGalleryTab();

  return (
    <TabsContent value="gallery" className={cn(STORES_TAB_PANEL_CLASS, 'gap-4')}>
      <div>
        <h3 className="text-lg font-extrabold">Galeria de fotos</h3>
        <p className={cn('mt-0.5 text-sm', PARTNER_MUTED_TEXT_CLASS)}>
          Adicione até 10 fotos da sua loja para atrair mais clientes.
        </p>
      </div>

      <MultiImageUpload
        images={gallery}
        maxImages={10}
        onChange={onGalleryChange}
        onChangeMain={onChangeMainImage}
        onDelete={onDeleteImage}
      />
    </TabsContent>
  );
};
