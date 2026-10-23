import { formatPriceByCountry } from '@repo/shared/formatters';
import { usePartnerStore } from '@/store';
import { selectTimeSlots } from '@/store/admin/agenda';
import {
  Button,
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
import { useAddAppointment } from './add-appointment.hook';

export function AddAppointmentResponsive() {
  const isMobile = useIsMobile();
  const {
    form,
    professionals,
    services,
    isOpen,
    isCreatingAppointment,
    handleClose,
    handleSubmit,
  } = useAddAppointment();

  const timeSlots = usePartnerStore(selectTimeSlots);

  const content = (
    <FormProvider {...form}>
      <div className={isMobile ? 'space-y-5' : 'space-y-4'}>
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="user.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="service.id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serviço *</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      form.setValue(
                        'service',
                        services.find((service) => service.id === value)!,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - {service.duration}min - R${' '}
                          {formatPriceByCountry(service.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormField
            control={form.control}
            name="storeMember.id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profissional *</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.map((professional) => (
                        <SelectItem
                          key={professional.id}
                          value={professional.id}
                        >
                          {professional.user.firstName}{' '}
                          {professional.user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div
          className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}
        >
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <Input
                  type="date"
                  {...field}
                  className={isMobile ? 'h-11 text-base' : ''}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Adicione informações importantes sobre o agendamento..."
                    rows={3}
                    className={isMobile ? 'text-base min-h-[100px]' : ''}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className={`flex gap-3 pt-4 ${isMobile ? 'gap-3' : 'gap-2'}`}>
          <Button
            variant="outline"
            onClick={handleClose}
            className={`flex-1 ${isMobile ? 'h-11' : ''}`}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isCreatingAppointment}
            className={`flex-1 bg-black hover:bg-gray-800 text-white ${isMobile ? 'h-11' : ''}`}
          >
            {isCreatingAppointment ? (
              <>
                <Spinner />
                Criando Agendamento...
              </>
            ) : (
              'Criar Agendamento'
            )}
          </Button>
        </div>
      </div>
    </FormProvider>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b border-gray-200">
            <DrawerTitle className="text-lg">Novo Agendamento</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 py-6 overflow-y-auto">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
