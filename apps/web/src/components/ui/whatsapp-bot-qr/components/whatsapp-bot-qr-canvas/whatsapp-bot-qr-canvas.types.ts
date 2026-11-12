import type { RefObject } from 'react';

export type TWhatsappBotQrCanvasConfig = {
  link: string;
  /** O `qrCanvasRef` de `useWhatsappBotQrActions`. */
  canvasRef: RefObject<HTMLCanvasElement | null>;
};
