import { isNotFoundError } from '@/service/api/http-error';
import { StoreService } from '@/service/store/store.service';
import type { IStore } from '@/types/api/stores.types';
import { withBudget } from '@/utils/helpers/promise.helper';
import { cache } from 'react';

const STORE_MS = 4000;
export const STORE_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Link curto, como a API gera: minúsculas, números e hífen. */
const STORE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DESCRIPTION_MAX = 155;

export type TStorePageLoad =
  | { status: 'ok'; store: IStore }
  /** A loja não existe (ou é rascunho): a página vira 404. */
  | { status: 'missing' }
  /** API lenta ou fora: renderiza sem dados, o cliente busca de novo. */
  | { status: 'unavailable' };

/** Usado pelo `generateMetadata` e pela página; o `cache` evita a 2ª chamada. */
export const loadStorePage = cache(
  async (id: string): Promise<TStorePageLoad> => {
    // A loja vem pelo id (endereço antigo) ou pelo slug; o resto não existe.
    if (!STORE_ID.test(id) && !STORE_SLUG.test(id)) return { status: 'missing' };

    const result = await withBudget(
      StoreService.get(id).then(
        (store): TStorePageLoad => ({ status: 'ok', store }),
        (error): TStorePageLoad =>
          isNotFoundError(error)
            ? { status: 'missing' }
            : { status: 'unavailable' },
      ),
      STORE_MS,
    );

    return result ?? { status: 'unavailable' };
  },
);

export function storePageTitle(store: IStore): string {
  const city = store.city?.trim();
  return `${store.name}${city ? ` em ${city}` : ''} | ServiceSnap`;
}

export function storePageDescription(store: IStore): string {
  const description = store.description?.replace(/\s+/g, ' ').trim();
  if (!description) {
    const city = store.city?.trim();
    return `Agende um horário com ${store.name}${city ? ` em ${city}` : ''} no ServiceSnap.`;
  }
  if (description.length <= DESCRIPTION_MAX) return description;

  const cut = description.slice(0, DESCRIPTION_MAX - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length)}…`;
}
