export type TCommissionType = 'percent' | 'fixed';

/** Uma versão de regra. Sem profissional e sem serviço é o padrão da loja. */
export interface ICommissionRule {
  id: string;
  type: TCommissionType;
  value: number;
  /** `YYYY-MM-DD`: vale para atendimentos a partir deste dia. */
  effectiveFrom: string;
  createdAt: string;
  storeMember: { id: string; name: string } | null;
  service: { id: string; name: string } | null;
}

export type TCreateCommissionRule = {
  type: TCommissionType;
  value: number;
  effectiveFrom?: string;
  storeMemberId?: string;
  serviceId?: string;
};

/** Período em `YYYY-MM-DD`. */
export type TCommissionReportQuery = {
  from: string;
  to: string;
  storeMemberId?: string;
};

/** `package`: sessão de pacote, a base é o valor da sessão. */
export type TCommissionBaseSource = 'checkout' | 'package' | 'price';

export interface ICommissionLine {
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
  baseSource: TCommissionBaseSource;
  ruleId: string | null;
  ruleType: TCommissionType | null;
  ruleValue: number | null;
  commission: number;
}

export interface ICommissionProfessional {
  storeMemberId: string;
  professionalName: string;
  attendances: number;
  baseTotal: number;
  commissionTotal: number;
}

export interface ICommissionReport {
  from: string;
  to: string;
  professionals: ICommissionProfessional[];
  lines: ICommissionLine[];
  totals: { attendances: number; baseTotal: number; commissionTotal: number };
}
