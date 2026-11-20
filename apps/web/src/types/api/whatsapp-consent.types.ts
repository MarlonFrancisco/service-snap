export type TWhatsappOptOutLink = {
  storeName: string;
  optedOut: boolean;
};

export type TWhatsappConsentText = {
  version: string;
  text: string;
};

export type TWhatsappConsentState = {
  status: 'granted' | 'revoked' | null;
  grantedAt: string | null;
  textVersion: string | null;
};
