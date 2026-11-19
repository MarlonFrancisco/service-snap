export const WHATSAPP_BOT_QR_LABEL = 'QR code do WhatsApp da loja';

/** Lado, em px, do QR usado nos downloads (o da tela é desenhado em SVG). */
export const WHATSAPP_BOT_QR_EXPORT_SIZE = 1024;

/** Margem de 4 módulos: o mínimo da especificação para a leitura pela câmera. */
export const WHATSAPP_BOT_QR_MARGIN = 4;

export const WHATSAPP_BOT_QR_COLORS = {
  foreground: '#120E1C',
  background: '#FFFFFF',
} as const;

/** Cartaz em A4 retrato a 150 dpi. */
export const WHATSAPP_BOT_POSTER = {
  width: 1240,
  height: 1754,
  sidePadding: 120,
  qrBoxSize: 800,
  qrBoxPadding: 36,
  qrBoxRadius: 48,
  colors: {
    background: '#FFFFFF',
    text: '#120E1C',
    muted: '#5C566C',
    border: '#E9E5F0',
  },
  texts: {
    title: 'Agende pelo WhatsApp',
    instruction: 'Aponte a câmera do celular para o QR code',
    footer: 'Agende, remarque ou cancele pela conversa.',
  },
} as const;

export const WHATSAPP_BOT_FEEDBACK = {
  linkCopied: 'Link copiado',
  copyFailed: 'Não foi possível copiar. Tente de novo.',
  qrFailed: 'Não foi possível baixar o QR code. Tente de novo.',
  posterFailed: 'Não foi possível gerar o cartaz. Tente de novo.',
} as const;
