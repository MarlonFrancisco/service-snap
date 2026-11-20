import { BookingSkeleton } from '@/components/features/booking';
import { Footer, Header } from '@/components/layout';

/** Mesma tela que o fluxo mostra enquanto busca a loja no navegador. */
export default function BookingLoading() {
  return (
    <Header showSearchBar>
      <div role="status" aria-busy="true">
        <span className="sr-only">Carregando a loja</span>
        <BookingSkeleton />
      </div>
      <Footer compact />
    </Header>
  );
}
