'use client';

import { WhatsappBotQrCanvas } from '@/components/ui/whatsapp-bot-qr';
import { cn } from '@repo/ui';
import { PARTNER_FOCUS_CLASS } from '../../../partner.styles';
import {
  WHATSAPP_BOT_ACTION_CLASS,
  WHATSAPP_BOT_TIP_CLASS,
} from '../whatsapp-bot-promo';
import { useWhatsappBotHomeCard } from './whatsapp-bot-home-card.hook';

/** Início do painel: lembrete para divulgar o bot enquanto o parceiro não baixou o QR. */
export const WhatsappBotHomeCard = () => {
  const {
    isVisible,
    botLink,
    qrCanvasRef,
    handleDownloadQr,
    handleCopyLink,
    handleDismiss,
  } = useWhatsappBotHomeCard();

  if (!isVisible || !botLink) return null;

  return (
    <section
      aria-labelledby="whatsapp-bot-home-title"
      className="relative mb-5 flex flex-col gap-2.5 rounded-[18px] bg-[#F7F6FA] px-5 py-[18px] text-[#0B0B0F]"
    >
      <button
        type="button"
        aria-label="Fechar aviso do bot de WhatsApp"
        onClick={handleDismiss}
        className={cn(
          'absolute top-2 right-2 grid size-11 cursor-pointer place-items-center rounded-full text-lg text-[#0B0B0F] hover:bg-[#EBE9F0]',
          PARTNER_FOCUS_CLASS,
        )}
      >
        <span aria-hidden="true">×</span>
      </button>

      <h2 id="whatsapp-bot-home-title" className="pr-12 text-[15px] font-bold">
        Seu bot de WhatsApp está pronto
      </h2>
      <p className={WHATSAPP_BOT_TIP_CLASS}>
        Clientes que chegam pelo QR ou pelo link agendam sozinhos, 24 horas por
        dia.
      </p>
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={handleDownloadQr}
          className={WHATSAPP_BOT_ACTION_CLASS}
        >
          Baixar QR code
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          className={WHATSAPP_BOT_ACTION_CLASS}
        >
          Copiar link
        </button>
      </div>

      <WhatsappBotQrCanvas link={botLink} canvasRef={qrCanvasRef} />
    </section>
  );
};
