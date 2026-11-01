import type { TLegalTab } from './legal-document.types';

export const LEGAL_TABS: { id: TLegalTab; href: string; label: string }[] = [
  { id: 'terms', href: '/terms', label: 'Termos de serviço' },
  { id: 'privacy', href: '/privacy', label: 'Política de privacidade' },
];

/** Tipografia do texto jurídico, aplicada aos elementos sem alterar o conteúdo. */
export const LEGAL_BODY_CLASS =
  '[&_a]:font-semibold [&_a]:underline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-[#0B0B0F] [&_h3]:mt-6 [&_h3]:text-[17px] [&_h3]:font-bold [&_h3]:tracking-[-0.01em] [&_li]:mb-1.5 [&_li]:text-base [&_li]:leading-[1.7] [&_li]:text-[#2C2A36] [&_ol]:mt-2.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-2.5 [&_p]:text-base [&_p]:leading-[1.7] [&_p]:text-[#2C2A36] [&_strong]:font-bold [&_ul]:mt-2.5 [&_ul]:list-disc [&_ul]:pl-5';

/** Destaque dos parágrafos "Importante:". */
export const LEGAL_NOTE_CLASS =
  'mt-4! rounded-[14px] bg-[#F7F6FA] px-[18px] py-4';

/** Lista de contato, sem marcadores. */
export const LEGAL_PLAIN_LIST_CLASS = 'list-none! pl-0!';
