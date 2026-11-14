import { PageLoading } from '@/components/layout/page-loading';

/**
 * Aparece ao entrar numa página que ainda busca dados no servidor. Trocar de
 * página dentro do painel não mostra isto: o layout do painel já está na tela,
 * e o Next mantém a tela anterior até a nova ficar pronta.
 */
export default function RootLoading() {
  return <PageLoading />;
}
