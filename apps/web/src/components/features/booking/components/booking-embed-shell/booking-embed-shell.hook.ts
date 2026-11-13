'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useGetStore } from '../../booking.hook';
import { EMBED_FALLBACK_TITLE } from './booking-embed-shell.constants';
import {
  isInsideFrame,
  postEmbedMessage,
  shouldCloseOnEscape,
} from './booking-embed-shell.helpers';

/** Dentro do widget avisa o site para fechar; aberta direto, vai para a página da loja. */
export const useEmbedClose = () => {
  const router = useRouter();
  const params = useParams();
  const storeId = params.id as string;

  return useCallback(() => {
    if (isInsideFrame()) {
      postEmbedMessage({ type: 'servicesnap:close' });
      return;
    }
    router.push(`/booking/${storeId}`);
  }, [router, storeId]);
};

export const useBookingEmbedShell = () => {
  const store = useGetStore();
  const handleClose = useEmbedClose();
  const storeName = store?.name;

  // O foco fica no iframe enquanto o cliente agenda: o Esc chega aqui, não no site.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldCloseOnEscape(event)) handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  // Montado o casco, o × daqui funciona e o widget esconde o dele. Com o nome,
  // o widget troca o título genérico do iframe por "Agendar em <loja>".
  useEffect(() => {
    postEmbedMessage({ type: 'servicesnap:ready', storeName });
  }, [storeName]);

  return { title: storeName ?? EMBED_FALLBACK_TITLE, handleClose };
};

/** Confirmado o agendamento: avisa o site e troca o fluxo pela confirmação. */
export const useBookingEmbedCompletion = () => {
  const [isBooked, setIsBooked] = useState(false);

  const handleBooked = useCallback(() => {
    postEmbedMessage({ type: 'servicesnap:booked' });
    setIsBooked(true);
  }, []);

  return { isBooked, handleBooked };
};
