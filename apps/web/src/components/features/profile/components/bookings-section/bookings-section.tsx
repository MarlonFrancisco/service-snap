'use client';

import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  cn,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Separator,
} from '@repo/ui';
import { Calendar, CalendarDays, Clock, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import {
  PROFILE_ACTION_CLASS,
  PROFILE_ACTION_PRIMARY_CLASS,
  PROFILE_ACTIONS_CLASS,
  PROFILE_CARDS_GRID_CLASS,
  PROFILE_DIALOG_CLASS,
  PROFILE_DIALOG_CONFIRM_CLASS,
  PROFILE_DIALOG_DISMISS_CLASS,
  PROFILE_SECTION_LEAD_CLASS,
  PROFILE_SECTION_TITLE_CLASS,
} from '../../profile.styles';
import { ProfileEmptyState } from '../profile-empty-state';
import { useBookingsSection } from './bookings-section.hook';
import {
  formatBookingDateFull,
  formatBookingDateLong,
  formatBookingDateShort,
  formatBookingPrice,
  formatPastBookingDateLong,
  formatPastBookingDateShort,
  getProfessionalName,
} from './utils/bookings-section.helpers';

const DETAIL_LABEL_CLASS = 'text-xs text-[#5F5C6E]';
const DETAIL_VALUE_CLASS = 'mt-px font-semibold [overflow-wrap:anywhere]';
const MODAL_ICON_CLASS = 'mt-0.5 size-4 shrink-0 text-[#5F5C6E]';

export const BookingsSection = () => {
  const {
    upcomingBookings,
    pastBookings,
    selectedBooking,
    bookingToCancel,
    setSelectedBooking,
    setBookingToCancel,
    handleCancelBooking,
    handleReview,
  } = useBookingsSection();

  if (upcomingBookings.length === 0 && pastBookings.length === 0) {
    return (
      <ProfileEmptyState
        icon={CalendarDays}
        title="Nenhum agendamento encontrado"
        description="Você ainda não tem nenhum agendamento. Clique no botão abaixo para explorar os serviços disponíveis."
        actionLabel="Explorar serviços"
      />
    );
  }

  return (
    <>
      {upcomingBookings.length > 0 && (
        <section>
          <h2 className={PROFILE_SECTION_TITLE_CLASS}>Próximos agendamentos</h2>
          <p className={PROFILE_SECTION_LEAD_CLASS}>
            Seus compromissos confirmados
          </p>
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <article
                key={booking.id}
                className="grid grid-cols-1 rounded-[22px] border border-[#E3E1EA] px-3 pt-3 pb-4 md:grid-cols-[150px_minmax(0,1fr)] md:gap-5 md:rounded-3xl md:p-4"
              >
                <div className="relative aspect-video overflow-hidden rounded-[14px] bg-[#E9E3F5] md:aspect-auto md:min-h-[150px] md:rounded-2xl">
                  <ImageWithFallback
                    src={booking.store.gallery[0]?.url ?? ''}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 150px, 100vw"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="mx-1 mt-3 text-base font-bold md:mx-0 md:mt-0 md:text-[17px]">
                    {booking.store.name}
                  </h3>
                  <p className="mx-1 mt-0.5 text-sm text-[#5F5C6E] md:mx-0 md:mt-[3px]">
                    {booking.service.name} · {getProfessionalName(booking)}
                  </p>

                  <dl className="mx-1 mt-3 grid grid-cols-2 gap-x-3.5 gap-y-2.5 text-sm md:mx-0 md:mt-3.5 md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] md:gap-x-[18px]">
                    <div>
                      <dt className={DETAIL_LABEL_CLASS}>Data</dt>
                      <dd className={DETAIL_VALUE_CLASS}>
                        <span className="md:hidden">
                          {formatBookingDateShort(booking.date)}
                        </span>
                        <span className="hidden md:inline">
                          {formatBookingDateLong(booking.date)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className={DETAIL_LABEL_CLASS}>Horário</dt>
                      <dd className={DETAIL_VALUE_CLASS}>
                        {booking.startTime} - {booking.endTime}
                      </dd>
                    </div>
                    <div>
                      <dt className={DETAIL_LABEL_CLASS}>Total</dt>
                      <dd className={DETAIL_VALUE_CLASS}>
                        {formatBookingPrice(booking)}
                      </dd>
                    </div>
                    <div>
                      <dt className={DETAIL_LABEL_CLASS}>Local</dt>
                      <dd className={DETAIL_VALUE_CLASS}>
                        {booking.store.address}
                      </dd>
                    </div>
                  </dl>

                  <div className={PROFILE_ACTIONS_CLASS}>
                    <button
                      type="button"
                      onClick={() => setSelectedBooking(booking)}
                      className={PROFILE_ACTION_PRIMARY_CLASS}
                    >
                      Ver detalhes
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingToCancel(booking)}
                      className={PROFILE_ACTION_CLASS}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {pastBookings.length > 0 && (
        <section className={cn(upcomingBookings.length > 0 && 'mt-9 md:mt-11')}>
          <h2 className={PROFILE_SECTION_TITLE_CLASS}>Histórico</h2>
          <p className={PROFILE_SECTION_LEAD_CLASS}>
            Seus agendamentos concluídos
          </p>
          <div className={PROFILE_CARDS_GRID_CLASS}>
            {pastBookings.map((booking) => (
              <article key={booking.id}>
                <div className="relative aspect-video overflow-hidden rounded-[14px] bg-[#F3E8E1] md:aspect-[4/3] md:rounded-[20px]">
                  <ImageWithFallback
                    src={booking.store.gallery[0]?.url ?? ''}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 400px, 100vw"
                    className="object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-white px-2.5 py-[5px] text-xs font-bold md:top-3 md:left-3 md:px-[11px]">
                    Concluído
                  </span>
                </div>
                <h3 className="mt-2.5 text-[15px] font-bold md:mt-3">
                  {booking.store.name}
                </h3>
                <p className="mt-0.5 text-sm text-[#5F5C6E]">
                  {booking.service.name} · {formatBookingPrice(booking)}
                  <span className="md:hidden">
                    {' · '}
                    {formatPastBookingDateShort(booking.date)}
                  </span>
                </p>
                <p className="mt-0.5 hidden text-sm text-[#5F5C6E] md:block">
                  {formatPastBookingDateLong(booking.date)}
                </p>
                <div className={PROFILE_ACTIONS_CLASS}>
                  <Link
                    href={`/booking/${booking.store.id}`}
                    className={PROFILE_ACTION_PRIMARY_CLASS}
                  >
                    Reservar novamente
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleReview(booking)}
                    className={PROFILE_ACTION_CLASS}
                  >
                    Avaliar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Detalhes do agendamento */}
      <Dialog
        open={!!selectedBooking}
        onOpenChange={() => setSelectedBooking(undefined)}
      >
        <DialogContent className={cn(PROFILE_DIALOG_CLASS, 'sm:max-w-lg')}>
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold tracking-[-0.02em]">
              Detalhes do agendamento
            </DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6 text-sm">
              <div>
                <h3 className="text-[17px] font-bold">
                  {selectedBooking.store.name}
                </h3>
                <p className="mt-0.5 mb-4 text-[#5F5C6E]">
                  {selectedBooking.service.name}
                </p>

                <div className="space-y-3 font-semibold">
                  <div className="flex items-start gap-3">
                    <Calendar className={MODAL_ICON_CLASS} aria-hidden />
                    {formatBookingDateFull(selectedBooking.date)}
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className={MODAL_ICON_CLASS} aria-hidden />
                    {selectedBooking.startTime} - {selectedBooking.endTime}
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className={MODAL_ICON_CLASS} aria-hidden />
                    {selectedBooking.store.address}
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className={MODAL_ICON_CLASS} aria-hidden />
                    {selectedBooking.store.telephone}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-4">
                <span className="text-[#5F5C6E]">Profissional</span>
                <span className="text-right font-semibold">
                  {getProfessionalName(selectedBooking)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#5F5C6E]">Valor total</span>
                <span className="text-right font-extrabold">
                  {formatBookingPrice(selectedBooking)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!bookingToCancel}
        onOpenChange={() => setBookingToCancel(undefined)}
      >
        <AlertDialogContent className={PROFILE_DIALOG_CLASS}>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este agendamento?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={PROFILE_DIALOG_DISMISS_CLASS}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              className={PROFILE_DIALOG_CONFIRM_CLASS}
            >
              Cancelar agendamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
