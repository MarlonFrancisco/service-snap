/**
 * URL pública do bucket do R2 do ambiente (ssnap-production / ssnap-development).
 * Os arquivos ficam em pastas: `stores/` para fotos de loja e `users/` para avatares.
 */
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, '');

const isAbsoluteSrc = (src: string) => /^(https?:|data:|blob:)/.test(src);

const buildUrl = (folder: 'stores' | 'users', path: string) =>
  CDN_URL ? `${CDN_URL}/${folder}/${path.replace(/^\/+/, '')}` : undefined;

/** Monta a URL de uma foto de loja a partir da chave salva no banco. */
export const getStoreImageUrl = (path?: string | null): string | undefined => {
  if (!path?.trim()) return undefined;
  if (isAbsoluteSrc(path)) return path;

  return buildUrl('stores', path);
};

/**
 * Monta a URL do avatar. A API salva `/users/<id>/avatar.webp`; o prefixo sai
 * aqui e volta como pasta. URLs absolutas (ex.: foto do Google) passam direto.
 */
export const getUserAvatarUrl = (avatar?: string | null): string | undefined => {
  if (!avatar?.trim()) return undefined;
  if (isAbsoluteSrc(avatar)) return avatar;

  return buildUrl('users', avatar.replace(/^\/?users\//, ''));
};
