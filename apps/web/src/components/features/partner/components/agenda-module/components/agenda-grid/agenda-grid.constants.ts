/**
 * Configuração de status de agendamentos
 */
export const STATUS_CONFIG = {
  scheduled: {
    label: 'Agendado',
    className: 'bg-[#E4ECF6] text-[#143C66]',
  },
  completed: {
    label: 'Concluído',
    className: 'bg-[#DFF2E7] text-[#0A5536]',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-[#FBE4E2] text-[#A4231A]',
  },
  'no-show': {
    label: 'Não compareceu',
    className: 'bg-[#FBE8D9] text-[#7A3B00]',
  },
} as const;

export const STATUS_LEGEND = [
  STATUS_CONFIG.scheduled,
  STATUS_CONFIG.completed,
  STATUS_CONFIG['no-show'],
] as const;

/**
 * Constantes de configuração do grid
 */
export const GRID_CONSTANTS = {
  WEEK_SLOT_HEIGHT: 56,
  WEEK_HEADER_HEIGHT: 64,
  DAY_SLOT_HEIGHT: 60,
  DAY_HEADER_HEIGHT: 58,
  TIME_COLUMN_WIDTH: 64,
  WEEK_MIN_COLUMN_WIDTH: 150,
  DAY_MIN_COLUMN_WIDTH: 220,
  /** Largura mínima por profissional na semana em modo de bloqueio. */
  BLOCK_LANE_MIN_WIDTH: 44,
  /** Faixa do "+" quando outro profissional segue livre ao lado de um agendamento. */
  FREE_GUTTER_WIDTH: 28,
} as const;

/**
 * Breakpoints responsivos
 */
export const BREAKPOINTS = {
  MOBILE: 768, // md breakpoint (Tailwind padrão)
} as const;

/**
 * A rolagem interna mantém o cabeçalho dos dias visível. O desconto cobre a barra
 * e os respiros do casco; se a barra quebrar em duas linhas, o `main` rola o resto.
 */
export const GRID_SCROLL_CLASS = {
  DEFAULT: 'max-h-[max(28rem,calc(100dvh-14rem))]',
  FOCUS: 'max-h-[max(28rem,calc(100dvh-9rem))]',
} as const;
