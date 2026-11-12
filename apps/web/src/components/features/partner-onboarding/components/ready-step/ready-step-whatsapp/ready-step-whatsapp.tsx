'use client';

import {
  WhatsappBotQr,
  WhatsappBotQrCanvas,
} from '@/components/ui/whatsapp-bot-qr';
import Link from 'next/link';
import { useReadyStepWhatsapp } from './ready-step-whatsapp.hook';
import {
  READY_WHATSAPP_BUTTON_CLASS,
  READY_WHATSAPP_CARD_CLASS,
  READY_WHATSAPP_QUIET_BUTTON_CLASS,
  READY_WHATSAPP_TEXT_CLASS,
  READY_WHATSAPP_TITLE_CLASS,
} from './ready-step-whatsapp.styles';
import type { TReadyStepWhatsappConfig } from './ready-step-whatsapp.types';

/** Passo final: convite para conectar o WhatsApp ou, já conectado, o QR do bot. */
export const ReadyStepWhatsapp = ({ store }: TReadyStepWhatsappConfig) => {
  const {
    view,
    botLink,
    qrCanvasRef,
    handleDownloadQr,
    handleCopyLink,
    handleHideInvite,
  } = useReadyStepWhatsapp({ store });

  if (view === 'connected' && botLink) {
    return (
      <section
        aria-labelledby="ready-whatsapp-title"
        className={READY_WHATSAPP_CARD_CLASS}
      >
        <h2 id="ready-whatsapp-title" className={READY_WHATSAPP_TITLE_CLASS}>
          Seu WhatsApp também agenda
        </h2>
        <div className="flex flex-wrap items-center gap-[18px]">
          <WhatsappBotQr link={botLink} size={96} />
          <div className="flex flex-col items-start gap-2.5">
            <button
              type="button"
              onClick={handleDownloadQr}
              className={READY_WHATSAPP_BUTTON_CLASS}
            >
              Baixar QR code
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className={READY_WHATSAPP_BUTTON_CLASS}
            >
              Copiar link do WhatsApp
            </button>
          </div>
        </div>
        <WhatsappBotQrCanvas link={botLink} canvasRef={qrCanvasRef} />
      </section>
    );
  }

  if (view !== 'invite') return null;

  return (
    <section
      aria-labelledby="ready-whatsapp-title"
      className={READY_WHATSAPP_CARD_CLASS}
    >
      <h2 id="ready-whatsapp-title" className={READY_WHATSAPP_TITLE_CLASS}>
        Atenda também pelo WhatsApp
      </h2>
      <p className={READY_WHATSAPP_TEXT_CLASS}>
        Conecte o número da loja e seus clientes agendam pela conversa, sem
        baixar nada. O lembrete pergunta se o cliente vem, e quem não vem libera
        a vaga para a lista de espera.
      </p>
      <div className="flex flex-wrap gap-2.5">
        <Link
          href="/partner/settings/whatsapp/connect"
          className={READY_WHATSAPP_BUTTON_CLASS}
        >
          Conectar WhatsApp
        </Link>
        <button
          type="button"
          onClick={handleHideInvite}
          className={READY_WHATSAPP_QUIET_BUTTON_CLASS}
        >
          Depois
        </button>
      </div>
    </section>
  );
};
