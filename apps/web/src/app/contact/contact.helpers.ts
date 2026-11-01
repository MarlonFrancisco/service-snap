import { PUBLIC_CONTACT_EMAIL } from '@/utils/constants/contact.constants';
import type { TContactForm } from './contact.types';

export const buildContactMailto = ({
  name,
  email,
  subject,
  message,
}: TContactForm): string => {
  const lines = [
    name && `Nome: ${name}`,
    email && `E-mail: ${email}`,
    '',
    message,
  ];

  const mailto = new URL(`mailto:${PUBLIC_CONTACT_EMAIL}`);
  mailto.searchParams.set('subject', subject.trim() || 'Contato via ssnap.io');
  mailto.searchParams.set('body', lines.join('\n'));

  return mailto.toString();
};
