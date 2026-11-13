import type { TBookingEmbedState } from './booking-embed-shell.types';

export const EMBED_FALLBACK_TITLE = 'Agendar horário';

export const EMBED_STATE_SUBTITLE: Record<TBookingEmbedState, string> = {
  loading: 'Carregando...',
  error: 'Agenda indisponível',
  booked: 'Agendamento confirmado',
};

export const EMBED_STATE_NOTICE: Record<
  TBookingEmbedState,
  { title: string; description: string }
> = {
  loading: {
    title: 'Carregando a agenda',
    description: 'Só um instante.',
  },
  error: {
    title: 'Não foi possível carregar',
    description:
      'A agenda desta loja não está disponível agora. Tente de novo em instantes.',
  },
  booked: {
    title: 'Agendamento confirmado',
    description:
      'Seu horário está reservado. Os detalhes ficam em Meus agendamentos.',
  },
};

export const EMBED_PRIMARY_ACTION_CLASS =
  'flex min-h-12 w-full items-center justify-center rounded-full bg-[#0B0B0F] px-5 text-sm font-bold text-white transition-colors hover:bg-[#2B2B2B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';

export const EMBED_SECONDARY_ACTION_CLASS =
  'flex min-h-12 w-full items-center justify-center rounded-full border border-[#E3E1EA] bg-white px-5 text-sm font-bold text-[#0B0B0F] transition-colors hover:bg-[#F7F6FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';
