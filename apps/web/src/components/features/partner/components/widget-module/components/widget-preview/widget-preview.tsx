import { cn } from '@repo/ui';
import {
  MODULE_CARD_CLASS,
  MODULE_CARD_TITLE_CLASS,
} from '../../../notifications-module/notifications-module.styles';
import type { TWidgetPreviewConfig } from './widget-preview.types';

const POSITION_LABEL = { right: 'direito', left: 'esquerdo' } as const;

export const WidgetPreview = ({
  label,
  color,
  position,
}: TWidgetPreviewConfig) => (
  <section aria-labelledby="widget-preview-title" className={MODULE_CARD_CLASS}>
    <h3 id="widget-preview-title" className={MODULE_CARD_TITLE_CLASS}>
      Prévia
    </h3>
    <div
      role="img"
      aria-label={`Botão "${label}" em ${color.label.toLowerCase()} no canto ${POSITION_LABEL[position]} da tela`}
      className="relative h-[220px] overflow-hidden rounded-[18px] border border-dashed border-[#D8D5E0] bg-[#F7F6FA]"
    >
      <span
        className={cn(
          'absolute bottom-4 inline-flex max-w-[calc(100%-32px)] items-center gap-2 rounded-full px-[18px] py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(15,12,30,0.2)]',
          position === 'left' ? 'left-4' : 'right-4',
          color.className,
        )}
      >
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-full bg-current"
        />
        <span className="truncate">{label}</span>
      </span>
    </div>
  </section>
);
