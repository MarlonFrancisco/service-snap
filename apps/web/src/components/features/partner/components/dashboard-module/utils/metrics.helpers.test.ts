import { describe, expect, it } from 'vitest';
import {
  createMoneyFormatters,
  formatHourRange,
  formatPercent,
  formatSignedPercent,
  formatSignedPoints,
  formatSignedRating,
  getHeatLevel,
  parseMoneyInput,
  resolveMetricsView,
  sortByWeekOrder,
  translateMonth,
} from './metrics.helpers';

const BASE_VIEW = {
  isStoreLoading: false,
  hasStoreError: false,
  hasNoStore: false,
  isPending: false,
  isError: false,
  hasData: false,
  hasActivity: false,
};

describe('metrics formatters', () => {
  it('mantém o sinal das variações negativas', () => {
    const { formatSignedMoney } = createMoneyFormatters('BRL', 'BR');

    expect(formatSignedMoney(-50)).toMatch(/^-R\$\s50,00$/);
    expect(formatSignedMoney(50)).toMatch(/^\+R\$\s50,00$/);
    expect(formatSignedPoints(-1.25)).toBe('-1,3 p.p.');
    expect(formatSignedRating(-0.3)).toBe('-0,3');
    expect(formatSignedPercent(-12.5)).toBe('-12,5%');
  });

  it('não mostra sinal quando a variação é zero', () => {
    expect(formatSignedPoints(0)).toBe('0 p.p.');
    expect(formatSignedPoints(0.01)).toBe('0 p.p.');
    expect(formatSignedRating(0)).toBe('0,0');
  });

  it('usa a moeda da loja', () => {
    const { formatMoney } = createMoneyFormatters('USD', 'US');

    expect(formatMoney(10)).toBe('$10.00');
  });

  it('aceita totais que a API devolve como string', () => {
    const { formatMoney } = createMoneyFormatters('BRL', 'BR');

    expect(formatMoney('10')).toMatch(/^R\$\s10,00$/);
    expect(formatPercent(null)).toBe('0%');
  });
});

describe('parseMoneyInput', () => {
  it.each([
    ['20000', 20000],
    ['20.000', 20000],
    ['20.000,00', 20000],
    ['R$ 20.000,00', 20000],
    ['1500,50', 1500.5],
    ['1500.50', 1500.5],
  ])('interpreta %s', (raw, expected) => {
    expect(parseMoneyInput(raw)).toBe(expected);
  });

  it.each(['', 'abc', '-100'])('rejeita "%s"', (raw) => {
    expect(parseMoneyInput(raw)).toBeNull();
  });
});

describe('getHeatLevel', () => {
  it('reserva o nível vazio para zero e o mais forte para o pico', () => {
    expect(getHeatLevel(0, 9)).toBe(0);
    expect(getHeatLevel(1, 9)).toBe(1);
    expect(getHeatLevel(5, 9)).toBe(2);
    expect(getHeatLevel(9, 9)).toBe(3);
    expect(getHeatLevel(0, 0)).toBe(0);
  });
});

describe('resolveMetricsView', () => {
  it('separa erro de vazio', () => {
    expect(resolveMetricsView({ ...BASE_VIEW, isError: true })).toBe('error');
    expect(resolveMetricsView({ ...BASE_VIEW, hasData: true })).toBe('empty');
  });

  it('mantém os dados quando só a atualização falha', () => {
    expect(
      resolveMetricsView({
        ...BASE_VIEW,
        isError: true,
        hasData: true,
        hasActivity: true,
      }),
    ).toBe('ready');
  });

  it('distingue carregamento, loja ausente e falha ao buscar lojas', () => {
    expect(resolveMetricsView({ ...BASE_VIEW, isStoreLoading: true })).toBe(
      'loading',
    );
    expect(resolveMetricsView({ ...BASE_VIEW, hasNoStore: true })).toBe(
      'no-store',
    );
    expect(resolveMetricsView({ ...BASE_VIEW, hasStoreError: true })).toBe(
      'error',
    );
    expect(resolveMetricsView({ ...BASE_VIEW, isPending: true })).toBe(
      'loading',
    );
  });
});

describe('rótulos', () => {
  it('monta a faixa de horário', () => {
    expect(formatHourRange('14h')).toBe('14h - 15h');
    expect(formatHourRange('09h')).toBe('9h - 10h');
  });

  it('traduz meses vindos do Postgres', () => {
    expect(translateMonth('Oct')).toBe('Out');
    expect(translateMonth('Jan')).toBe('Jan');
  });

  it('ordena pela semana informada', () => {
    const days = [{ day: 'Dom' }, { day: 'Seg' }];

    expect(sortByWeekOrder(days, ['Seg', 'Dom'])[0]?.day).toBe('Seg');
  });
});
