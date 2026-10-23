import { CONTACT_EMAIL } from '@/utils/constants/site.constants';
import { TContactAddress, TSocialLink } from '@/types/layout/contact.types';

/** Public contact — only verified channels. */
export const PUBLIC_CONTACT_EMAIL = CONTACT_EMAIL;

/** Empty until real profiles exist (avoids `#` / 404 links in the UI). */
export const SOCIAL_LINKS: TSocialLink[] = [];

export const CONTACT_ADDRESSES: TContactAddress[] = [];
