import { CONTACT_EMAIL } from '@/utils/constants/site.constants';
import { SOCIAL_PROFILE_URLS } from '@/utils/constants/social-profiles.constants';
import { TContactAddress, TSocialLink } from '@/types/layout/contact.types';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

/** Public contact — only verified channels. */
export const PUBLIC_CONTACT_EMAIL = CONTACT_EMAIL;

export { SOCIAL_PROFILE_URLS };

/** Official ServiceSnap profiles (verified URLs only). */
export const SOCIAL_LINKS: TSocialLink[] = [
  {
    href: SOCIAL_PROFILE_URLS[0],
    label: 'Instagram',
    icon: Instagram,
  },
  {
    href: SOCIAL_PROFILE_URLS[1],
    label: 'X (Twitter)',
    icon: Twitter,
  },
  {
    href: SOCIAL_PROFILE_URLS[2],
    label: 'Facebook',
    icon: Facebook,
  },
  {
    href: SOCIAL_PROFILE_URLS[3],
    label: 'LinkedIn',
    icon: Linkedin,
  },
];

export const CONTACT_ADDRESSES: TContactAddress[] = [];
