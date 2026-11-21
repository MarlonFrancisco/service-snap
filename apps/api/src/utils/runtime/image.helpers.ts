import { getWorkerBinding } from './worker-env';

/** Parte do binding de Images da Cloudflare usada aqui. */
interface IImagesBinding {
  input(stream: ReadableStream<Uint8Array>): {
    output(options: { format: string; quality?: number }): Promise<{
      response(): Response;
    }>;
  };
}

/**
 * Converte a imagem enviada para WebP. No Worker o `sharp` (binário nativo)
 * não carrega: usa o binding `IMAGES`. Em Node segue com o `sharp`.
 */
export async function convertToWebp(input: Buffer): Promise<Buffer> {
  const images = getWorkerBinding<IImagesBinding>('IMAGES');

  if (images) {
    const result = await images
      .input(new Blob([new Uint8Array(input)]).stream())
      .output({ format: 'image/webp' });
    return Buffer.from(await result.response().arrayBuffer());
  }

  const { default: sharp } = await import('sharp');
  return sharp(input).webp().toBuffer();
}
