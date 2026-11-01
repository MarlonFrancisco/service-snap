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
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Spinner,
} from '@repo/ui';
import { FormProvider } from 'react-hook-form';
import {
  STORES_COMPACT_BUTTON_CLASS,
  STORES_COMPACT_PRIMARY_BUTTON_CLASS,
  STORES_DIALOG_CLOSE_CLASS,
  STORES_DRAWER_CLASS,
} from '../../stores-module.styles';
import { useAddProfessionalModal } from './add-professional-modal.hook';
import { ProfessionalFormFields } from './professional-form-fields';

const TITLE_CLASS = 'text-[22px] font-extrabold tracking-[-0.025em]';
const DESCRIPTION_CLASS = cn('text-sm', PARTNER_MUTED_TEXT_CLASS);

export const AddProfessionalModal = () => {
  const {
    form,
    isAddProfessional,
    isEditing,
    isMobile,
    services,
    selectedServices,
    isLoading,
    title,
    description,
    submitLabel,
    addService,
    removeService,
    handleSubmit,
    handleOpenChange,
    handleClose,
  } = useAddProfessionalModal();

  const fields = (
    <FormProvider {...form}>
      <ProfessionalFormFields
        isEditing={isEditing}
        services={services}
        selectedServices={selectedServices}
        addService={addService}
        removeService={removeService}
      />
    </FormProvider>
  );

  const actions = (
    <>
      <button
        type="button"
        onClick={handleClose}
        className={cn(STORES_COMPACT_BUTTON_CLASS, 'flex-1 font-bold')}
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!form.formState.isDirty || isLoading}
        className={cn(STORES_COMPACT_PRIMARY_BUTTON_CLASS, 'flex-1')}
      >
        {isLoading ? (
          <>
            <Spinner />
            Salvando...
          </>
        ) : (
          submitLabel
        )}
      </button>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={isAddProfessional} onOpenChange={handleOpenChange}>
        <DrawerContent className={cn(PARTNER_PORTAL_CLASS, STORES_DRAWER_CLASS)}>
          <DrawerHeader className="gap-0.5 px-5 text-left">
            <DrawerTitle className={TITLE_CLASS}>{title}</DrawerTitle>
            <DrawerDescription className={DESCRIPTION_CLASS}>
              {description}
            </DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2">{fields}</div>

          <DrawerFooter className="flex-row gap-2 border-t border-[#EBE9F0] px-5">
            {actions}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isAddProfessional} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          PARTNER_PORTAL_CLASS,
          STORES_DIALOG_CLOSE_CLASS,
          'flex max-h-[90dvh] w-full flex-col gap-3.5 overflow-hidden rounded-[28px] border-0 bg-white p-7 shadow-[0_20px_60px_rgba(15,12,30,0.18)] sm:max-w-[480px]',
        )}
      >
        <DialogHeader className="gap-0.5 pr-10 text-left">
          <DialogTitle className={TITLE_CLASS}>{title}</DialogTitle>
          <DialogDescription className={DESCRIPTION_CLASS}>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">{fields}</div>

        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      </DialogContent>
    </Dialog>
  );
};
