import { ApiHttpError } from '@/service/api';
import { describe, expect, it } from 'vitest';
import {
  formatDuration,
  getApiErrorMessage,
  getApiErrorStep,
  maskCurrency,
  maskPhone,
  maskTime,
  maskZipCode,
  parseCurrency,
} from './partner-onboarding.helpers';

describe('partner onboarding helpers', () => {
  it('masks the Brazilian zip code', () => {
    expect(maskZipCode('01001')).toBe('01001');
    expect(maskZipCode('01001000999')).toBe('01001-000');
  });

  it('masks landline and mobile phones', () => {
    expect(maskPhone('1130000000')).toBe('(11) 3000-0000');
    expect(maskPhone('11900000000')).toBe('(11) 90000-0000');
  });

  it('masks the time as it is typed', () => {
    expect(maskTime('9')).toBe('9');
    expect(maskTime('0900')).toBe('09:00');
  });

  it('types prices from the cents up and reads them back', () => {
    const masked = maskCurrency('5000');

    expect(masked).toContain('50,00');
    expect(parseCurrency(masked)).toBe(50);
    expect(maskCurrency('')).toBe('');
  });

  it('formats durations', () => {
    expect(formatDuration(30)).toBe('30 min');
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(90)).toBe('1h 30min');
  });

  it('shows API messages written for people, not validation lists', () => {
    expect(
      getApiErrorMessage(new ApiHttpError(409, { message: 'Já existe' }), 'x'),
    ).toBe('Já existe');
    expect(
      getApiErrorMessage(new ApiHttpError(400, { message: ['bad'] }), 'x'),
    ).toBe('x');
    expect(getApiErrorMessage(new Error('network'), 'x')).toBe('x');
  });

  it('reads the step the API asks to go back to', () => {
    expect(
      getApiErrorStep(new ApiHttpError(400, { message: 'm', step: 'team' })),
    ).toBe('team');
    expect(getApiErrorStep(new Error('network'))).toBeNull();
  });
});
