import type { TPendingPurchase } from './checkout.types';

const PENDING_PURCHASE_KEY = 'analytics:pending_purchase';
const TRACKED_PURCHASE_PREFIX = 'analytics:purchase_tracked:';

/**
 * O retorno do Stripe só traz `session_id` e o status. O plano escolhido fica
 * guardado na aba ao iniciar o checkout para o `purchase` ter valor e plano.
 * O storage pode estar bloqueado (aba anônima, cookies desligados): falhar em
 * silêncio é o esperado, e o `purchase` simplesmente não é enviado.
 */
export const savePendingPurchase = (purchase: TPendingPurchase) => {
  try {
    window.sessionStorage.setItem(
      PENDING_PURCHASE_KEY,
      JSON.stringify(purchase),
    );
  } catch {
    // Sem storage não há como ligar o retorno ao plano.
  }
};

/**
 * Devolve o plano guardado uma única vez por sessão do Stripe. O polling, um
 * reload ou voltar à página não reenviam a compra.
 */
export const consumePendingPurchase = (
  sessionId: string,
): TPendingPurchase | null => {
  try {
    const trackedKey = `${TRACKED_PURCHASE_PREFIX}${sessionId}`;
    if (window.sessionStorage.getItem(trackedKey)) return null;

    const raw = window.sessionStorage.getItem(PENDING_PURCHASE_KEY);
    if (!raw) return null;

    window.sessionStorage.setItem(trackedKey, '1');
    window.sessionStorage.removeItem(PENDING_PURCHASE_KEY);

    return JSON.parse(raw) as TPendingPurchase;
  } catch {
    return null;
  }
};
