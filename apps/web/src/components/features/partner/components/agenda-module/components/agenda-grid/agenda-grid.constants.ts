/**
 * Configuração de status de agendamentos
 */
export const STATUS_CONFIG = {
  scheduled: {
    label: 'Agendado',
    className: 'bg-info-bg text-info',
  },
  completed: {
    label: 'Concluído',
    className: 'bg-success-bg text-success',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-error-bg text-error',
  },
  'no-show': {
    label: 'Não compareceu',
    className: 'bg-warning-bg text-warning',
  },
} as const;

export const STATUS_LEGEND = [
  STATUS_CONFIG.scheduled,
  STATUS_CONFIG.completed,
  STATUS_CONFIG['no-show'],
] as const;

/**
 * Selo de presença do cartão: fundo branco para destacar sobre a cor do status.
 */
export const PRESENCE_CONFIG = {
  confirmed: {
    label: 'Confirmado',
    hasIcon: true,
    className: 'text-success',
  },
  awaiting: {
    label: 'Aguardando resposta',
    hasIcon: false,
    className: 'text-ink-muted',
  },
} as const;

export const PRESENCE_LEGEND = {
  kind: 'confirmed',
  description: 'cliente respondeu ao lembrete',
} as const;

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
