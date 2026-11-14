import { generateToken } from '../../../../utils/helpers/crypto.helpers';

export const API_KEY_PREFIX = 'ssk_';

/** `ssk_<8 do prefixo>_<segredo>`: o prefixo aparece na tela, o resto não. */
export const generateApiKey = () => {
  const prefix = `${API_KEY_PREFIX}${generateToken(6).slice(0, 8)}`;

  return { prefix, key: `${prefix}_${generateToken(32)}` };
};

/** Aceita `Authorization: Bearer ssk_...` ou `X-Api-Key: ssk_...`. */
export const readApiKey = (headers: Record<string, unknown>): string | null => {
  const header = headers['x-api-key'] ?? headers.authorization;
  const value = Array.isArray(header) ? header[0] : header;

  if (typeof value !== 'string') return null;

  const key = value.replace(/^Bearer\s+/i, '').trim();

  return key.startsWith(API_KEY_PREFIX) ? key : null;
};
