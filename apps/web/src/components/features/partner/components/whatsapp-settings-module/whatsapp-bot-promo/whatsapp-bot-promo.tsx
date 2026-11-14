'use client';

import {
  WhatsappBotQr,
  WhatsappBotQrCanvas,
} from '@/components/ui/whatsapp-bot-qr';
import { cn } from '@repo/ui';
import {
  MODULE_BADGE_CLASS,
  MODULE_BADGE_TONE_CLASS,
  MODULE_CARD_CLASS,
  MODULE_CARD_TITLE_CLASS,
} from '../../notifications-module/notifications-module.styles';
import { useWhatsappBotPromo } from './whatsapp-bot-promo.hook';
import {
  WHATSAPP_BOT_ACTION_CLASS,
  WHATSAPP_BOT_COPY_BUTTON_CLASS,
  WHATSAPP_BOT_LINK_FIELD_CLASS,
  WHATSAPP_BOT_TIP_CLASS,
} from './whatsapp-bot-promo.styles';
import type { TWhatsappBotPromoConfig } from './whatsapp-bot-promo.types';

/** Divulgação do bot com a integração conectada: link, QR, PNG e cartaz. */
export const WhatsappBotPromo = ({
  botLink,
  displayPhoneNumber,
  className,
}: TWhatsappBotPromoConfig) => {
  const {
    qrCanvasRef,
    linkLabel,
    handleCopyLink,
    handleDownloadQr,
    handleDownloadPoster,
  } = useWhatsappBotPromo({ botLink, displayPhoneNumber });

  return (
    <section
      aria-labelledby="whatsapp-bot-promo-title"
      className={cn(MODULE_CARD_CLASS, className)}
    >
      <span
        className={cn(
          MODULE_BADGE_CLASS,
          MODULE_BADGE_TONE_CLASS.success,
          'justify-self-start',
        )}
      >
        ● Conectado
      </span>
      <h3 id="whatsapp-bot-promo-title" className={MODULE_CARD_TITLE_CLASS}>
        Divulgue seu atendimento no WhatsApp
      </h3>
      <p className="text-sm leading-normal text-[#5F5C6E]">
        Seus clientes agendam, remarcam e cancelam pela conversa. Coloque o QR
        no balcão e o link na bio do Instagram.
      </p>

      <div className={WHATSAPP_BOT_LINK_FIELD_CLASS}>
        <span className="min-w-0 flex-1 truncate" title={linkLabel}>
          {linkLabel}
        </span>
        <button
          type="button"
          onClick={handleCopyLink}
          className={WHATSAPP_BOT_COPY_BUTTON_CLASS}
        >
          Copiar link
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-[18px]">
        <WhatsappBotQr link={botLink} size={132} />
        <div className="flex flex-col items-start gap-2.5">
          <button
            type="button"
            onClick={handleDownloadQr}
            className={WHATSAPP_BOT_ACTION_CLASS}
          >
            Baixar QR code (PNG)
          </button>
          <button
            type="button"
            onClick={handleDownloadPoster}
            className={WHATSAPP_BOT_ACTION_CLASS}
          >
            Baixar cartaz para imprimir
          </button>
          <span className={WHATSAPP_BOT_TIP_CLASS}>
            O cartaz traz o QR, o nome da loja e &quot;Agende pelo
            WhatsApp&quot;.
          </span>
        </div>
      </div>

      <WhatsappBotQrCanvas link={botLink} canvasRef={qrCanvasRef} />
    </section>
  );
};
