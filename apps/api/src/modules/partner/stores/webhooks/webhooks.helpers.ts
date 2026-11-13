import { BadRequestException } from '@nestjs/common';
import { lookup } from 'dns/promises';
import { isIP } from 'net';
import { signHmac } from '../../../../utils/helpers/crypto.helpers';
import { toDateKey } from '../../../../utils/helpers/schedule.helpers';
import type { Schedule } from '../schedule/schedule.entity';

export const WEBHOOK_SIGNATURE_HEADER = 'ServiceSnap-Signature';
export const WEBHOOK_TIMEOUT_MS = 5000;
export const WEBHOOK_MAX_CONSECUTIVE_FAILURES = 20;

/**
 * `t=<unix>,v1=<hmac>` sobre `"<t>.<corpo>"`, como o Stripe. Quem recebe
 * recalcula com o segredo e recusa se o `t` for antigo (repetição de envio).
 */
export const buildWebhookSignature = (
  secret: string,
  body: string,
  now = new Date(),
) => {
  const timestamp = Math.floor(now.getTime() / 1000);

  return `t=${timestamp},v1=${signHmac(secret, `${timestamp}.${body}`)}`;
};

const PRIVATE_V4 = [
  /^0\./,
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
];

export const isPrivateAddress = (address: string) => {
  const ip = address.replace(/^::ffff:/i, '');

  if (isIP(ip) === 4) return PRIVATE_V4.some((range) => range.test(ip));

  const lower = ip.toLowerCase();

  return (
    lower === '::1' ||
    lower === '::' ||
    lower.startsWith('fc') ||
    lower.startsWith('fd') ||
    lower.startsWith('fe80')
  );
};

/**
 * Em produção só HTTPS e só endereço público: sem isso, um webhook vira porta
 * para a API chamar a rede interna da Vercel (SSRF). Localmente vale localhost.
 */
export const assertWebhookUrl = async (
  value: string,
  allowPrivate: boolean,
) => {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new BadRequestException('Webhook URL is invalid');
  }

  if (allowPrivate && ['http:', 'https:'].includes(url.protocol)) return;

  if (url.protocol !== 'https:') {
    throw new BadRequestException('Webhook URL must use HTTPS');
  }

  const addresses = await lookup(url.hostname, { all: true }).catch(
    (): { address: string }[] => [],
  );

  if (!addresses.length || addresses.some((a) => isPrivateAddress(a.address))) {
    throw new BadRequestException('Webhook URL must be a public address');
  }
};

/** Algo que uma integração veria mudar: dia, horário, profissional, status ou nota. */
export const hasScheduleChanged = (before: Schedule, after: Schedule) =>
  (before.date && toDateKey(before.date)) !==
    (after.date && toDateKey(after.date)) ||
  before.startTime !== after.startTime ||
  before.endTime !== after.endTime ||
  before.storeMember?.id !== after.storeMember?.id ||
  before.status !== after.status ||
  (before.notes ?? null) !== (after.notes ?? null);
