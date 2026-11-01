import {
  PARTNER_MUTED_TEXT_CLASS,
  PARTNER_PORTAL_CLASS,
} from '@/components/features/partner/partner.styles';
import {
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@repo/ui';
import {
  STORES_DIALOG_CLOSE_CLASS,
  STORES_DRAWER_CLASS,
} from '../../stores-module.styles';
import { useAddStoreModal } from './add-store-modal.hook';
import { StoreFormTabs } from './store-form-tabs';

const DESCRIPTION_CLASS = cn('text-sm', PARTNER_MUTED_TEXT_CLASS);

export const AddStoreModal = () => {
  const { isMobile, isOpen, title, description, handleOpenChange } =
    useAddStoreModal();

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerContent
          className={cn(
            PARTNER_PORTAL_CLASS,
            STORES_DRAWER_CLASS,
            'data-[vaul-drawer-direction=bottom]:h-[95dvh]',
          )}
        >
          <DrawerHeader className="gap-0.5 px-5 pb-0 text-left">
            <DrawerTitle className="text-[22px] font-extrabold tracking-[-0.025em]">
              {title}
            </DrawerTitle>
            <DrawerDescription className={DESCRIPTION_CLASS}>
              {description}
            </DrawerDescription>
          </DrawerHeader>

          <StoreFormTabs />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          PARTNER_PORTAL_CLASS,
          STORES_DIALOG_CLOSE_CLASS,
          'flex h-[min(780px,92dvh)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-[28px] border-0 bg-white p-0 shadow-[0_20px_60px_rgba(15,12,30,0.18)] sm:max-w-[920px]',
        )}
      >
        <DialogHeader className="gap-0.5 px-[30px] pt-[26px] text-left">
          <DialogTitle className="pr-12 text-2xl font-extrabold tracking-[-0.025em]">
            {title}
          </DialogTitle>
          <DialogDescription className={DESCRIPTION_CLASS}>
            {description}
          </DialogDescription>
        </DialogHeader>

        <StoreFormTabs />
      </DialogContent>
    </Dialog>
  );
};
