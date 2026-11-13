import type { ReactNode, Ref } from 'react';

/** Mensagens que a página embutida manda para o `widget.js` do site da loja. */
export type TBookingEmbedMessage =
  | { type: 'servicesnap:close' }
  | { type: 'servicesnap:booked' }
  /** A página já fecha sozinha; com o nome, o widget ajusta o título do iframe. */
  | { type: 'servicesnap:ready'; storeName?: string };

/** Estados que trocam o fluxo por um aviso dentro do casco. */
export type TBookingEmbedState = 'loading' | 'error' | 'booked';

export type TBookingEmbedShellConfig = {
  /** Descrição do passo atual, embaixo do nome da loja. */
  subtitle?: string;
  state?: TBookingEmbedState;
  /** Área rolável: o fluxo volta ao topo dela ao trocar de passo. */
  scrollAreaRef?: Ref<HTMLElement>;
  children?: ReactNode;
};
