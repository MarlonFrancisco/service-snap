/**
 * Service worker dos avisos do painel (Web Push).
 * Payload enviado pela API: JSON { title, body, url } com url relativa ao app.
 */

const DEFAULT_URL = '/partner/dashboard';
const ICON_URL = '/icon-192.png';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

const readPayload = (event) => {
  if (!event.data) return {};
  try {
    return event.data.json();
  } catch {
    return { body: event.data.text() };
  }
};

/** Só abre páginas do próprio app: um payload com outro domínio cai no Início. */
const toAppUrl = (url) => {
  try {
    const target = new URL(url || DEFAULT_URL, self.location.origin);
    if (target.origin === self.location.origin) return target.href;
  } catch {
    // URL inválida: usa o Início.
  }
  return new URL(DEFAULT_URL, self.location.origin).href;
};

self.addEventListener('push', (event) => {
  const { title, body, url } = readPayload(event);

  event.waitUntil(
    self.registration.showNotification(title || 'ServiceSnap', {
      body: body || '',
      icon: ICON_URL,
      badge: ICON_URL,
      data: { url: toAppUrl(url) },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = toAppUrl(event.notification.data && event.notification.data.url);

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      const appWindows = windows.filter(
        (client) => new URL(client.url).origin === self.location.origin,
      );
      const target =
        appWindows.find((client) => client.url === url) || appWindows[0];

      if (!target) {
        await self.clients.openWindow(url);
        return;
      }

      const focused = await target.focus();
      if (focused.url === url || !('navigate' in focused)) return;

      // Aba aberta antes do service worker não é controlada e recusa navigate.
      try {
        await focused.navigate(url);
      } catch {
        await self.clients.openWindow(url);
      }
    })(),
  );
});
