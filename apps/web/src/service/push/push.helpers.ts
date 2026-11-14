import type {
  IPushSubscriptionPayload,
  TPushEnvironment,
} from '@/types/api/push.types';

/** A chave VAPID chega em base64url; o `PushManager` pede os bytes. */
export const urlBase64ToUint8Array = (base64Url: string) => {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));

  for (const [index, char] of Array.from(raw).entries()) {
    bytes[index] = char.charCodeAt(0);
  }

  return bytes;
};

/** iPadOS se apresenta como Mac: o toque denuncia o tablet. */
const isIosDevice = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const isStandaloneDisplay = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export const isPushSupported = () =>
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

/** No iPhone, o aviso só existe no app instalado na tela inicial. */
export const getPushEnvironment = (): TPushEnvironment => {
  if (isIosDevice() && !isStandaloneDisplay()) return 'ios-needs-install';
  return isPushSupported() ? 'supported' : 'unsupported';
};

export const toPushSubscriptionPayload = (
  subscription: PushSubscription,
): IPushSubscriptionPayload | null => {
  const { endpoint, keys } = subscription.toJSON();
  if (!endpoint || !keys?.p256dh || !keys.auth) return null;

  return { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } };
};
