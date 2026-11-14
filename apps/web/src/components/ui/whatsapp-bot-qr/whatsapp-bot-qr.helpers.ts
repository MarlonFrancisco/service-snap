import { slugify } from '@/utils/helpers/slug.helper';
import { WHATSAPP_BOT_POSTER } from './whatsapp-bot-qr.constants';
import type {
  TWhatsappBotFileKind,
  TWhatsappBotPosterConfig,
} from './whatsapp-bot-qr.types';

/** "https://wa.me/55...?text=Ol%C3%A1!" → "wa.me/55...?text=Olá!", como o parceiro lê. */
export const formatWhatsappBotLinkLabel = (link: string): string => {
  const withoutProtocol = link.replace(/^https?:\/\//, '');
  try {
    return decodeURIComponent(withoutProtocol);
  } catch {
    return withoutProtocol;
  }
};

export const getWhatsappBotFileName = (
  storeName: string,
  kind: TWhatsappBotFileKind,
): string => `${slugify(storeName) || 'loja'}-whatsapp-${kind}.png`;

/** Quebra o texto em linhas que cabem em `maxWidth`; a última leva reticências se sobrar. */
export const wrapCanvasText = (
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines = words.reduce<string[]>((acc, word) => {
    const current = acc.at(-1);
    const candidate = current ? `${current} ${word}` : word;
    if (
      current !== undefined &&
      context.measureText(candidate).width > maxWidth
    ) {
      return [...acc, word];
    }
    return [...acc.slice(0, -1), candidate];
  }, []);

  if (lines.length <= maxLines) return lines;

  const ellipsize = (value: string): string =>
    value.length === 0 || context.measureText(`${value}…`).width <= maxWidth
      ? `${value.trimEnd()}…`
      : ellipsize(value.slice(0, -1));

  const visible = lines.slice(0, maxLines);
  return [...visible.slice(0, -1), ellipsize(visible.at(-1) ?? '')];
};

type TPosterBlock = {
  lines: string[];
  font: string;
  color: string;
  lineHeight: number;
  gapAfter: number;
};

/** Monta o cartaz para imprimir: nome da loja, chamada, QR grande e número. */
export const drawWhatsappBotPoster = ({
  qrCanvas,
  storeName,
  displayPhoneNumber,
  fontFamily,
}: TWhatsappBotPosterConfig): HTMLCanvasElement => {
  const { width, height, sidePadding, qrBoxSize, qrBoxPadding, qrBoxRadius } =
    WHATSAPP_BOT_POSTER;
  const { colors, texts } = WHATSAPP_BOT_POSTER;
  const contentWidth = width - sidePadding * 2;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D indisponível');

  const measureBlock = (
    text: string,
    font: string,
    maxLines: number,
  ): string[] => {
    context.font = font;
    return wrapCanvasText(context, text, contentWidth, maxLines);
  };

  const nameFont = `700 60px ${fontFamily}`;
  const titleFont = `800 96px ${fontFamily}`;
  const instructionFont = `500 38px ${fontFamily}`;
  const phoneFont = `800 64px ${fontFamily}`;
  const footerFont = `500 34px ${fontFamily}`;

  const headerBlocks: TPosterBlock[] = [
    {
      lines: measureBlock(storeName, nameFont, 2),
      font: nameFont,
      color: colors.text,
      lineHeight: 76,
      gapAfter: 28,
    },
    {
      lines: measureBlock(texts.title, titleFont, 2),
      font: titleFont,
      color: colors.text,
      lineHeight: 108,
      gapAfter: 20,
    },
    {
      lines: measureBlock(texts.instruction, instructionFont, 2),
      font: instructionFont,
      color: colors.muted,
      lineHeight: 50,
      gapAfter: 64,
    },
  ];

  const footerBlocks: TPosterBlock[] = [
    ...(displayPhoneNumber
      ? [
          {
            lines: [displayPhoneNumber],
            font: phoneFont,
            color: colors.text,
            lineHeight: 78,
            gapAfter: 18,
          },
        ]
      : []),
    {
      lines: measureBlock(texts.footer, footerFont, 2),
      font: footerFont,
      color: colors.muted,
      lineHeight: 46,
      gapAfter: 0,
    },
  ];

  const blockHeight = (block: TPosterBlock) =>
    block.lines.length * block.lineHeight + block.gapAfter;
  const qrGapAfter = 64;
  const contentHeight =
    headerBlocks.reduce((sum, block) => sum + blockHeight(block), 0) +
    qrBoxSize +
    qrGapAfter +
    footerBlocks.reduce((sum, block) => sum + blockHeight(block), 0);

  context.fillStyle = colors.background;
  context.fillRect(0, 0, width, height);
  context.textAlign = 'center';
  context.textBaseline = 'top';

  const drawBlock = (block: TPosterBlock, top: number): number => {
    context.font = block.font;
    context.fillStyle = block.color;
    block.lines.forEach((line, index) => {
      context.fillText(line, width / 2, top + index * block.lineHeight);
    });
    return top + blockHeight(block);
  };

  const startY = Math.max(sidePadding / 2, (height - contentHeight) / 2);
  const qrTop = headerBlocks.reduce(
    (top, block) => drawBlock(block, top),
    startY,
  );

  const qrLeft = (width - qrBoxSize) / 2;
  context.fillStyle = colors.background;
  context.strokeStyle = colors.border;
  context.lineWidth = 4;
  context.beginPath();
  context.roundRect(qrLeft, qrTop, qrBoxSize, qrBoxSize, qrBoxRadius);
  context.fill();
  context.stroke();

  const qrSize = qrBoxSize - qrBoxPadding * 2;
  context.imageSmoothingEnabled = false;
  context.drawImage(
    qrCanvas,
    qrLeft + qrBoxPadding,
    qrTop + qrBoxPadding,
    qrSize,
    qrSize,
  );

  footerBlocks.reduce(
    (top, block) => drawBlock(block, top),
    qrTop + qrBoxSize + qrGapAfter,
  );

  return canvas;
};
