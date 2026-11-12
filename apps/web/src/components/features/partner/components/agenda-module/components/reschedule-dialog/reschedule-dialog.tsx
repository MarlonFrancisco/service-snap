import { PARTNER_PORTAL_CLASS } from '@/components/features/partner/partner.styles';
import {
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
import { useRescheduleDialog } from './reschedule-dialog.hook';

const TIME_CHIP_CLASS =
  'min-h-11 rounded-full border border-[#E3E1EA] bg-white px-2 text-[13px] font-semibold transition-colors hover:bg-[#F7F6FA] disabled:cursor-not-allowed disabled:border-[#F0EEF4] disabled:bg-[#F7F6FA] disabled:text-[#A19FAD] disabled:line-through';

export const RescheduleDialog = () => {
  const {
    isOpen,
    summary,
    date,
    memberId,
    professionals,
    timeOptions,
    isLoadingSlots,
    isSlotsError,
    pickedTime,
    isFitIn,
    fitInTime,
    canSubmit,
    isSubmitting,
    setPickedTime,
    setFitInTime,
    handleDateChange,
    handleMemberChange,
    handleToggleFitIn,
    handleClose,
    handleSubmit,
  } = useRescheduleDialog();

  const FitInIcon = isFitIn ? ChevronUp : ChevronDown;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className={AGENDA_DIALOG_CLASS}>
        <DialogHeader>
          <DialogTitle className={AGENDA_MODAL_TITLE_CLASS}>
            Remarcar agendamento
          </DialogTitle>
          <DialogDescription className="sr-only">
            Escolha a nova data, o profissional e o horário da visita.
          </DialogDescription>
        </DialogHeader>

        {summary && (
          <form
            noValidate
            onSubmit={handleSubmit}
            aria-label="Remarcar agendamento"
            className="flex flex-col gap-3.5"
          >
            <div className="rounded-[18px] bg-[#F7F6FA] px-4 py-3.5 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <b className="text-[15px]">{summary.clientName}</b>
                {summary.serviceCount > 1 && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-extrabold">
                    {summary.serviceCount} serviços
                  </span>
                )}
              </div>
              <p className="mt-1 text-[#5F5C6E]">{summary.services}</p>
              <p className="mt-1 text-[#5F5C6E]">
                Duração total{' '}
                <strong className="text-[#0B0B0F]">{summary.duration}</strong>{' '}
                · hoje em {summary.current} com {summary.professionalName}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label
                  htmlFor="reschedule-date"
                  className={AGENDA_FIELD_LABEL_CLASS}
                >
                  Data *
                </Label>
                <Input
                  id="reschedule-date"
                  type="date"
                  required
                  value={date}
                  onChange={(event) => handleDateChange(event.target.value)}
                  className={AGENDA_FIELD_CLASS}
                />
              </div>

              <div className="grid content-start gap-2">
                <Label
                  htmlFor="reschedule-member"
                  className={AGENDA_FIELD_LABEL_CLASS}
                >
                  Profissional *
                </Label>
                <Select value={memberId} onValueChange={handleMemberChange}>
                  <SelectTrigger
                    id="reschedule-member"
                    className={AGENDA_SELECT_FIELD_CLASS}
                  >
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className={PARTNER_PORTAL_CLASS}>
                    {professionals.map((professional) => (
                      <SelectItem key={professional.id} value={professional.id}>
                        {getProfessionalFullName(professional)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <small className="text-xs text-[#5F5C6E]">
                  Só aparece quem faz todos os serviços da visita
                </small>
              </div>
            </div>

            <fieldset className="grid gap-2" disabled={isFitIn}>
              <legend className={cn(AGENDA_FIELD_LABEL_CLASS, 'mb-2')}>
                Horários disponíveis
              </legend>
              {isLoadingSlots && (
                <p role="status" className="text-sm text-[#5F5C6E]">
                  Carregando horários…
                </p>
              )}
              {isSlotsError && (
                <p role="alert" className="text-sm text-[#A4231A]">
                  Não foi possível carregar os horários.
                </p>
              )}
              {!isLoadingSlots && !isSlotsError && timeOptions.length === 0 && (
                <p className="text-sm text-[#5F5C6E]">
                  Nenhum horário livre neste dia. Tente outra data ou encaixe.
                </p>
              )}
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {timeOptions.map((option) => {
                  const isPicked = !isFitIn && option.time === pickedTime;

                  return (
                    <button
                      key={option.time}
                      type="button"
                      aria-pressed={isPicked}
                      disabled={!option.isAvailable}
                      onClick={() => setPickedTime(option.time)}
                      className={cn(
                        TIME_CHIP_CLASS,
                        isPicked &&
                          'border-[#0B0B0F] bg-[#0B0B0F] text-white hover:bg-[#2B2B2B]',
                      )}
                    >
                      {option.time}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <button
              type="button"
              aria-expanded={isFitIn}
              aria-controls="reschedule-fit-in"
              onClick={handleToggleFitIn}
              className="flex min-h-11 items-center gap-2 self-start text-sm font-bold text-[#9810FA]"
            >
              <FitInIcon className="size-4" aria-hidden="true" />
              Encaixar em outro horário
            </button>

            {isFitIn && (
              <div id="reschedule-fit-in" className="grid gap-2">
                <Label
                  htmlFor="reschedule-fit-in-time"
                  className={AGENDA_FIELD_LABEL_CLASS}
                >
                  Horário do encaixe
                </Label>
                <Input
                  id="reschedule-fit-in-time"
                  type="time"
                  value={fitInTime}
                  onChange={(event) => setFitInTime(event.target.value)}
                  className={AGENDA_FIELD_CLASS}
                />
                <small className="text-xs text-[#5F5C6E]">
                  Fora dos horários oferecidos ao cliente
                </small>
              </div>
            )}

            <p className="text-sm text-[#5F5C6E]">
              Avisamos o cliente por e-mail.
            </p>

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
                disabled={!canSubmit || isSubmitting}
                className={cn(
                  AGENDA_MODAL_BUTTON_CLASS,
                  AGENDA_MODAL_PRIMARY_BUTTON_CLASS,
                )}
              >
                Remarcar
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
