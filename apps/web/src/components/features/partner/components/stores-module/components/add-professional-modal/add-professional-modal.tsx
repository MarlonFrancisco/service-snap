import {
  PARTNER_FOCUS_CLASS,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui';
import { FormProvider } from 'react-hook-form';
import {
  STORES_COMPACT_BUTTON_CLASS,
  STORES_COMPACT_PRIMARY_BUTTON_CLASS,
  STORES_DIALOG_CLOSE_CLASS,
  STORES_DRAWER_CLASS,
} from '../../stores-module.styles';
import { useAddProfessionalModal } from './add-professional-modal.hook';
import {
  ProfessionalFormFields,
  ProfessionalIdentityFields,
  ProfessionalRoleField,
  ProfessionalServicesField,
} from './professional-form-fields';
import { ProfessionalHoursFields } from './professional-hours-fields';

const TITLE_CLASS = 'text-[22px] font-extrabold tracking-[-0.025em]';
const DESCRIPTION_CLASS = cn('text-sm', PARTNER_MUTED_TEXT_CLASS);
const TAB_TRIGGER_CLASS = cn(
  'h-auto min-h-[46px] flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-3.5 text-[13px] font-semibold text-[#5F5C6E] shadow-none data-[state=active]:border-[#0B0B0F] data-[state=active]:bg-transparent data-[state=active]:text-[#0B0B0F] data-[state=active]:shadow-none',
  PARTNER_FOCUS_CLASS,
);

export const AddProfessionalModal = () => {
  const {
    form,
    isAddProfessional,
    isEditing,
    isMobile,
    services,
    selectedServices,
    canGrantOwner,
    tabs,
    activeTab,
    isLoading,
    title,
    description,
    submitLabel,
    addService,
    removeService,
    handleSubmit,
    handleOpenChange,
    handleTabChange,
    handleClose,
  } = useAddProfessionalModal();

  const servicesConfig = {
    services,
    selectedServices,
    addService,
    removeService,
  };

  // Editar separa dados, serviços e horário em abas, como no desenho.
  const fields = (
    <FormProvider {...form}>
      {isEditing ? (
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="gap-4"
        >
          <TabsList
            aria-label="Seções do profissional"
            className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-[#EBE9F0] bg-transparent p-0"
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={TAB_TRIGGER_CLASS}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="data" className="mt-0 grid gap-3.5">
            <ProfessionalIdentityFields isEditing />
            <ProfessionalRoleField canGrantOwner={canGrantOwner} />
          </TabsContent>
          <TabsContent value="services" className="mt-0 grid gap-3.5">
            <ProfessionalServicesField {...servicesConfig} />
          </TabsContent>
          <TabsContent value="hours" className="mt-0">
            <ProfessionalHoursFields />
          </TabsContent>
        </Tabs>
      ) : (
        <ProfessionalFormFields
          isEditing={false}
          canGrantOwner={canGrantOwner}
          {...servicesConfig}
        />
      )}
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
          'flex max-h-[90dvh] w-full flex-col gap-3.5 overflow-hidden rounded-[28px] border-0 bg-white p-7 shadow-[0_20px_60px_rgba(15,12,30,0.18)]',
          isEditing ? 'sm:max-w-[780px]' : 'sm:max-w-[480px]',
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
