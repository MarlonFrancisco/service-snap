import {
  toPushSubscriptionPayload,
  urlBase64ToUint8Array,
} from './push.helpers';
import { PushService } from './push.service';

const SERVICE_WORKER_URL = '/sw.js';

/**
 * A assinatura deste aparelho. O service worker só é registrado quando o usuário
 * ativa os avisos ou quando já existe uma assinatura.
 */
export class PushDeviceService {
  /** Lê o registro sem criar um: quem nunca ativou não ganha service worker. */
  public static async getSubscription() {
    const registration = await navigator.serviceWorker.getRegistration('/');
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return null;

    // Já assinado: registra de novo para o navegador buscar a versão atual do sw.js.
    void navigator.serviceWorker.register(SERVICE_WORKER_URL).catch(() => null);
    return subscription;
  }

  public static async subscribe(publicKey: string) {
    await navigator.serviceWorker.register(SERVICE_WORKER_URL);
    const registration = await navigator.serviceWorker.ready;
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      }));

    const payload = toPushSubscriptionPayload(subscription);
    if (!payload) throw new Error('Assinatura de push sem chaves.');

    await PushService.subscribe(payload);
    return subscription;
  }

  public static async unsubscribe() {
    const registration = await navigator.serviceWorker.getRegistration('/');
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return;

    await PushService.unsubscribe({ endpoint: subscription.endpoint });
    await subscription.unsubscribe();
  }
}
