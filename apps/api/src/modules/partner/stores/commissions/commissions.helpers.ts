import { roundMoney, sumMoney } from '../../../../utils/helpers/money.helpers';
import type {
  TCommissionLine,
  TCommissionReport,
  TCommissionRuleRef,
  TCommissionSource,
} from './commissions.types';

/** Do mais específico ao padrão da loja. */
const SPECIFICITY: Array<
  (rule: TCommissionRuleRef, s: TCommissionSource) => boolean
> = [
  (rule, s) =>
    rule.storeMemberId === s.storeMemberId && rule.serviceId === s.serviceId,
  (rule, s) => rule.storeMemberId === s.storeMemberId && !rule.serviceId,
  (rule, s) => !rule.storeMemberId && rule.serviceId === s.serviceId,
  (rule) => !rule.storeMemberId && !rule.serviceId,
];

/**
 * Regra que valia na data do atendimento. Num mesmo nível, a versão mais
 * recente até aquela data; um nível sem versão vigente passa para o seguinte.
 */
export const resolveCommissionRule = (
  rules: TCommissionRuleRef[],
  source: TCommissionSource,
): TCommissionRuleRef | null => {
  for (const matches of SPECIFICITY) {
    const current = rules
      .filter(
        (rule) => rule.effectiveFrom <= source.date && matches(rule, source),
      )
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];

    if (current) return current;
  }

  return null;
};

export const calculateCommission = (
  rule: TCommissionRuleRef | null,
  baseAmount: number,
) => {
  if (!rule) return 0;

  return rule.type === 'percent'
    ? roundMoney((baseAmount * rule.value) / 100)
    : roundMoney(rule.value);
};

export const buildCommissionReport = (
  from: string,
  to: string,
  rules: TCommissionRuleRef[],
  sources: TCommissionSource[],
): TCommissionReport => {
  const lines: TCommissionLine[] = sources.map((source) => {
    const rule = resolveCommissionRule(rules, source);

    return {
      ...source,
      ruleId: rule?.id ?? null,
      ruleType: rule?.type ?? null,
      ruleValue: rule?.value ?? null,
      commission: calculateCommission(rule, source.baseAmount),
    };
  });

  const byMember = new Map<string, TCommissionLine[]>();
  for (const line of lines) {
    byMember.set(line.storeMemberId, [
      ...(byMember.get(line.storeMemberId) ?? []),
      line,
    ]);
  }

  return {
    from,
    to,
    professionals: [...byMember.entries()]
      .map(([storeMemberId, memberLines]) => ({
        storeMemberId,
        professionalName: memberLines[0].professionalName,
        attendances: memberLines.length,
        baseTotal: sumMoney(memberLines.map((line) => line.baseAmount)),
        commissionTotal: sumMoney(memberLines.map((line) => line.commission)),
      }))
      .sort((a, b) => b.commissionTotal - a.commissionTotal),
    lines,
    totals: {
      attendances: lines.length,
      baseTotal: sumMoney(lines.map((line) => line.baseAmount)),
      commissionTotal: sumMoney(lines.map((line) => line.commission)),
    },
  };
};
