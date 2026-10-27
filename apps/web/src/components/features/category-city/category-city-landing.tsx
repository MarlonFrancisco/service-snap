import { Footer } from '@/components/layout';
import { Header } from '@/components/layout/header/header';
import type {
  TCategoryCityBusiness,
  TResolvedCategoryCity,
} from '@/utils/helpers/category-city.helper';
import { MapPin, Search, Star } from 'lucide-react';
import Link from 'next/link';

type CategoryCityLandingProps = {
  resolved: TResolvedCategoryCity;
  status: 'ok' | 'unavailable';
  displayCity: string;
  stores: TCategoryCityBusiness[];
};

export function CategoryCityLanding({
  resolved,
  status,
  displayCity,
  stores,
}: CategoryCityLandingProps) {
  const city = displayCity;
  const searchParams = new URLSearchParams({
    query: resolved.categoryName,
    category: resolved.categoryName,
    location: city,
  });

  return (
    <Header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl text-[#1a2b4c] mb-2">
          {resolved.categoryName} em {city}
        </h1>
        <p className="text-gray-600 mb-8 max-w-2xl">
          Profissionais de {resolved.categoryName} em {city} no ServiceSnap.
          A lista abaixo só inclui quem realmente atende essa categoria nessa
          cidade.
        </p>

        {status === 'unavailable' ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
            <Search className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-gray-900 mb-1">Não foi possível carregar agora</p>
            <p className="text-sm text-gray-600 mb-4">
              Tente de novo em instantes ou abra a busca.
            </p>
            <Link
              href={`/booking?${searchParams.toString()}`}
              className="text-sm text-[#1a2b4c] underline"
            >
              Abrir a busca
            </Link>
          </div>
        ) : stores.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
            <MapPin className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-gray-900 mb-1">
              Nenhum profissional de {resolved.categoryName} em {city}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              A lista fica vazia até existir um profissional dessa categoria
              nessa cidade.
            </p>
            <Link href="/" className="text-sm text-[#1a2b4c] underline">
              Voltar ao início
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map((store) => (
                <li key={store.path}>
                <Link
                  href={store.path}
                  className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300"
                >
                  <h2 className="text-lg text-gray-900">{store.name}</h2>
                  {store.reviewCount && store.rating ? (
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                      <Star className="h-3.5 w-3.5" />
                      {store.rating.toLocaleString('pt-BR')} ·{' '}
                      {store.reviewCount}{' '}
                      {store.reviewCount === 1 ? 'avaliação' : 'avaliações'}
                    </p>
                  ) : null}
                  {store.address || store.city ? (
                    <p className="mt-2 flex items-start gap-1.5 text-sm text-gray-600">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        {[store.address, store.city, store.state]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Footer />
    </Header>
  );
}
