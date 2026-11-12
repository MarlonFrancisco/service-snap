import type { EntityManager } from 'typeorm';
import { Store } from '../../modules/partner/stores/store.entity';
import { getStoreTimezone } from './region.helpers';
import { WEEK_DAYS, getStoreNow } from './schedule.helpers';

/**
 * Helpers Utilitários para Cálculo de Períodos em Métricas
 * Reutilizável por todos os módulos de métricas (overview, sales, operational, customers)
 */

export type PeriodType = 'week' | 'month' | 'quarter';

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * "Hoje" da loja como Date à meia-noite no relógio do servidor. Os cálculos de
 * período usam campos locais (getDate, setHours): com este Date eles ficam no
 * dia da loja, e não no dia UTC em que a função serverless roda.
 */
export function toStoreLocalToday(timezone: string, now = new Date()): Date {
  const [year, month, day] = getStoreNow(timezone, now).date.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/** Busca o fuso da loja e devolve o "hoje" dela (ver `toStoreLocalToday`). */
export async function resolveStoreToday(
  manager: EntityManager,
  storeId: string,
  now = new Date(),
): Promise<Date> {
  const store = await manager.findOne(Store, {
    where: { id: storeId },
    select: { id: true, country: true, timezone: true },
  });

  return toStoreLocalToday(getStoreTimezone(store), now);
}

/**
 * Obtém o range de datas para um período específico
 * @param date - Data base para cálculo
 * @param period - Tipo de período: 'week' (7 dias), 'month' (30 dias), 'quarter' (90 dias)
 * @returns DateRange com start e end do período
 */
export function getPeriodDateRange(date: Date, period: PeriodType): DateRange {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  let start = new Date(d);
  let end = new Date(d);

  switch (period) {
    case 'week': {
      // Esta semana: de segunda até domingo
      const dayOfWeek = d.getDay();
      const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      start = new Date(d.setDate(diff));
      start.setHours(0, 0, 0, 0);

      end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case 'month': {
      // Este mês: do dia 1 até o último dia
      start = new Date(d.getFullYear(), d.getMonth(), 1);
      start.setHours(0, 0, 0, 0);

      end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case 'quarter': {
      // Este trimestre
      const quarter = Math.floor(d.getMonth() / 3);
      const monthStart = quarter * 3;
      start = new Date(d.getFullYear(), monthStart, 1);
      start.setHours(0, 0, 0, 0);

      end = new Date(d.getFullYear(), monthStart + 3, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
  }

  return { start, end };
}

/**
 * Obtém o início do período anterior
 * @param date - Data base
 * @param period - Tipo de período
 * @returns Data do início do período anterior
 */
export function getPreviousPeriodStart(date: Date, period: PeriodType): Date {
  const d = new Date(date);

  switch (period) {
    case 'week':
      d.setDate(d.getDate() - 7);
      break;

    case 'month':
      d.setMonth(d.getMonth() - 1);
      break;

    case 'quarter':
      d.setMonth(d.getMonth() - 3);
      break;
  }

  return d;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Quantidade real de dias do intervalo (28 a 31 num mês, 90 a 92 num
 * trimestre), contando o primeiro e o último dia.
 */
export function getDaysInRange(range: DateRange): number {
  return Math.round((range.end.getTime() - range.start.getTime()) / MS_PER_DAY);
}

/**
 * A loja abre neste dia da semana? `dayOfWeek` segue o DOW do Postgres e o
 * `getDay()` do JS (0 = domingo). Sem configuração, o dia conta como aberto.
 */
export function isStoreDayOpen(
  dayOfWeek: number,
  businessDays?: Record<string, boolean> | null,
): boolean {
  return businessDays?.[WEEK_DAYS[dayOfWeek]] !== false;
}

/**
 * Retorna o texto formatado do período em português
 * @param period - Tipo de período
 * @returns Texto do período (ex: "Esta semana")
 */
export function getPeriodLabel(period: PeriodType): string {
  switch (period) {
    case 'week':
      return 'Esta semana';
    case 'month':
      return 'Este mês';
    case 'quarter':
      return 'Este trimestre';
  }
}

/**
 * Retorna o texto de comparação do período em português
 * @param period - Tipo de período
 * @returns Texto de comparação (ex: "vs semana passada")
 */
export function getPeriodComparisonLabel(period: PeriodType): string {
  switch (period) {
    case 'week':
      return 'vs semana passada';
    case 'month':
      return 'vs mês passado';
    case 'quarter':
      return 'vs trimestre passado';
  }
}
