import type {
  TWidgetColor,
  TWidgetPositionOption,
} from './widget-module.types';

export const WIDGET_DEFAULT_LABEL = 'Agendar horário';

export const WIDGET_LABEL_MAX_LENGTH = 40;

export const WIDGET_SCRIPT_PATH = '/widget.js';

/** Todas com contraste AA para texto branco. */
export const WIDGET_COLORS: readonly TWidgetColor[] = [
  { id: 'black', label: 'Preto', value: '#0b0b0f', className: 'bg-[#0b0b0f]' },
  { id: 'purple', label: 'Roxo', value: '#9810fa', className: 'bg-[#9810fa]' },
  { id: 'green', label: 'Verde', value: '#0a7d4f', className: 'bg-[#0a7d4f]' },
  {
    id: 'orange',
    label: 'Laranja',
    value: '#b45309',
    className: 'bg-[#b45309]',
  },
];

export const WIDGET_POSITIONS: readonly TWidgetPositionOption[] = [
  { value: 'right', label: 'Canto direito' },
  { value: 'left', label: 'Canto esquerdo' },
];
