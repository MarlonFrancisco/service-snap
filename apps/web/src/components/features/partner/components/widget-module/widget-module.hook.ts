'use client';

import type { ChangeEvent } from 'react';
import { useCallback, useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { useStoreAvailability } from '../notifications-module/notifications-module.hook';
import {
  WIDGET_COLORS,
  WIDGET_DEFAULT_LABEL,
  WIDGET_LABEL_MAX_LENGTH,
} from './widget-module.constants';
import {
  buildBookingLink,
  buildWidgetSnippet,
  getBrowserWidgetOrigin,
  getServerWidgetOrigin,
  resolveWidgetLabel,
} from './widget-module.helpers';
import type { TWidgetColorId, TWidgetPosition } from './widget-module.types';

const subscribeToNothing = () => () => {};

/** A origem não muda durante a visita: só o primeiro render do servidor difere. */
export const useWidgetOrigin = () =>
  useSyncExternalStore(
    subscribeToNothing,
    getBrowserWidgetOrigin,
    getServerWidgetOrigin,
  );

const copyText = async (text: string, successMessage: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch {
    toast.error('Falha ao copiar. Tente novamente.');
  }
};

/** Nada vai para o servidor: a configuração inteira mora no snippet. */
export const useWidgetModule = () => {
  const { storeId, storeAvailability, retryStore } = useStoreAvailability();
  const origin = useWidgetOrigin();

  const [label, setLabel] = useState(WIDGET_DEFAULT_LABEL);
  const [colorId, setColorId] = useState<TWidgetColorId>('black');
  const [position, setPosition] = useState<TWidgetPosition>('right');

  const color =
    WIDGET_COLORS.find((option) => option.id === colorId) ?? WIDGET_COLORS[0]!;
  const previewLabel = resolveWidgetLabel(label);

  const snippet = buildWidgetSnippet({
    origin,
    storeId,
    label,
    color: color.value,
    position,
  });
  const bookingLink = buildBookingLink(origin, storeId);

  const handleLabelChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setLabel(event.target.value.slice(0, WIDGET_LABEL_MAX_LENGTH));
    },
    [],
  );

  const handleCopySnippet = useCallback(() => {
    void copyText(snippet, 'Código copiado!');
  }, [snippet]);

  const handleCopyLink = useCallback(() => {
    void copyText(bookingLink, 'Link copiado!');
  }, [bookingLink]);

  return {
    storeAvailability,
    retryStore,
    label,
    previewLabel,
    color,
    position,
    snippet,
    bookingLink,
    handleLabelChange,
    handleColorChange: setColorId,
    handlePositionChange: setPosition,
    handleCopySnippet,
    handleCopyLink,
  };
};
