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
  useIsMobile,
} from '@repo/ui';
import { Check } from 'lucide-react';
import {
  AGENDA_DIALOG_CLASS,
  AGENDA_DRAWER_CLASS,
  AGENDA_MODAL_BUTTON_CLASS,
  AGENDA_MODAL_DANGER_BUTTON_CLASS,
  AGENDA_MODAL_TITLE_CLASS,
} from '../../agenda-module.styles';
import { AnamnesisLinkCard } from '../../../anamnesis-module/components/anamnesis-link-card';
import { CheckoutForm, CheckoutStatus } from '../../../checkout-module';
import { ScheduleSeriesCancel } from '../../../schedule-series-module/components/schedule-series-cancel';
import { useAppointmentDetails } from './appointment-details.hook';

const DETAIL_ROW_CLASS =
  'flex justify-between gap-5 border-b border-[#F0EEF4] py-[11px] text-sm';
const DETAIL_TERM_CLASS = 'text-[#5F5C6E]';
const DETAIL_VALUE_CLASS = 'min-w-0 text-right font-semibold break-words';
const DETAIL_BADGE_CLASS = 'rounded-full px-[11px] py-[5px] text-xs font-bold';
const PRESENCE_NOTE_CLASS =
  'flex gap-3 rounded-2xl px-4 py-3.5 text-sm leading-[1.45]';

export function AppointmentDetailsResponsive() {
  const isMobile = useIsMobile();
  const {
    detailsAppointment,
    isOpen,
    statusBadge,
    isPresenceConfirmed,
    isPresenceAwaiting,
    presenceText,
    duration,
    formattedDate,
    isUpdatingStatus,
    isConfirmingCancel,
    cancelTriggerRef,
    visitItems,
    totalPrice,
    handleClose,
    handleStatusChange,
    handleOpenReschedule,
    handleRequestCancel,
    handleDismissCancel,
    isCheckingOut,
    handleOpenCheckout,
    handleCloseCheckout,
    handleCheckoutDone,
    seriesId,
  } = useAppointmentDetails();

  const { user, storeMember, notes, status, id } = detailsAppointment;
  const isVisit = visitItems.length > 1;
  const title = isCheckingOut
    ? 'Fechar atendimento'
    : 'Detalhes do agendamento';

  const content = isCheckingOut ? (
    <CheckoutForm
      appointment={detailsAppointment}
      items={visitItems}
      onCancel={handleCloseCheckout}
      onDone={handleCheckoutDone}
    />
  ) : (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap gap-2">
        <span className={cn(DETAIL_BADGE_CLASS, statusBadge.className)}>
          {statusBadge.label}
        </span>
        {isPresenceConfirmed ? (
          <span
            className={cn(DETAIL_BADGE_CLASS, 'bg-[#F2FAF5] text-[#0A5536]')}
          >
            Confirmado
          </span>
        ) : null}
      </div>

      {isPresenceConfirmed ? (
        <div className={cn(PRESENCE_NOTE_CLASS, 'bg-[#F2FAF5] text-[#0A5536]')}>
          <Check
            aria-hidden="true"
            className="size-5 shrink-0"
            strokeWidth={2.2}
          />
          <p>
            <b className="block">Presença confirmada pelo WhatsApp</b>
            {presenceText}
          </p>
        </div>
      ) : null}

      {isPresenceAwaiting ? (
        <div className={cn(PRESENCE_NOTE_CLASS, 'bg-[#F7F6FA] text-[#5F5C6E]')}>
          <p>
            <b className="block text-[#0B0B0F]">
              Lembrete enviado, sem resposta
            </b>
            {presenceText}
          </p>
        </div>
      ) : null}

      <dl>
        <div className={DETAIL_ROW_CLASS}>
          <dt className={DETAIL_TERM_CLASS}>Cliente</dt>
          <dd className={DETAIL_VALUE_CLASS}>
            {[user.firstName, user.lastName].filter(Boolean).join(' ') ||
              'Não informado'}
          </dd>
        </div>
        {user.email ? (
          <div className={DETAIL_ROW_CLASS}>
            <dt className={DETAIL_TERM_CLASS}>E-mail</dt>
            <dd className={DETAIL_VALUE_CLASS}>{user.email}</dd>
          </div>
        ) : null}
        {user.telephone ? (
          <div className={DETAIL_ROW_CLASS}>
            <dt className={DETAIL_TERM_CLASS}>Telefone</dt>
            <dd className={DETAIL_VALUE_CLASS}>{user.telephone}</dd>
          </div>
        ) : null}
        <div className={DETAIL_ROW_CLASS}>
          <dt className={DETAIL_TERM_CLASS}>
            {isVisit ? `${visitItems.length} serviços` : 'Serviço'}
          </dt>
          <dd className={DETAIL_VALUE_CLASS}>
            {visitItems.map((item) => (
              <span key={item.id} className="block">
                {item.service.name}
                {isVisit ? ` · ${item.startTime}` : ''}
              </span>
            ))}
          </dd>
        </div>
        <div className={DETAIL_ROW_CLASS}>
          <dt className={DETAIL_TERM_CLASS}>Profissional</dt>
          <dd className={DETAIL_VALUE_CLASS}>
            {storeMember.user.firstName} {storeMember.user.lastName}
          </dd>
        </div>
        <div className={DETAIL_ROW_CLASS}>
          <dt className={DETAIL_TERM_CLASS}>Data</dt>
          <dd className={DETAIL_VALUE_CLASS}>{formattedDate}</dd>
        </div>
        <div className={DETAIL_ROW_CLASS}>
          <dt className={DETAIL_TERM_CLASS}>Horário</dt>
          <dd className={DETAIL_VALUE_CLASS}>
            {detailsAppointment.startTime} - {detailsAppointment.endTime} ·{' '}
            {duration}
          </dd>
        </div>
        <div className={DETAIL_ROW_CLASS}>
          <dt className={DETAIL_TERM_CLASS}>Preço</dt>
          <dd className={DETAIL_VALUE_CLASS}>
            {formatPriceByCountry(totalPrice)}
          </dd>
        </div>
        {notes ? (
          <div className={DETAIL_ROW_CLASS}>
            <dt className={DETAIL_TERM_CLASS}>Observações</dt>
            <dd className={DETAIL_VALUE_CLASS}>{notes}</dd>
          </div>
        ) : null}
      </dl>

      <CheckoutStatus
        appointment={detailsAppointment}
        items={visitItems}
        onOpenCheckout={handleOpenCheckout}
      />

      {status === 'scheduled' ? (
        <AnamnesisLinkCard appointment={detailsAppointment} />
      ) : null}

      {status === 'scheduled' ? (
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() => handleStatusChange(id, 'completed')}
            disabled={isUpdatingStatus}
            className={AGENDA_MODAL_BUTTON_CLASS}
          >
            Marcar como concluído
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange(id, 'no-show')}
            disabled={isUpdatingStatus}
            className={AGENDA_MODAL_BUTTON_CLASS}
          >
            Cliente não compareceu
          </button>
        </div>
      ) : null}

      {status === 'scheduled' && !isConfirmingCancel ? (
        <button
          type="button"
          onClick={handleOpenReschedule}
          disabled={isUpdatingStatus}
          className={cn(AGENDA_MODAL_BUTTON_CLASS, 'flex-none')}
        >
          Remarcar
        </button>
      ) : null}

      {status !== 'cancelled' && !isConfirmingCancel ? (
        <button
          ref={cancelTriggerRef}
          type="button"
          onClick={handleRequestCancel}
          disabled={isUpdatingStatus}
          className={cn(
            AGENDA_MODAL_BUTTON_CLASS,
            AGENDA_MODAL_DANGER_BUTTON_CLASS,
            'flex-none',
          )}
        >
          Cancelar agendamento
        </button>
      ) : null}

      {status !== 'cancelled' && isConfirmingCancel && seriesId ? (
        <ScheduleSeriesCancel
          scheduleId={id}
          seriesId={seriesId}
          onBack={handleDismissCancel}
          onDone={handleClose}
        />
      ) : null}

      {status !== 'cancelled' && isConfirmingCancel && !seriesId ? (
        <div
          role="alertdialog"
          aria-label="Confirmar cancelamento"
          className="rounded-[14px] bg-[#F7F6FA] px-4 py-3.5 text-sm leading-normal"
        >
          <b className="block">Cancelar este agendamento?</b>O cliente deixa de
          ter este horário reservado.
          <div className="mt-2.5 flex gap-2.5">
            <button
              type="button"
              autoFocus
              onClick={handleDismissCancel}
              disabled={isUpdatingStatus}
              className={AGENDA_MODAL_BUTTON_CLASS}
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange(id, 'cancelled')}
              disabled={isUpdatingStatus}
              className={cn(
                AGENDA_MODAL_BUTTON_CLASS,
                AGENDA_MODAL_DANGER_BUTTON_CLASS,
              )}
            >
              Cancelar agendamento
            </button>
          </div>
        </div>
      ) : null}

      {isPresenceConfirmed ? (
        <p className="text-[13px] leading-normal text-[#5F5C6E]">
          Remarcar apaga a confirmação: o cliente confirma de novo no lembrete
          do horário novo.
        </p>
      ) : null}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleClose}>
        <DrawerContent className={AGENDA_DRAWER_CLASS}>
          <DrawerHeader className="border-b border-[#EBE9F0]">
            <DrawerTitle className={AGENDA_MODAL_TITLE_CLASS}>
              {title}
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
            {title}
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
