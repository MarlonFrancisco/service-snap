import type { TBookingEmbedMessage } from './booking-embed-shell.types';

export const isInsideFrame = (): boolean => window.parent !== window;

/**
 * `*` como destino: a mensagem não leva dado privado e o site da loja pode ter
 * qualquer domínio. Quem confere a origem é o `widget.js`.
 */
export const postEmbedMessage = (message: TBookingEmbedMessage): void => {
  if (!isInsideFrame()) return;
  window.parent.postMessage(message, '*');
};

/** Esc fecha o widget, a menos que um modal ou gaveta aberto já tenha tratado. */
export const shouldCloseOnEscape = (event: KeyboardEvent): boolean =>
  event.key === 'Escape' &&
  !event.defaultPrevented &&
  !document.querySelector('[role="dialog"][data-state="open"]');
