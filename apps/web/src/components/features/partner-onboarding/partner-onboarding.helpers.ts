import { isApiHttpError } from '@/service/api';

const digitsOf = (value: string) => value.replace(/\D/g, '');

export const maskZipCode = (value: string) => {
  const digits = digitsOf(value).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
};

export const maskPhone = (value: string) => {
  const digits = digitsOf(value).slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const maskTime = (value: string) => {
  const digits = digitsOf(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export const formatCurrency = (value: number) =>
  currencyFormatter.format(value);

/** Digita como em maquininha: cada dígito entra pelos centavos. */
export const maskCurrency = (value: string) => {
  const digits = digitsOf(value).slice(0, 9);
  return digits ? formatCurrency(Number(digits) / 100) : '';
};

export const parseCurrency = (value: string) =>
  Number(digitsOf(value) || 0) / 100;

export const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}min` : `${hours}h`;
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (isApiHttpError(error) && error.body && typeof error.body === 'object') {
    const { message } = error.body as { message?: unknown };

    if (typeof message === 'string') return message;
    // ValidationPipe devolve a lista de campos, em inglês: não serve para a tela.
  }

  return fallback;
};

/** Etapa indicada pela API quando recusa concluir um espaço incompleto. */
export const getApiErrorStep = (error: unknown): string | null => {
  if (isApiHttpError(error) && error.body && typeof error.body === 'object') {
    const { step } = error.body as { step?: unknown };
    return typeof step === 'string' ? step : null;
  }

  return null;
};

export const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
