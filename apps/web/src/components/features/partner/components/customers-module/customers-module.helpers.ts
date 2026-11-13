import type { IStoreCustomer } from '@/types/api/customers.types';
import { generateWhatsAppLink } from '@/utils/helpers/whatsapp.helper';
import type { TCountryCode } from '@repo/shared/constants';
import { formatPhone, getPhoneCode } from '@repo/shared/validators';
import type {
  TAppointmentStatusBadgeMap,
  TCustomerContactLines,
  TPageMeta,
} from './customers-module.types';

type TCustomerIdentity = Pick<
  IStoreCustomer,
  'firstName' | 'lastName' | 'email' | 'telephone'
>;

export const CUSTOMERS_PAGE_SIZE = 20;
export const CUSTOMER_HISTORY_PAGE_SIZE = 10;
export const MAX_CUSTOMER_TAGS = 10;
export const MAX_CUSTOMER_TAG_LENGTH = 30;
export const MAX_CUSTOMER_NOTES_LENGTH = 2000;
/** Quantas etiquetas cabem na linha da tabela antes do "+N". */
export const CUSTOMER_ROW_TAGS = 2;

export const getCustomerName = ({ firstName, lastName }: TCustomerIdentity) =>
  [firstName, lastName].filter(Boolean).join(' ').trim() || 'Cliente sem nome';

/** Telefone do país da loja sai com a máscara; de outro país, como veio. */
export const formatCustomerPhone = (
  telephone: string | null | undefined,
  country: TCountryCode = 'BR',
) => {
  if (!telephone) return '';

  const phoneCode = getPhoneCode(country).replace('+', '');
  const digits = telephone.replace(/\D/g, '');

  if (!digits.startsWith(phoneCode)) return telephone;

  return formatPhone(telephone, country) || telephone;
};

/** Linha principal e secundária do contato, como na tabela. */
export const getCustomerContactLines = (
  customer: TCustomerIdentity,
  country?: TCountryCode,
): TCustomerContactLines => {
  const phone = formatCustomerPhone(customer.telephone, country);

  if (phone) {
    return { primary: phone, secondary: customer.email || 'Sem e-mail' };
  }

  return {
    primary: customer.email || 'Sem contato',
    secondary: 'Sem telefone',
  };
};

/** Contato em uma linha só: "telefone · e-mail". */
export const getCustomerContactSummary = (
  customer: TCustomerIdentity,
  country?: TCountryCode,
) =>
  [formatCustomerPhone(customer.telephone, country), customer.email]
    .filter(Boolean)
    .join(' · ') || 'Sem contato';

/** `YYYY-MM-DD` para `dd/mm/aaaa`, sem passar por `Date` (fuso não muda o dia). */
export const formatDay = (day: string | null | undefined) => {
  const [year, month, date] = (day ?? '').slice(0, 10).split('-');

  return year && month && date ? `${date}/${month}/${year}` : '';
};

export const getCustomerWhatsappLink = (
  telephone: string | null | undefined,
) =>
  telephone && telephone.replace(/\D/g, '').length >= 8
    ? generateWhatsAppLink(telephone)
    : null;

/** "1–20 de 57" do rodapé das listas. */
export const formatPageRange = (meta: TPageMeta | undefined, size: number) => {
  if (!meta || meta.total === 0) return '0 de 0';

  const first = (meta.page - 1) * size + 1;
  const last = Math.min(meta.page * size, meta.total);

  return `${first}–${last} de ${meta.total}`;
};

export const formatCustomersCount = (total: number) =>
  `${total} ${total === 1 ? 'cliente' : 'clientes'}`;

export const APPOINTMENT_STATUS_BADGE: TAppointmentStatusBadgeMap = {
  scheduled: { label: 'Agendado', className: 'bg-[#E4ECF6] text-[#143C66]' },
  completed: { label: 'Concluído', className: 'bg-[#DFF2E7] text-[#0A5536]' },
  'no-show': {
    label: 'Não compareceu',
    className: 'bg-[#FBE8D9] text-[#7A3B00]',
  },
  cancelled: { label: 'Cancelado', className: 'bg-[#F4F3F7] text-[#5F5C6E]' },
};

/** Etiqueta limpa e que ainda não está na lista (sem diferenciar caixa). */
export const normalizeNewTag = (value: string, tags: string[]) => {
  const tag = value
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, MAX_CUSTOMER_TAG_LENGTH);
  const exists = tags.some((item) => item.toLowerCase() === tag.toLowerCase());

  return tag && !exists ? tag : null;
};
