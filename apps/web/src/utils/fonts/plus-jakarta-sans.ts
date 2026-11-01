import localFont from 'next/font/local';

// Fonte variável no repositório: o build não depende da resposta do Google Fonts.
export const plusJakartaSans = localFont({
  src: './PlusJakartaSans-latin.woff2',
  weight: '200 800',
  display: 'swap',
});
