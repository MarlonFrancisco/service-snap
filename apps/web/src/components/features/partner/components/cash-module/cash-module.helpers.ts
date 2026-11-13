import { isApiHttpError } from '@/service/api';
import type {
  IStorePayment,
  TPaymentMethod,
  TPaymentTotals,
} from '@/types/api/cash.types';
import type { IProfessional } from '@/types/api/users.types';
import type {
  TFormatMoney,
  TMemberNames,
  TPaymentMethodLabels,
} from './cash-module.types';

export const PAYMENT_METHOD_OPTIONS: readonly TPaymentMethod[] = [
  'pix',
  'cash',
  'credit_card',
  'debit_card',
  'other',
];

export const PAYMENT_METHOD_LABEL: TPaymentMethodLabels = {
  cash: 'Dinheiro',
  pix: 'PIX',
  credit_card: 'Cartão de crédito',
  debit_card: 'Cartão de débito',
  other: 'Outro',
};

/** Rótulos curtos dos totais do caixa. */
export const PAYMENT_METHOD_SHORT_LABEL: TPaymentMethodLabels = {
  cash: 'Dinheiro',
  pix: 'PIX',
  credit_card: 'Crédito',
  debit_card: 'Débito',
  other: 'Outro',
};

/** Ordem dos totais na tela do caixa. */
export const PAYMENT_TOTALS_ORDER: readonly TPaymentMethod[] = [
  'cash',
  'pix',
  'credit_card',
  'debit_card',
  'other',
];

export const MAX_MONEY_VALUE = 1_000_000;

export const roundMoney = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const sumMoney = (values: number[]) =>
  roundMoney(values.reduce((total, value) => total + value, 0));

/**
 * Lê o valor digitado em reais: "R$ 1.234,56", "12,5" ou "12.50". Vazio ou
 * texto que não é número volta `null`.
 */
export const parseMoneyInput = (value: string): number | null => {
  const cleaned = value.replace(/[^\d,.-]/g, '');

  if (!cleaned) return null;

  const normalized = cleaned.includes(',')
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned;
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? roundMoney(parsed) : null;
};

/** Valor para preencher um campo de dinheiro: "12,50". */
export const toMoneyInput = (value: number) =>
  value > 0 ? value.toFixed(2).replace('.', ',') : '';

/** Campo de dinheiro opcional: vazio vale zero; texto inválido não passa. */
export const isValidMoneyInput = (value: string, { required = false } = {}) => {
  if (!value.trim()) return !required;

  const parsed = parseMoneyInput(value);

  return parsed !== null && parsed >= 0 && parsed <= MAX_MONEY_VALUE;
};

/** `YYYY-MM-DD` do dia local, sem passar por UTC. */
export const toDateKey = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
};

export const addDaysToDateKey = (key: string, days: number) => {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year ?? 1970, (month ?? 1) - 1, (day ?? 1) + days);

  return toDateKey(date);
};

/** "08:00" no fuso de quem está vendo. */
export const formatClock = (iso: string | null | undefined) => {
  const date = iso ? new Date(iso) : null;

  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '';
};

/** "12/11 às 08:00". */
export const formatDayAndClock = (iso: string | null | undefined) => {
  const date = iso ? new Date(iso) : null;

  if (!date || Number.isNaN(date.getTime())) return '';

  const day = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });

  return `${day} às ${formatClock(iso)}`;
};

/** `YYYY-MM-DD` para `dd/mm/aaaa`, sem passar por `Date`. */
export const formatDateKey = (key: string | null | undefined) => {
  const [year, month, day] = (key ?? '').slice(0, 10).split('-');

  return year && month && day ? `${day}/${month}/${year}` : '';
};

/** `YYYY-MM-DD` para `dd/mm`. */
export const formatShortDateKey = (key: string | null | undefined) =>
  formatDateKey(key).slice(0, 5);

export const getPersonName = (
  person: { firstName?: string | null; lastName?: string | null } | null,
) => [person?.firstName, person?.lastName].filter(Boolean).join(' ').trim();

/** Nome de quem é da equipe pelo id do usuário. */
export const buildMemberNames = (
  members: IProfessional[] | undefined,
): TMemberNames =>
  Object.fromEntries(
    (members ?? [])
      .filter((member) => member.user?.id)
      .map((member) => [
        member.user.id,
        getPersonName(member.user) || 'Equipe',
      ]),
  );

export const getMemberName = (
  names: TMemberNames,
  userId: string | null | undefined,
) => (userId && names[userId]) || 'Equipe';

/** De onde veio o pagamento: fechamento, venda de pacote ou avulso. */
export const getPaymentOrigin = (payment: IStorePayment) => {
  if (payment.checkout) return 'Atendimento';
  if (payment.customerPackage) return `Pacote ${payment.customerPackage.name}`;

  return 'Avulso';
};

/** Linha da tabela de pagamentos, com dia quando o período tem mais de um. */
export const toPaymentRow = (
  payment: IStorePayment,
  memberNames: TMemberNames,
  formatMoney: TFormatMoney,
  { withDay = false } = {},
) => ({
  id: payment.id,
  time: withDay
    ? formatDayAndClock(payment.paidAt)
    : formatClock(payment.paidAt),
  customer: getPersonName(payment.customer) || 'Sem cliente',
  origin: getPaymentOrigin(payment),
  method: PAYMENT_METHOD_LABEL[payment.method],
  amount: formatMoney(payment.amount),
  registeredBy: getMemberName(memberNames, payment.registeredById),
  isVoided: !!payment.voidedAt,
  voidReason: payment.voidReason,
  payment,
});

/** "– R$ 5,00", "+ R$ 2,00" ou "R$ 0,00". */
export const formatSignedMoney = (value: number, formatMoney: TFormatMoney) => {
  if (value === 0) return formatMoney(0);

  return `${value < 0 ? '–' : '+'} ${formatMoney(Math.abs(value))}`;
};

/** Falta na gaveta pede atenção; sobra só informa. */
export const getDifferenceTone = (value: number | null) => {
  if (value === null) return 'neutral' as const;
  if (value === 0) return 'ok' as const;

  return value < 0 ? ('warning' as const) : ('info' as const);
};

/** Contado menos esperado, quando o caixa já foi fechado. */
export const getCashDifference = (session: {
  countedCash: number | null;
  expectedCash: number | null;
}) =>
  session.countedCash !== null && session.expectedCash !== null
    ? sumMoney([session.countedCash, -session.expectedCash])
    : null;

/** Soma dos totais gravados no fechamento. */
export const sumPaymentTotals = (totals: TPaymentTotals | null) =>
  totals ? sumMoney(Object.values(totals)) : null;

export const getErrorStatus = (error: unknown) =>
  isApiHttpError(error) ? error.status : null;

/** Mensagem que a API mandou, para casar com os textos conhecidos. */
export const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : '';
