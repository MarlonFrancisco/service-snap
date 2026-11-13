export type TCommissionType = 'percent' | 'fixed';

/** Uma regra já sem relações, pronta para a escolha da mais específica. */
export type TCommissionRuleRef = {
  id: string;
  type: TCommissionType;
  value: number;
  effectiveFrom: string;
  storeMemberId: string | null;
  serviceId: string | null;
};

/** O que o relatório precisa de cada atendimento concluído. */
export type TCommissionSource = {
  scheduleId: string;
  date: string;
  startTime: string | null;
  storeMemberId: string;
  professionalName: string;
  serviceId: string | null;
  serviceName: string;
  customerName: string;
  /** Do fechamento quando há; senão o preço reservado. */
  baseAmount: number;
  /** `package`: o fechamento deu baixa numa sessão, a base é o valor dela. */
  baseSource: 'checkout' | 'package' | 'price';
};

export type TCommissionLine = TCommissionSource & {
  ruleId: string | null;
  ruleType: TCommissionType | null;
  ruleValue: number | null;
  commission: number;
};

export type TCommissionReport = {
  from: string;
  to: string;
  professionals: {
    storeMemberId: string;
    professionalName: string;
    attendances: number;
    baseTotal: number;
    commissionTotal: number;
  }[];
  lines: TCommissionLine[];
  totals: { attendances: number; baseTotal: number; commissionTotal: number };
};
