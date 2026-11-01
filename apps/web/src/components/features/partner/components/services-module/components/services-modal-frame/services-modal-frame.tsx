import {
  cn,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  useIsMobile,
} from '@repo/ui';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  PARTNER_ICON_BUTTON_CLASS,
  PARTNER_MUTED_TEXT_CLASS,
  PARTNER_PORTAL_CLASS,
} from '../../../../partner.styles';

type TServicesModalFrameConfig = {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

const HEADER_CLASS =
  'relative shrink-0 py-3.5 pr-16 pl-5 sm:pt-7 sm:pl-7';
const TITLE_CLASS = 'text-2xl leading-tight font-extrabold tracking-[-0.025em]';
const DESCRIPTION_CLASS = cn('mt-0.5 text-sm', PARTNER_MUTED_TEXT_CLASS);
const CLOSE_CLASS = cn(PARTNER_ICON_BUTTON_CLASS, 'absolute top-3 right-3');

export const ServicesModalFrame = ({
  isOpen,
  title,
  description,
  onClose,
  children,
}: TServicesModalFrameConfig) => {
  const isMobile = useIsMobile();

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerContent
          {...(description ? {} : { 'aria-describedby': undefined })}
          className={cn(
            PARTNER_PORTAL_CLASS,
            'bg-white data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-[95dvh] data-[vaul-drawer-direction=bottom]:rounded-t-[28px] data-[vaul-drawer-direction=bottom]:border-t-0',
          )}
        >
          <div className={HEADER_CLASS}>
            <DrawerTitle className={TITLE_CLASS}>{title}</DrawerTitle>
            {description && (
              <DrawerDescription className={DESCRIPTION_CLASS}>
                {description}
              </DrawerDescription>
            )}
            <DrawerClose aria-label="Fechar" className={CLOSE_CLASS}>
              <X className="size-[18px]" aria-hidden="true" />
            </DrawerClose>
          </div>
          {children}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        {...(description ? {} : { 'aria-describedby': undefined })}
        className={cn(
          PARTNER_PORTAL_CLASS,
          // O DialogContent de @repo/ui traz um fechar próprio, sem o alvo de 44px nem rótulo em português.
          'flex max-h-[90dvh] flex-col gap-0 overflow-hidden rounded-[28px] border-0 bg-white p-0 sm:max-w-[560px] [&>button:last-child]:hidden',
        )}
      >
        <div className={HEADER_CLASS}>
          <DialogTitle className={TITLE_CLASS}>{title}</DialogTitle>
          {description && (
            <DialogDescription className={DESCRIPTION_CLASS}>
              {description}
            </DialogDescription>
          )}
          <DialogClose aria-label="Fechar" className={CLOSE_CLASS}>
            <X className="size-[18px]" aria-hidden="true" />
          </DialogClose>
        </div>
        {children}
      </DialogContent>
    </Dialog>
  );
};
