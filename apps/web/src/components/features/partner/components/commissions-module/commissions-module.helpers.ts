import type {
  ICommissionLine,
  ICommissionReport,
  ICommissionRule,
  TCommissionBaseSource,
  TCommissionType,
} from '@/types/api/commissions.types';
import {
  addDaysToDateKey,
  formatDateKey,
  formatShortDateKey,
  toDateKey,
} from '../cash-module/cash-module.helpers';
import type { TFormatMoney } from '../cash-module/cash-module.types';
import type {
  TChipTone,
  TCommissionKpi,
  TCommissionLineRow,
  TCommissionRuleGroups,
  TCommissionRuleItem,
  TCommissionsPeriod,
} from './commissions-module.types';

/** O relatório aceita até um ano por consulta. */
export const MAX_REPORT_DAYS = 366;

export const MAX_FIXED_COMMISSION = 100_000;

/** Primeiro e último dia do mês, `offset` meses a partir do atual. */
export const getMonthPeriod = (offset = 0): TCommissionsPeriod => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const last = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);

  return { from: toDateKey(first), to: toDateKey(last) };
};

export const getPeriodDays = ({ from, to }: TCommissionsPeriod) =>
  (Date.parse(to) - Date.parse(from)) / 86_400_000;

/** Mensagem do período inválido, ou `null` quando dá para consultar. */
export const getPeriodError = (period: TCommissionsPeriod) => {
  if (!period.from || !period.to) return 'Escolha o início e o fim do período.';

  const days = getPeriodDays(period);

  if (Number.isNaN(days)) return 'Escolha o início e o fim do período.';
  if (days < 0) return 'O fim do período vem depois do início.';
  if (days > MAX_REPORT_DAYS) return 'Escolha um período de até um ano.';

  return null;
};

/** "40%" ou "12,5%". */
const formatPercent = (value: number) =>
  `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;

/** "40%" ou "R$ 10,00 fixo". */
export const formatRuleValue = (
  type: TCommissionType | null,
  value: number | null,
  formatMoney: TFormatMoney,
) => {
  if (type === null || value === null) return 'Sem regra';

  return type === 'percent'
    ? formatPercent(value)
    : `${formatMoney(value)} fixo`;
};

export const BASE_SOURCE_BADGE: Record<
  TCommissionBaseSource,
  { label: string; tone: TChipTone }
> = {
  checkout: { label: 'Recebido', tone: 'ok' },
  package: { label: 'Sessão do pacote', tone: 'info' },
  price: { label: 'Preço reservado', tone: 'neutral' },
};

export const toCommissionLineRow = (
  line: ICommissionLine,
  formatMoney: TFormatMoney,
): TCommissionLineRow => ({
  id: line.scheduleId,
  day: formatShortDateKey(line.date),
  serviceName: line.serviceName,
  customerName: line.customerName,
  professionalName: line.professionalName,
  base: formatMoney(line.baseAmount),
  source: BASE_SOURCE_BADGE[line.baseSource],
  rule: formatRuleValue(line.ruleType, line.ruleValue, formatMoney),
  commission: formatMoney(line.commission),
});

export const getCommissionKpis = (
  totals: ICommissionReport['totals'] | undefined,
  formatMoney: TFormatMoney,
): TCommissionKpi[] => [
  { label: 'Atendimentos', value: String(totals?.attendances ?? 0) },
  { label: 'Base', value: formatMoney(totals?.baseTotal ?? 0) },
  { label: 'Comissões', value: formatMoney(totals?.commissionTotal ?? 0) },
];

/** "Padrão da loja", "Ana", "Barba" ou "Ana · Barba". */
export const getRuleScopeLabel = (rule: ICommissionRule) =>
  [rule.storeMember?.name, rule.service?.name].filter(Boolean).join(' · ') ||
  'Padrão da loja';

const getRuleScopeKey = (rule: ICommissionRule) =>
  `${rule.storeMember?.id ?? '*'}|${rule.service?.id ?? '*'}`;

/** Padrão da loja primeiro; depois profissional, serviço e os dois juntos. */
const getScopeOrder = (rule: ICommissionRule) =>
  (rule.storeMember ? 1 : 0) + (rule.service ? 2 : 0);

/**
 * Versões por alcance (profissional e serviço): a vigente é a mais recente até
 * hoje, as de data futura ainda podem ser apagadas, e as anteriores ficam no
 * histórico com a data em que foram substituídas.
 */
export const groupCommissionRules = (
  rules: ICommissionRule[],
  today: string,
  formatMoney: TFormatMoney,
): TCommissionRuleGroups => {
  const byScope = new Map<string, ICommissionRule[]>();

  for (const rule of rules) {
    const key = getRuleScopeKey(rule);
    byScope.set(key, [...(byScope.get(key) ?? []), rule]);
  }

  const scopes = [...byScope.values()].sort(
    (a, b) => getScopeOrder(a[0]!) - getScopeOrder(b[0]!),
  );
  const active: TCommissionRuleItem[] = [];
  const previous: TCommissionRuleItem[] = [];

  for (const versions of scopes) {
    const sorted = [...versions].sort((a, b) =>
      b.effectiveFrom.localeCompare(a.effectiveFrom),
    );
    const future = sorted.filter((rule) => rule.effectiveFrom > today);
    const started = sorted.filter((rule) => rule.effectiveFrom <= today);
    const toTitle = (rule: ICommissionRule) =>
      `${getRuleScopeLabel(rule)} · ${formatRuleValue(rule.type, rule.value, formatMoney)}`;

    const [current, ...older] = started;

    if (current) {
      active.push({
        id: current.id,
        title: toTitle(current),
        description: `Desde ${formatDateKey(current.effectiveFrom)}${current.type === 'fixed' ? ', por atendimento' : ''}`,
        status: 'current',
      });
    }

    active.push(
      ...[...future].reverse().map(
        (rule): TCommissionRuleItem => ({
          id: rule.id,
          title: toTitle(rule),
          description: `A partir de ${formatDateKey(rule.effectiveFrom)}`,
          status: 'future',
        }),
      ),
    );

    previous.push(
      ...older.map((rule, index): TCommissionRuleItem => {
        const replacedBy = index === 0 ? current : older[index - 1];

        return {
          id: rule.id,
          title: toTitle(rule),
          description: replacedBy
            ? `De ${formatDateKey(rule.effectiveFrom)} a ${formatDateKey(addDaysToDateKey(replacedBy.effectiveFrom, -1))}`
            : `Desde ${formatDateKey(rule.effectiveFrom)}`,
          status: 'previous',
        };
      }),
    );
  }

  return { active, previous };
};
