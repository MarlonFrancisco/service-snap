export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://ssnap.io';

export const SITE_NAME = 'ServiceSnap';

export const CONTACT_EMAIL = 'general@ssnap.io';

/** Privacy / LGPD contact — same domain as public contact. */
export const PRIVACY_EMAIL = 'privacy@ssnap.io';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;
