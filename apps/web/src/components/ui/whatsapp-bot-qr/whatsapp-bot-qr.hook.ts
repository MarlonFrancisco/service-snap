'use client';

import { downloadFromUrl } from '@/utils/helpers/download.helper';
import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { WHATSAPP_BOT_FEEDBACK } from './whatsapp-bot-qr.constants';
import {
  drawWhatsappBotPoster,
  getWhatsappBotFileName,
} from './whatsapp-bot-qr.helpers';
import type { TUseWhatsappBotQrActionsConfig } from './whatsapp-bot-qr.types';

/** O canvas só desenha com a fonte já carregada; sem ela, cai na fonte de reserva. */
const loadPosterFonts = async (fontFamily: string) => {
  try {
    await Promise.all(
      ['500', '700', '800'].map((weight) =>
        document.fonts.load(`${weight} 48px ${fontFamily}`),
      ),
    );
  } catch {
    // A fonte de reserva ainda gera um cartaz legível.
  }
};

/**
 * Ações de divulgação do bot: baixar o QR em PNG, gerar o cartaz e copiar o link.
 * `qrCanvasRef` vai no `WhatsappBotQrCanvas`, que desenha o QR em alta resolução.
 */
export const useWhatsappBotQrActions = ({
  link,
  storeName,
  displayPhoneNumber,
  onAction,
}: TUseWhatsappBotQrActionsConfig) => {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownloadQr = useCallback(() => {
    const qrCanvas = qrCanvasRef.current;
    try {
      if (!qrCanvas) throw new Error('QR ainda não desenhado');
      downloadFromUrl(
        qrCanvas.toDataURL('image/png'),
        getWhatsappBotFileName(storeName, 'qr-code'),
      );
      onAction?.('download_qr');
    } catch {
      toast.error(WHATSAPP_BOT_FEEDBACK.qrFailed);
    }
  }, [storeName, onAction]);

  const downloadPoster = useCallback(async () => {
    const qrCanvas = qrCanvasRef.current;
    try {
      if (!qrCanvas) throw new Error('QR ainda não desenhado');
      const fontFamily = plusJakartaSans.style.fontFamily;
      await loadPosterFonts(fontFamily);
      const poster = drawWhatsappBotPoster({
        qrCanvas,
        storeName,
        displayPhoneNumber,
        fontFamily,
      });
      downloadFromUrl(
        poster.toDataURL('image/png'),
        getWhatsappBotFileName(storeName, 'cartaz'),
      );
      onAction?.('download_poster');
    } catch {
      toast.error(WHATSAPP_BOT_FEEDBACK.posterFailed);
    }
  }, [storeName, displayPhoneNumber, onAction]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success(WHATSAPP_BOT_FEEDBACK.linkCopied);
      onAction?.('copy_link');
    } catch {
      toast.error(WHATSAPP_BOT_FEEDBACK.copyFailed);
    }
  }, [link, onAction]);

  return {
    qrCanvasRef,
    handleDownloadQr,
    handleDownloadPoster: () => void downloadPoster(),
    handleCopyLink: () => void copyLink(),
  };
};
