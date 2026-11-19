import { Footer, Header } from '@/components/layout';
import Link from 'next/link';

const ACTION_CLASS =
  'inline-flex h-[52px] items-center rounded-full border border-ink px-[26px] text-[15px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';

export default function GlobalNotFound() {
  return (
    <Header>
      <main className="mx-auto max-w-[37.5rem] px-5 pt-10 pb-14 text-center md:pt-20 md:pb-4">
        <p
          aria-hidden="true"
          className="text-[72px] leading-none font-extrabold tracking-[-0.05em] md:text-[96px]"
        >
          404
        </p>
        <h1 className="mt-3 text-[28px] leading-[1.1] font-extrabold tracking-[-0.03em] md:text-[36px]">
          Página não encontrada
        </h1>
        <p className="mt-3 text-base leading-[1.6] text-ink-muted">
          O endereço que você acessou não existe ou foi removido. Volte à página
          inicial para continuar.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <Link
            href="/"
            className={`${ACTION_CLASS} bg-ink text-white transition-colors hover:bg-ink-hover`}
          >
            Ir para a home
          </Link>
          <Link
            href="/help"
            className={`${ACTION_CLASS} transition-colors hover:bg-surface-2`}
          >
            Central de ajuda
          </Link>
        </div>
      </main>
      <Footer compact />
    </Header>
  );
}
