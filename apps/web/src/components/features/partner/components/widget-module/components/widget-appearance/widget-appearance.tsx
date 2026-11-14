import { cn, Input } from '@repo/ui';
import {
  MODULE_CARD_CLASS,
  MODULE_CARD_TITLE_CLASS,
  MODULE_FIELD_CLASS,
  MODULE_FIELD_LABEL_CLASS,
} from '../../../notifications-module/notifications-module.styles';
import {
  WIDGET_COLORS,
  WIDGET_LABEL_MAX_LENGTH,
  WIDGET_POSITIONS,
} from '../../widget-module.constants';
import type { TWidgetAppearanceConfig } from './widget-appearance.types';

const RADIO_FOCUS_CLASS =
  'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#0B0B0F]';

export const WidgetAppearance = ({
  label,
  color,
  position,
  onLabelChange,
  onColorChange,
  onPositionChange,
}: TWidgetAppearanceConfig) => (
  <section
    aria-labelledby="widget-appearance-title"
    className={MODULE_CARD_CLASS}
  >
    <h3 id="widget-appearance-title" className={MODULE_CARD_TITLE_CLASS}>
      Aparência do botão
    </h3>

    <div className="grid gap-1.5">
      <label htmlFor="widget-label" className={MODULE_FIELD_LABEL_CLASS}>
        Texto do botão
      </label>
      <Input
        id="widget-label"
        value={label}
        onChange={onLabelChange}
        maxLength={WIDGET_LABEL_MAX_LENGTH}
        aria-describedby="widget-label-hint"
        className={cn(MODULE_FIELD_CLASS, 'max-w-[360px]')}
      />
      <p id="widget-label-hint" className="text-xs text-[#5F5C6E]">
        {label.length}/{WIDGET_LABEL_MAX_LENGTH} caracteres
      </p>
    </div>

    <fieldset className="grid gap-1.5">
      <legend className={cn(MODULE_FIELD_LABEL_CLASS, 'mb-1.5')}>Cor</legend>
      <div className="flex flex-wrap gap-2">
        {WIDGET_COLORS.map((option) => (
          <label key={option.id} className="cursor-pointer">
            <input
              type="radio"
              name="widget-color"
              value={option.id}
              checked={color.id === option.id}
              onChange={() => onColorChange(option.id)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className={cn(
                'block size-11 rounded-full border-2 border-white shadow-[0_0_0_1px_#E3E1EA] peer-checked:shadow-[0_0_0_2px_#0B0B0F]',
                RADIO_FOCUS_CLASS,
                option.className,
              )}
            />
            <span className="sr-only">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>

    <fieldset className="grid gap-1.5">
      <legend className={cn(MODULE_FIELD_LABEL_CLASS, 'mb-1.5')}>
        Posição
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {WIDGET_POSITIONS.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              name="widget-position"
              value={option.value}
              checked={position === option.value}
              onChange={() => onPositionChange(option.value)}
              className="peer sr-only"
            />
            <span
              className={cn(
                'inline-flex min-h-10 items-center rounded-full border border-[#E3E1EA] bg-white px-3.5 text-[13px] font-semibold text-[#0B0B0F] transition-colors hover:bg-[#F7F6FA] peer-checked:border-[#0B0B0F] peer-checked:bg-[#0B0B0F] peer-checked:text-white',
                RADIO_FOCUS_CLASS,
              )}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  </section>
);
