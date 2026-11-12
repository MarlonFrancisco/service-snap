import type { HTMLAttributes } from 'react';

export type TWhatsappBotQrConfig = HTMLAttributes<HTMLDivElement> & {
  /** Link `wa.me` do bot da loja. */
  link: string;
  /** Lado do QR na tela, em px. */
  size?: number;
};

/** O que o parceiro fez com o link do bot: o Início usa para esconder o aviso. */
export type TWhatsappBotShareAction =
  | 'download_qr'
  | 'download_poster'
  | 'copy_link';

export type TUseWhatsappBotQrActionsConfig = {
  link: string;
  storeName: string;
  displayPhoneNumber?: string;
  onAction?: (action: TWhatsappBotShareAction) => void;
};

export type TWhatsappBotPosterConfig = {
  qrCanvas: HTMLCanvasElement;
  storeName: string;
  displayPhoneNumber?: string;
  fontFamily: string;
};

export type TWhatsappBotFileKind = 'qr-code' | 'cartaz';
