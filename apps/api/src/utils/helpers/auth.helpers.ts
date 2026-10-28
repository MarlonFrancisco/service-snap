import * as crypto from 'crypto';

export const generateAuthCode = () => {
  // 1. Gera bytes aleatórios:
  //    3 bytes aleatórios são suficientes para um número de até 6 dígitos.
  const bytes = crypto.randomBytes(3);

  // 2. Converte os bytes para um inteiro:
  //    O .readUIntBE(0, 3) lê os 3 bytes como um inteiro sem sinal.
  const numInteger = bytes.readUIntBE(0, 3);

  // 3. Garante que o número tenha 6 dígitos:
  const code = (numInteger % 1000000).toString().padStart(6, '0');

  // 4. Calcula o tempo de expiração (20 minutos a partir de agora):
  const expiresIn = new Date(Date.now() + 20 * 60 * 1000);

  return { code, expiresIn };
};

export const getAccessTokenFromCookie = (cookie: string) => {
  return cookie
    ?.split('; ')
    ?.find((cookie) => cookie.includes('access_token'))
    ?.split('=')[1];
};

/** Short uppercase referral code (e.g. SNAP7K2Q). */
export const generateReferralCode = (length = 8): string => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += alphabet[bytes[i]! % alphabet.length];
  }
  return code;
};
