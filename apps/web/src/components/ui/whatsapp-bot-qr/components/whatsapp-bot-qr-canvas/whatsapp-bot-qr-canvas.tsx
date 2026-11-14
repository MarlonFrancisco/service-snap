import { QRCodeCanvas } from 'qrcode.react';
import {
  WHATSAPP_BOT_QR_COLORS,
  WHATSAPP_BOT_QR_EXPORT_SIZE,
  WHATSAPP_BOT_QR_MARGIN,
} from '../../whatsapp-bot-qr.constants';
import type { TWhatsappBotQrCanvasConfig } from './whatsapp-bot-qr-canvas.types';

/** QR em alta resolução, fora da tela: é a fonte do PNG e do cartaz. */
export const WhatsappBotQrCanvas = ({
  link,
  canvasRef,
}: TWhatsappBotQrCanvasConfig) => (
  <QRCodeCanvas
    ref={canvasRef}
    value={link}
    size={WHATSAPP_BOT_QR_EXPORT_SIZE}
    marginSize={WHATSAPP_BOT_QR_MARGIN}
    level="M"
    fgColor={WHATSAPP_BOT_QR_COLORS.foreground}
    bgColor={WHATSAPP_BOT_QR_COLORS.background}
    aria-hidden="true"
    className="hidden"
  />
);
