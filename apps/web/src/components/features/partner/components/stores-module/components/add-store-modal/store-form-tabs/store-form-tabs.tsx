import {
  PARTNER_FOCUS_CLASS,
  PARTNER_MUTED_TEXT_CLASS,
} from '@/components/features/partner/partner.styles';
import { cn, Spinner, Tabs, TabsList, TabsTrigger } from '@repo/ui';
import { FormProvider } from 'react-hook-form';
import {
  STORES_ERROR_TEXT_CLASS,
  STORES_PRIMARY_BUTTON_CLASS,
  STORES_SECONDARY_BUTTON_CLASS,
} from '../../../stores-module.styles';
import { AddProfessionalModal } from '../../add-professional-modal';
import { BasicInfoTab } from './basic-info-tab';
import { BusinessHoursTab } from './business-hours-tab/business-hours-tab';
import { ContactTab } from './contact-tab';
import { GalleryTab } from './gallery-tab';
import { HolidaysTab } from './holidays-tab';
import { ProfessionalTab } from './professionals-tab/professional-tab';
import { RegionTab } from './region-tab';
import { ScheduleRulesTab } from './schedule-rules-tab';
import { useStoreFormTabs } from './store-form-tabs.hook';

export const StoreFormTabs = () => {
  const {
    form,
    tabs,
    invalidTabsLabel,
    activeTab,
    isEditingStore,
    isLoading,
    handleTabChange,
    handleSubmit,
    handleClose,
  } = useStoreFormTabs();

  return (
    <FormProvider {...form}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden"
        >
          <div className="mt-3.5 shrink-0 px-5 md:px-[30px]">
            <TabsList
              aria-label="Seções da loja"
              className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-[#EBE9F0] bg-transparent p-0"
            >
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  disabled={tab.isDisabled}
                  className={cn(
                    'h-auto min-h-[46px] flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-3.5 text-[13px] font-semibold text-[#5F5C6E] shadow-none data-[state=active]:border-[#0B0B0F] data-[state=active]:bg-transparent data-[state=active]:text-[#0B0B0F] data-[state=active]:shadow-none',
                    PARTNER_FOCUS_CLASS,
                    tab.hasError && 'text-[#A4231A]',
                  )}
                >
                  {tab.label}
                  {tab.hasError ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="size-2 rounded-full bg-[#A4231A]"
                      />
                      <span className="sr-only">(contém erro)</span>
                    </>
                  ) : null}
                </TabsTrigger>
              ))}
            </TabsList>

            {isEditingStore ? null : (
              <p className={cn('mt-2 text-xs', PARTNER_MUTED_TEXT_CLASS)}>
                Agenda, feriados, galeria e equipe ficam disponíveis depois de criar a loja.
              </p>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-[22px] md:px-[30px]">
            {invalidTabsLabel ? (
              <p role="alert" className={cn(STORES_ERROR_TEXT_CLASS, 'mb-5')}>
                Revise os campos com erro em: {invalidTabsLabel}.
              </p>
            ) : null}

            <BasicInfoTab />

            <RegionTab />

            <ContactTab />

            <BusinessHoursTab />

            <ScheduleRulesTab />

            <HolidaysTab />

            <GalleryTab />

            <ProfessionalTab />
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-2.5 border-t border-[#EBE9F0] px-5 py-3.5 sm:flex-row sm:justify-end md:px-[30px]">
            <button
              type="button"
              onClick={handleClose}
              className={STORES_SECONDARY_BUTTON_CLASS}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !form.formState.isDirty}
              className={STORES_PRIMARY_BUTTON_CLASS}
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Salvando...
                </>
              ) : isEditingStore ? (
                'Salvar alterações'
              ) : (
                'Criar loja'
              )}
            </button>
          </div>
        </Tabs>
      </div>

      <AddProfessionalModal />
    </FormProvider>
  );
};
