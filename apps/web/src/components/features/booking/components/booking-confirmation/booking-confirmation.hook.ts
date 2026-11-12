'use client';

import { formatStorePrice } from '@/utils/helpers/price.helper';
import { COUNTRIES } from '@repo/shared/constants';
import { useCallback, useMemo } from 'react';
import { useGetStore } from '../../booking.hook';
import {
  buildGoogleCalendarUrl,
  buildIcsFile,
  formatConfirmationDate,
  formatServiceDuration,
  getNoticePolicySentence,
  getStoreWhatsAppUrl,
} from './booking-confirmation.helpers';
import type {
  TBookingConfirmationConfig,
  TCalendarEvent,
} from './booking-confirmation.types';

const ICS_FILE_NAME = 'agendamento.ics';

export const useBookingConfirmation = ({
  confirmation,
}: Pick<TBookingConfirmationConfig, 'confirmation'>) => {
  const store = useGetStore()!;

  const calendarEvent = useMemo<TCalendarEvent>(() => {
    const serviceNames = confirmation.services
      .map((service) => service.name)
      .join(', ');
    const location = [store.address, store.city, store.state]
      .filter(Boolean)
      .join(', ');

    return {
      uid: `${confirmation.bookingId}@servicesnap`,
      title: `${serviceNames} · ${store.name}`,
      description: `Profissional: ${confirmation.professionalName}\nPagamento no local.\nAgendado pelo ServiceSnap.`,
      location,
      dateKey: confirmation.dateKey,
      startTime: confirmation.startTime,
      endTime: confirmation.endTime,
      timeZone: store.timezone || COUNTRIES[store.country]?.timezone || 'UTC',
    };
  }, [confirmation, store]);

  const formatPrice = useCallback(
    (price: number) => formatStorePrice(price, store.currency, store.country),
    [store.currency, store.country],
  );

  const services = useMemo(
    () =>
      confirmation.services.map((service) => ({
        id: service.id,
        label:
          service.quantity > 1
            ? `${service.name} ${service.quantity}x`
            : service.name,
        duration: formatServiceDuration(service.duration * service.quantity),
        price: formatPrice(service.price * service.quantity),
      })),
    [confirmation.services, formatPrice],
  );

  const handleDownloadIcs = useCallback(() => {
    const file = new Blob([buildIcsFile(calendarEvent, new Date())], {
      type: 'text/calendar;charset=utf-8',
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = ICS_FILE_NAME;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Solta o arquivo depois que o navegador começou o download
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [calendarEvent]);

  return {
    storeName: store.name,
    storeHref: `/booking/${store.slug || store.id}`,
    addressLine: store.address,
    cityLine: [store.city, store.state].filter(Boolean).join(' - '),
    professionalName: confirmation.professionalName,
    dateLabel: formatConfirmationDate(confirmation.dateKey),
    timeLabel: `${confirmation.startTime} - ${confirmation.endTime}`,
    services,
    totalLabel: formatPrice(confirmation.totalPrice),
    policySentence: getNoticePolicySentence(store),
    googleCalendarUrl: buildGoogleCalendarUrl(calendarEvent),
    whatsAppUrl: getStoreWhatsAppUrl(store),
    handleDownloadIcs,
  };
};
