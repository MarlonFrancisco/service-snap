import { PARTNER_PORTAL_CLASS } from '@/components/features/partner/partner.styles';
import {
  Checkbox,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  Switch,
} from '@repo/ui';
import { FormProvider } from 'react-hook-form';
import {
  AGENDA_DIALOG_CLASS,
  AGENDA_FIELD_CLASS,
  AGENDA_FIELD_LABEL_CLASS,
  AGENDA_MODAL_BUTTON_CLASS,
  AGENDA_MODAL_PRIMARY_BUTTON_CLASS,
  AGENDA_MODAL_TITLE_CLASS,
  AGENDA_SELECT_FIELD_CLASS,
} from '../../agenda-module.styles';
import { getProfessionalFullName } from '../agenda-grid/agenda-grid.helpers';
import { useBlockTimeDialog } from './block-time-dialog.hook';

export const BlockTimeDialog = () => {
  const {
    form,
    isOpen,
    isFullDay,
    professionals,
    isProfessionalLocked,
    isSubmitting,
    handleClose,
    handleSubmit,
  } = useBlockTimeDialog();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className={AGENDA_DIALOG_CLASS}>
        <DialogHeader>
          <DialogTitle className={AGENDA_MODAL_TITLE_CLASS}>
            Bloquear horário
          </DialogTitle>
          <DialogDescription className="text-left text-sm text-[#5F5C6E]">
            O horário bloqueado some da agenda online.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            noValidate
            onSubmit={handleSubmit}
            aria-label="Bloquear horário"
            className="flex flex-col gap-3.5"
          >
            <FormField
              control={form.control}
              name="storeMemberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={AGENDA_FIELD_LABEL_CLASS}>
                    Profissional *
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isProfessionalLocked}
                  >
                    <FormControl>
                      <SelectTrigger className={AGENDA_SELECT_FIELD_CLASS}>
                        <SelectValue placeholder="Selecione o profissional" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className={PARTNER_PORTAL_CLASS}>
                      {professionals.map((professional) => (
                        <SelectItem
                          key={professional.id}
                          value={professional.id}
                        >
                          {getProfessionalFullName(professional)}
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
                name="from"
                render={({ field }) => (
                  <FormItem className="content-start">
                    <FormLabel className={AGENDA_FIELD_LABEL_CLASS}>
                      De *
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
                name="to"
                render={({ field }) => (
                  <FormItem className="content-start">
                    <FormLabel className={AGENDA_FIELD_LABEL_CLASS}>
                      Até
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className={AGENDA_FIELD_CLASS}
                        {...field}
                      />
                    </FormControl>
                    <small className="text-xs text-[#5F5C6E]">
                      Para férias, escolha o último dia
                    </small>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isFullDay"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 rounded-[14px] bg-[#F7F6FA] px-4 py-3">
                  <span id="block-full-day-label" className="grid text-sm">
                    <b>Dia inteiro</b>
                    <small className="text-xs text-[#5F5C6E]">
                      Para folgas e férias
                    </small>
                  </span>
                  <FormControl>
                    <Switch
                      aria-labelledby="block-full-day-label"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="content-start">
                    <FormLabel className={AGENDA_FIELD_LABEL_CLASS}>
                      Início *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        disabled={isFullDay}
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
                name="endTime"
                render={({ field }) => (
                  <FormItem className="content-start">
                    <FormLabel className={AGENDA_FIELD_LABEL_CLASS}>
                      Fim *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        disabled={isFullDay}
                        className={AGENDA_FIELD_CLASS}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      className="mt-0.5 size-5"
                    />
                  </FormControl>
                  <FormLabel className="grid gap-0.5 text-sm font-semibold">
                    Repetir toda semana
                    <small className="text-xs font-normal text-[#5F5C6E]">
                      No mesmo dia e horário
                    </small>
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={AGENDA_FIELD_LABEL_CLASS}>
                    Motivo
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Opcional. Ex.: almoço, curso"
                      className={AGENDA_FIELD_CLASS}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={handleClose}
                className={AGENDA_MODAL_BUTTON_CLASS}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  AGENDA_MODAL_BUTTON_CLASS,
                  AGENDA_MODAL_PRIMARY_BUTTON_CLASS,
                )}
              >
                Bloquear
              </button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
