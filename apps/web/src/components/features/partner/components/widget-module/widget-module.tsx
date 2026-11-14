'use client';

import { cn } from '@repo/ui';
import {
  ModuleErrorState,
  NoStoreState,
} from '../notifications-module/components/module-state';
import {
  MODULE_ACTION_CLASS,
  MODULE_CARD_CLASS,
  MODULE_CARD_TITLE_CLASS,
  MODULE_LEAD_CLASS,
  MODULE_PRIMARY_ACTION_CLASS,
  MODULE_TITLE_CLASS,
} from '../notifications-module/notifications-module.styles';
import { WidgetAppearance } from './components/widget-appearance';
import { WidgetPreview } from './components/widget-preview';
import { WidgetModuleSkeleton } from './widget-module-skeleton';
import { useWidgetModule } from './widget-module.hook';

const CARD_NOTE_CLASS = 'text-sm leading-[1.55] text-[#5F5C6E]';

export const WidgetModule = () => {
  const {
    storeAvailability,
    retryStore,
    label,
    previewLabel,
    color,
    position,
    snippet,
    bookingLink,
    handleLabelChange,
    handleColorChange,
    handlePositionChange,
    handleCopySnippet,
    handleCopyLink,
  } = useWidgetModule();

  if (storeAvailability === 'no-store') return <NoStoreState />;
  if (storeAvailability === 'error') {
    return <ModuleErrorState onRetry={retryStore} />;
  }
  if (storeAvailability === 'loading') return <WidgetModuleSkeleton />;

  return (
    <div className="grid gap-4">
      <div className="max-w-[720px]">
        <h2 className={MODULE_TITLE_CLASS}>
          Receba agendamentos pelo seu site
        </h2>
        <p className={MODULE_LEAD_CLASS}>
          Cole um código no seu site e um botão &quot;Agendar horário&quot;
          aparece no canto da tela. O cliente agenda sem sair do seu site.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-4">
        <WidgetAppearance
          label={label}
          color={color}
          position={position}
          onLabelChange={handleLabelChange}
          onColorChange={handleColorChange}
          onPositionChange={handlePositionChange}
        />
        <WidgetPreview label={previewLabel} color={color} position={position} />
      </div>

      <section
        aria-labelledby="widget-code-title"
        className={MODULE_CARD_CLASS}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="widget-code-title" className={MODULE_CARD_TITLE_CLASS}>
            Código para o seu site
          </h3>
          <button
            type="button"
            onClick={handleCopySnippet}
            className={cn(MODULE_PRIMARY_ACTION_CLASS, 'px-[18px]')}
          >
            Copiar código
          </button>
        </div>
        <p className={CARD_NOTE_CLASS}>
          Cole antes do fechamento da tag &lt;/body&gt; em todas as páginas. No
          WordPress, use um plugin de &quot;inserir código no rodapé&quot;; no
          Wix, em Configurações › Código personalizado.
        </p>
        <pre
          aria-label="Código do widget"
          translate="no"
          className="rounded-[14px] bg-[#0B0B0F] p-4 font-mono text-[13px] leading-[1.6] font-medium break-all whitespace-pre-wrap text-[#E8E6EF]"
        >
          {snippet}
        </pre>
      </section>

      <section
        aria-labelledby="widget-link-title"
        className={MODULE_CARD_CLASS}
      >
        <h3 id="widget-link-title" className={MODULE_CARD_TITLE_CLASS}>
          Prefere só um link?
        </h3>
        <p className={CARD_NOTE_CLASS}>
          Use o endereço da sua página de agendamento em botões, na bio do
          Instagram ou no Google Perfil da Empresa.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span
            translate="no"
            className="flex min-h-11 min-w-0 flex-[1_1_320px] items-center overflow-hidden rounded-full border border-[#E3E1EA] px-4 text-[13px] font-medium text-ellipsis whitespace-nowrap text-[#5F5C6E]"
          >
            {bookingLink}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className={MODULE_ACTION_CLASS}
          >
            Copiar link
          </button>
        </div>
      </section>
    </div>
  );
};
