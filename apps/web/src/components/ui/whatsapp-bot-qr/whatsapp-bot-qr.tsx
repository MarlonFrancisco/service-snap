import { cn } from '@repo/ui';
import { QRCodeSVG } from 'qrcode.react';
import {
  WHATSAPP_BOT_QR_COLORS,
  WHATSAPP_BOT_QR_LABEL,
} from './whatsapp-bot-qr.constants';
import type { TWhatsappBotQrConfig } from './whatsapp-bot-qr.types';

/** QR do link `wa.me` da loja, na moldura clara do desenho. */
export const WhatsappBotQr = ({
  link,
  size = 96,
  className,
  ...props
}: TWhatsappBotQrConfig) => (
  <div
    className={cn(
      'shrink-0 rounded-2xl border border-[#EBE9F0] bg-white p-2.5',
      className,
    )}
    {...props}
  >
    <QRCodeSVG
      value={link}
      size={size}
      level="M"
      fgColor={WHATSAPP_BOT_QR_COLORS.foreground}
      bgColor={WHATSAPP_BOT_QR_COLORS.background}
      role="img"
      aria-label={WHATSAPP_BOT_QR_LABEL}
      className="block"
    />
  </div>
);
