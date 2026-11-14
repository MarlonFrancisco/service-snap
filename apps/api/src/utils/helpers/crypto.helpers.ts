import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'crypto';

const CIPHER = 'aes-256-gcm';
const CIPHER_VERSION = 'v1';
const IV_BYTES = 12;

/** Chave de 32 bytes em base64 (`openssl rand -base64 32`). */
export const parseEncryptionKey = (value?: string | null): Buffer | null => {
  if (!value) return null;

  const key = Buffer.from(value, 'base64');

  return key.length === 32 ? key : null;
};

/**
 * AES-256-GCM: além de cifrar, autentica. Um valor alterado no banco falha ao
 * decifrar em vez de virar texto errado. Formato `v1:iv:tag:dados` em base64.
 */
export const encryptText = (plain: string, key: Buffer): string => {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(CIPHER, key, iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);

  return [
    CIPHER_VERSION,
    iv.toString('base64'),
    cipher.getAuthTag().toString('base64'),
    data.toString('base64'),
  ].join(':');
};

export const decryptText = (payload: string, key: Buffer): string => {
  const [version, iv, tag, data] = payload.split(':');

  if (version !== CIPHER_VERSION || !iv || !tag || data === undefined) {
    throw new Error('Unsupported encrypted payload');
  }

  const decipher = createDecipheriv(CIPHER, key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(data, 'base64')),
    decipher.final(),
  ]).toString('utf8');
};

/** Para guardar segredo que só precisa ser conferido (chave de API). */
export const hashToken = (value: string): string =>
  createHash('sha256').update(value).digest('hex');

/** Texto aleatório seguro para URL. */
export const generateToken = (bytes = 32): string =>
  randomBytes(bytes).toString('base64url');

export const signHmac = (secret: string, payload: string): string =>
  createHmac('sha256', secret).update(payload).digest('hex');

/** Comparação em tempo constante, para a resposta não vazar quanto acertou. */
export const safeEqual = (a: string, b: string): boolean => {
  const left = createHash('sha256').update(a).digest();
  const right = createHash('sha256').update(b).digest();

  return timingSafeEqual(left, right);
};

/**
 * Token assinado e com validade, para links sem login (anamnese, descadastro).
 * `assunto.expiraEm.assinatura`; o assunto não pode ter ponto.
 */
export const createSignedToken = (
  secret: string,
  subject: string,
  expiresAt: Date,
): string => {
  const body = `${subject}.${Math.floor(expiresAt.getTime() / 1000)}`;

  return `${body}.${signHmac(secret, body).slice(0, 32)}`;
};

/** Assunto do token se a assinatura confere e ainda vale; senão `null`. */
export const readSignedToken = (
  secret: string,
  token: string,
  now = new Date(),
): string | null => {
  const [subject, expires, signature] = token?.split('.') ?? [];

  if (!subject || !expires || !signature) return null;

  const expected = signHmac(secret, `${subject}.${expires}`).slice(0, 32);

  if (!safeEqual(signature, expected)) return null;
  if (Number(expires) * 1000 < now.getTime()) return null;

  return subject;
};
