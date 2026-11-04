export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://ssnap.io';

export const SITE_NAME = 'ServiceSnap';

/** Título e descrição da home; o layout e o JSON-LD usam os mesmos. */
export const SITE_TITLE = 'ServiceSnap — Agende serviços perto de você';
export const SITE_DESCRIPTION =
  'Encontre profissionais e agende serviços perto de você: beleza, bem-estar, saúde, pets, aulas e muito mais. Veja os horários livres e confirme na hora.';

export const CONTACT_EMAIL = 'general@ssnap.io';

export const DEFAULT_OG_IMAGE = '/og-image.png';
export const THEME_COLOR = '#9810fa';
