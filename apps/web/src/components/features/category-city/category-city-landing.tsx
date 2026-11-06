import { Footer, Header } from '@/components/layout';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { TrackedLink } from '@/components/ui/tracked-link';
import { instagramLabel } from '@/utils/helpers/social.helper';
import { formatRating } from '@/utils/helpers/search.helper';
import { Instagram, MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import {
  CATEGORY_CITY_LIST_NAME,
  formatStoreLocation,
  getStoreIdFromPath,
} from './category-city-landing.helpers';
import { CategoryCityTracker } from './components/category-city-tracker';
import type { TCategoryCityLandingConfig } from './category-city-landing.types';

const FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';
const NOTICE_CLASS = 'rounded-3xl bg-[#F7F6FA] px-6 py-12 text-center';
const NOTICE_ICON_CLASS = 'mx-auto mb-3 h-10 w-10 text-[#A6A3B4]';
const NOTICE_TITLE_CLASS = 'mb-1 text-base font-bold';
const NOTICE_TEXT_CLASS = 'mb-4 text-sm text-[#5F5C6E]';
const ACTION_CLASS = `inline-flex h-11 items-center rounded-full bg-[#0B0B0F] px-5 text-[13px] font-bold text-white transition-colors hover:bg-[#2B2B2B] ${FOCUS_CLASS}`;

export function CategoryCityLanding({
  resolved,
  status,
  displayCity,
  stores,
}: TCategoryCityLandingConfig) {
  const city = displayCity;
  const searchParams = new URLSearchParams({
    query: resolved.categoryName,
    category: resolved.categoryName,
    location: city,
  });

  return (
    <Header>
      <main className="mx-auto max-w-[82.5rem] px-5 pb-20 md:px-10">
        <CategoryCityTracker
          status={status}
          categoryName={resolved.categoryName}
          city={city}
          storeIds={stores.map((store) => getStoreIdFromPath(store.path))}
        />
        <h1 className="mt-3 text-[34px] leading-[1.08] font-extrabold tracking-[-0.035em] md:mt-8 md:text-[44px]">
          {resolved.categoryName} em {city}
        </h1>
        <p className="mt-3 mb-8 max-w-[42.5rem] text-base leading-[1.6] text-[#5F5C6E]">
          Profissionais de {resolved.categoryName} em {city} no ServiceSnap. A
          lista abaixo só inclui quem realmente atende essa categoria nessa
          cidade.
        </p>

        {status === 'unavailable' ? (
          <div className={NOTICE_CLASS}>
            <Search aria-hidden="true" className={NOTICE_ICON_CLASS} />
            <p className={NOTICE_TITLE_CLASS}>
              Não foi possível carregar agora
            </p>
            <p className={NOTICE_TEXT_CLASS}>
              Tente de novo em instantes ou abra a busca.
            </p>
            <Link
              href={`/booking?${searchParams.toString()}`}
              className={ACTION_CLASS}
            >
              Abrir a busca
            </Link>
          </div>
        ) : stores.length === 0 ? (
          <div className={NOTICE_CLASS}>
            <MapPin aria-hidden="true" className={NOTICE_ICON_CLASS} />
            <p className={NOTICE_TITLE_CLASS}>
              Nenhum profissional de {resolved.categoryName} em {city}
            </p>
            <p className={NOTICE_TEXT_CLASS}>
              A lista fica vazia até existir um profissional dessa categoria
              nessa cidade.
            </p>
            <Link href="/" className={ACTION_CLASS}>
              Voltar ao início
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-x-6 gap-y-9">
            {stores.map((store, index) => {
              const selectItem = {
                item_id: getStoreIdFromPath(store.path),
                item_list_name: CATEGORY_CITY_LIST_NAME,
                index,
              };
              const location = formatStoreLocation(store);
              const hasRating = Boolean(store.reviewCount && store.rating);

              return (
                <li key={store.path}>
                  <article className="relative">
                    <div className="relative aspect-square overflow-hidden rounded-[22px] bg-[#F4F3F7]">
                      <ImageWithFallback
                        src={store.image}
                        alt=""
                        fill
                        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </div>

                    <div className="mt-3.5 flex justify-between gap-2">
                      <h2 className="text-base font-bold">
                        <TrackedLink
                          href={store.path}
                          event="select_item"
                          properties={selectItem}
                          className={`after:absolute after:inset-0 after:rounded-[22px] ${FOCUS_CLASS}`}
                        >
                          {store.name}
                        </TrackedLink>
                      </h2>
                      {hasRating ? (
                        <span className="flex-none text-sm font-semibold">
                          <span aria-hidden="true">
                            ★ {formatRating(store.rating ?? 0)} (
                            {store.reviewCount})
                          </span>
                          <span className="sr-only">
                            Nota {formatRating(store.rating ?? 0)},{' '}
                            {store.reviewCount}{' '}
                            {store.reviewCount === 1
                              ? 'avaliação'
                              : 'avaliações'}
                          </span>
                        </span>
                      ) : (
                        <span className="flex-none text-sm font-semibold">
                          Novo
                        </span>
                      )}
                    </div>

                    {location ? (
                      <p className="mt-[3px] text-sm text-[#5F5C6E]">
                        {location}
                      </p>
                    ) : null}

                    {store.instagramUrl ? (
                      <p className="mt-[3px] flex items-center gap-1.5 text-sm text-[#5F5C6E]">
                        <Instagram
                          aria-hidden="true"
                          className="h-3.5 w-3.5 shrink-0"
                        />
                        {instagramLabel(store.instagramUrl)}
                      </p>
                    ) : null}

                    {store.path ? (
                      <TrackedLink
                        href={store.path}
                        event="select_item"
                        properties={selectItem}
                        aria-label={`Agendar em ${store.name}`}
                        className={`relative z-10 mt-3 ${ACTION_CLASS}`}
                      >
                        Agendar
                      </TrackedLink>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <Footer />
    </Header>
  );
}
