import { SITE_URL } from '@/utils/constants/site.constants';

/** "ssnap.io/booking/": o endereço público sem o protocolo, como o cliente lê. */
export const STORE_SLUG_PREFIX = `${SITE_URL.replace(/^https?:\/\//, '')}/booking/`;

/** Digitação livre vira o formato aceito: minúsculas e hífen no lugar de espaço. */
export const normalizeSlugInput = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
