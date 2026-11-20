export type TWhatsappConsentStatus = 'granted' | 'revoked';

/** Onde o cliente aceitou: caixa no checkout, conversa com o bot ou perfil. */
export type TWhatsappConsentSource = 'checkout' | 'bot' | 'profile';

/** Como saiu: respondeu PARAR, abriu o link do e-mail, no checkout ou no perfil. */
export type TWhatsappConsentRevokedVia =
  | 'reply'
  | 'link'
  | 'checkout'
  | 'profile';

export type TWhatsappConsentText = { version: string; text: string };

export type TWhatsappConsentState = {
  status: TWhatsappConsentStatus | null;
  grantedAt: Date | null;
  textVersion: string | null;
};

export type TWhatsappConsentGrant = {
  storeId: string;
  customerId: string;
  phone: string;
  source: TWhatsappConsentSource;
  textVersion: string;
};

export type TWhatsappOptOutSubject = { storeId: string; customerId: string };
