/** Rota que o QStash chama de volta, fora de /partner e sem JWT. */
export const QUEUE_PATH = '/queue/jobs';
/** Tentativas além da primeira; o QStash espera cada vez mais entre elas. */
export const QUEUE_RETRIES = 3;
/** Limite de mensagens por chamada de lote do QStash. */
export const QSTASH_BATCH_SIZE = 100;

/** Repartir em lotes para as chamadas ao QStash. */
export const chunk = <T>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size),
  );

export const readRawBody = (body: unknown) =>
  Buffer.isBuffer(body) ? body.toString('utf8') : String(body ?? '');
