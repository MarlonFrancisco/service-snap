import {
  ROI_ILLUSTRATIVE_BOOKINGS_LIFT,
  ROI_ILLUSTRATIVE_NO_SHOW_REDUCTION_PP,
} from './pricing-roi-calculator.constants';
import { useCallback, useMemo, useState } from 'react';

export type TRoiField =
  | 'appointments'
  | 'averagePrice'
  | 'noShowRate'
  | 'planPrice';

const EMPTY_VALUES: Record<TRoiField, string> = {
  appointments: '',
  averagePrice: '',
  noShowRate: '',
  planPrice: '',
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

/** Aceita a escrita em pt-BR: "1.200,50", "R$ 99,90" e "15%". */
const parseAmount = (value: string) => {
  const normalized = value
    .replace(/[^\d.,]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const amount = Number.parseFloat(normalized);

  return Number.isFinite(amount) ? amount : null;
};

const getPaybackLabel = (months: number) =>
  months === 1 ? '1 mês' : `${months} meses`;

export const usePricingRoiCalculator = () => {
  const [values, setValues] = useState(EMPTY_VALUES);

  const handleChange = useCallback((field: TRoiField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  }, []);

  const result = useMemo(() => {
    const appointments = parseAmount(values.appointments);
    const averagePrice = parseAmount(values.averagePrice);
    const noShowRate = parseAmount(values.noShowRate);
    const planPrice = parseAmount(values.planPrice);

    if (
      !appointments ||
      !averagePrice ||
      noShowRate === null ||
      noShowRate > 100 ||
      !planPrice
    ) {
      return null;
    }

    const currentNetRevenue =
      appointments * averagePrice * (1 - noShowRate / 100);
    const improvedNoShowRate = Math.max(
      0,
      noShowRate - ROI_ILLUSTRATIVE_NO_SHOW_REDUCTION_PP,
    );
    const improvedAppointments =
      appointments + Math.round(appointments * ROI_ILLUSTRATIVE_BOOKINGS_LIFT);
    const improvedNetRevenue =
      improvedAppointments * averagePrice * (1 - improvedNoShowRate / 100);

    const monthlyGain = improvedNetRevenue - currentNetRevenue;
    const annualReturn = (monthlyGain - planPrice) * 12;

    return {
      monthlyGain: currencyFormatter.format(monthlyGain),
      annualReturn: currencyFormatter.format(annualReturn),
      payback:
        monthlyGain > planPrice
          ? getPaybackLabel(Math.ceil((planPrice * 12) / monthlyGain))
          : 'O ganho não cobre o plano',
    };
  }, [values]);

  return {
    values,
    result,
    bookingsLiftPercent: Math.round(ROI_ILLUSTRATIVE_BOOKINGS_LIFT * 100),
    noShowReductionPoints: ROI_ILLUSTRATIVE_NO_SHOW_REDUCTION_PP,
    handleChange,
  };
};
