import { PARTNER_PORTAL_CLASS } from '@/components/features/partner/partner.styles';
import { formatPriceByCountry } from '@repo/shared/formatters';
import {
  cn,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Drawer,
  DrawerContent,
  DrawerHeader,
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
  Spinner,
  Textarea,
  useIsMobile,
} from '@repo/ui';
import { FormProvider } from 'react-hook-form';
import {
  AGENDA_DIALOG_CLASS,
  AGENDA_DRAWER_CLASS,
  AGENDA_FIELD_CLASS,
  AGENDA_FIELD_LABEL_CLASS,
  AGENDA_MODAL_BUTTON_CLASS,
  AGENDA_MODAL_PRIMARY_BUTTON_CLASS,
  AGENDA_MODAL_TITLE_CLASS,
  AGENDA_SELECT_FIELD_CLASS,
  AGENDA_TEXTAREA_CLASS,
} from '../../agenda-module.styles';
import { useAddAppointment } from './add-appointment.hook';

export function AddAppointmentResponsive() {
  const isMobile = useIsMobile();
  const {
    form,
    professionals,
    services,
    timeSlots,
    isOpen,
    isCreatingAppointment,
    handleClose,
    handleSubmit,
    handleServiceChange,
  } = useAddAppointment();

  const content = (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={handleSubmit}
        aria-label="Novo agendamento"
        className="flex flex-col gap-3.5"
      >
        <FormField
          control={form.control}
          name="user.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={AGENDA_FIELD_LABEL_CLASS}>
                E-mail do cliente *
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  className={AGENDA_FIELD_CLASS}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="service.id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={AGENDA_FIELD_LABEL_CLASS}>
                Serviço *
              </FormLabel>
              <Select value={field.value} onValueChange={handleServiceChange}>
                <FormControl>
                  <SelectTrigger className={AGENDA_SELECT_FIELD_CLASS}>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className={PARTNER_PORTAL_CLASS}>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - {service.duration}min -{' '}
                      {formatPriceByCountry(service.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="storeMember.id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={AGENDA_FIELD_LABEL_CLASS}>
                Profissional *
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className={AGENDA_SELECT_FIELD_CLASS}>
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className={PARTNER_PORTAL_CLASS}>
                  {professionals.map((professional) => (
                    <SelectItem key={professional.id} value={professional.id}>
                      {professional.user.firstName} {professional.user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={AGENDA_FIELD_LABEL_CLASS}>
                  Data *
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className={AGENDA_FIELD_CLASS}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={AGENDA_FIELD_LABEL_CLASS}>
                  Horário *
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className={AGENDA_SELECT_FIELD_CLASS}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className={PARTNER_PORTAL_CLASS}>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={AGENDA_FIELD_LABEL_CLASS}>
                Observações
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Adicione informações importantes sobre o agendamento..."
                  rows={3}
                  className={AGENDA_TEXTAREA_CLASS}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-1 flex gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            className={AGENDA_MODAL_BUTTON_CLASS}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isCreatingAppointment}
            className={cn(
              AGENDA_MODAL_BUTTON_CLASS,
              AGENDA_MODAL_PRIMARY_BUTTON_CLASS,
            )}
          >
            {isCreatingAppointment ? (
              <>
                <Spinner />
                Criando agendamento...
              </>
            ) : (
              'Criar agendamento'
            )}
          </button>
        </div>
      </form>
    </FormProvider>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleClose}>
        <DrawerContent className={AGENDA_DRAWER_CLASS}>
          <DrawerHeader className="border-b border-[#EBE9F0]">
            <DrawerTitle className={AGENDA_MODAL_TITLE_CLASS}>
              Novo agendamento
            </DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-5 py-5">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={AGENDA_DIALOG_CLASS}>
        <DialogHeader>
          <DialogTitle className={AGENDA_MODAL_TITLE_CLASS}>
            Novo agendamento
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
