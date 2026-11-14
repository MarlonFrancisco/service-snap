import { PARTNER_PORTAL_CLASS } from '@/components/features/partner/partner.styles';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  useIsMobile,
} from '@repo/ui';
import type { ReactNode } from 'react';
import { FormProvider } from 'react-hook-form';
import { AppointmentRepeat } from '../../../schedule-series-module/components/appointment-repeat';
import { ScheduleSeriesResult } from '../../../schedule-series-module/components/schedule-series-result';
import { useAddAppointment } from './add-appointment.hook';
import {
  ADD_APPOINTMENT_DIALOG_CLASS,
  ADD_APPOINTMENT_DRAWER_CLASS,
  ADD_APPOINTMENT_ERROR_CLASS,
  ADD_APPOINTMENT_FIELD_CLASS,
  ADD_APPOINTMENT_HINT_CLASS,
  ADD_APPOINTMENT_LABEL_CLASS,
  ADD_APPOINTMENT_SELECT_CLASS,
  ADD_APPOINTMENT_TEXTAREA_CLASS,
  ADD_APPOINTMENT_TITLE_CLASS,
} from './add-appointment.styles';
import { AppointmentCustomerField } from './appointment-customer-field';
import { AppointmentServicesField } from './appointment-services-field';
import { AppointmentSummary } from './appointment-summary';
import { AppointmentTimeField } from './appointment-time-field';

const DESCRIPTION =
  'Escolha o cliente, os serviços, o profissional e o horário.';

export function AddAppointmentResponsive() {
  const isMobile = useIsMobile();
  const {
    form,
    isOpen,
    handleClose,
    handleSubmit,
    isCreatingAppointment,
    submitError,
    customer,
    services,
    professionals,
    schedule,
    summary,
    repeat,
  } = useAddAppointment();

  const renderForm = (title: ReactNode) => (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={handleSubmit}
        aria-label="Novo agendamento"
        className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="flex min-w-0 flex-col gap-[18px]">
          {title}

          <AppointmentCustomerField
            control={form.control}
            mode={customer.mode}
            canUseStoreCustomers={customer.canUseStoreCustomers}
            onModeChange={customer.onModeChange}
            search={customer.search}
            onSearchChange={customer.onSearchChange}
            options={customer.options}
            selectedId={customer.selectedId}
            onSelect={customer.onSelect}
            isSearching={customer.isSearching}
            isSearchError={customer.isSearchError}
            error={customer.error}
          />

          <AppointmentServicesField
            options={services.options}
            onToggle={services.onToggle}
            error={services.error}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid content-start gap-1.5">
              <span
                id="appointment-professional-label"
                className={ADD_APPOINTMENT_LABEL_CLASS}
              >
                Profissional *
              </span>
              <Select
                value={professionals.value}
                onValueChange={professionals.onChange}
                disabled={professionals.options.length === 0}
              >
                <SelectTrigger
                  aria-labelledby="appointment-professional-label"
                  aria-describedby="appointment-professional-hint"
                  aria-invalid={!!professionals.error || undefined}
                  className={ADD_APPOINTMENT_SELECT_CLASS}
                >
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent className={PARTNER_PORTAL_CLASS}>
                  {professionals.options.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span
                id="appointment-professional-hint"
                className={ADD_APPOINTMENT_HINT_CLASS}
              >
                {professionals.hasNoneForServices
                  ? 'Ninguém da equipe faz todos esses serviços juntos.'
                  : 'Só aparece quem faz todos os serviços escolhidos'}
              </span>
              {professionals.error ? (
                <p role="alert" className={ADD_APPOINTMENT_ERROR_CLASS}>
                  {professionals.error}
                </p>
              ) : null}
            </div>

            <label className="grid content-start gap-1.5">
              <span className={ADD_APPOINTMENT_LABEL_CLASS}>
                {repeat.section.isEnabled ? 'Primeira data *' : 'Data *'}
              </span>
              <Input
                type="date"
                value={schedule.date}
                onChange={(event) => schedule.onDateChange(event.target.value)}
                aria-invalid={!!schedule.dateError || undefined}
                className={ADD_APPOINTMENT_FIELD_CLASS}
              />
              {schedule.dateError ? (
                <span role="alert" className={ADD_APPOINTMENT_ERROR_CLASS}>
                  {schedule.dateError}
                </span>
              ) : null}
            </label>
          </div>

          <AppointmentTimeField
            options={schedule.options}
            onSelect={schedule.onSelect}
            isFitIn={schedule.isFitIn}
            onFitInToggle={schedule.onFitInToggle}
            fitInTime={schedule.fitInTime}
            onFitInTimeChange={schedule.onFitInTimeChange}
            canLoad={schedule.canLoad}
            isLoading={schedule.isLoading}
            isError={schedule.isError}
            timeError={schedule.timeError}
            fitInError={schedule.fitInError}
          />

          <AppointmentRepeat {...repeat.section} />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={ADD_APPOINTMENT_LABEL_CLASS}>
                  Observações
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Adicione informações importantes sobre o agendamento..."
                    rows={2}
                    className={ADD_APPOINTMENT_TEXTAREA_CLASS}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <AppointmentSummary
          summary={summary}
          submitError={submitError}
          isSubmitting={isCreatingAppointment}
          submitLabel={repeat.submitLabel}
          onCancel={handleClose}
        />
      </form>
    </FormProvider>
  );

  // Série criada com datas de fora: o resultado fica no lugar do formulário
  const renderBody = (title: ReactNode) =>
    repeat.result ? (
      <ScheduleSeriesResult
        {...repeat.result}
        title={title}
        onPickAnotherTime={repeat.onPickAnotherTime}
        onDone={repeat.onResultDone}
      />
    ) : (
      renderForm(title)
    );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) handleClose();
  };

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerContent className={ADD_APPOINTMENT_DRAWER_CLASS}>
          <div className="overflow-y-auto px-5 pt-2 pb-6">
            {renderBody(
              <div>
                <DrawerTitle className={ADD_APPOINTMENT_TITLE_CLASS}>
                  Novo agendamento
                </DrawerTitle>
                <DrawerDescription className="sr-only">
                  {DESCRIPTION}
                </DrawerDescription>
              </div>,
            )}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={ADD_APPOINTMENT_DIALOG_CLASS}>
        {renderBody(
          <div>
            <DialogTitle className={ADD_APPOINTMENT_TITLE_CLASS}>
              Novo agendamento
            </DialogTitle>
            <DialogDescription className="sr-only">
              {DESCRIPTION}
            </DialogDescription>
          </div>,
        )}
      </DialogContent>
    </Dialog>
  );
}
