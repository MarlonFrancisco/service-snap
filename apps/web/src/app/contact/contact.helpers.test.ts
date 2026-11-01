import { describe, expect, it } from 'vitest';
import { PUBLIC_CONTACT_EMAIL } from '@/utils/constants/contact.constants';
import { buildContactMailto } from './contact.helpers';

const FORM = {
  name: 'Ana',
  email: 'ana@example.com',
  subject: 'Dúvida',
  message: 'Olá',
};

describe('buildContactMailto', () => {
  it('monta destinatário, assunto e corpo a partir do formulário', () => {
    const url = new URL(buildContactMailto(FORM));

    expect(url.protocol).toBe('mailto:');
    expect(url.pathname).toBe(PUBLIC_CONTACT_EMAIL);
    expect(url.searchParams.get('subject')).toBe('Dúvida');
    expect(url.searchParams.get('body')).toBe(
      'Nome: Ana\nE-mail: ana@example.com\n\nOlá',
    );
  });

  it('usa o assunto padrão quando o assunto está vazio', () => {
    const url = new URL(buildContactMailto({ ...FORM, subject: '   ' }));

    expect(url.searchParams.get('subject')).toBe('Contato via ssnap.io');
  });
});
