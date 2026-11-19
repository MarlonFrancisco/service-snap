'use client';

import { Footer, Header } from '@/components/layout';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useErrorPage } from './error-page.hook';
import type { TErrorPageConfig } from './error-page.types';

const ACTION_CLASS =
  'inline-flex h-[52px] items-center justify-center rounded-full border border-ink px-[26px] text-[15px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';

export const ErrorPage = (config: TErrorPageConfig) => {
  const { digest, handleRetry } = useErrorPage(config);

  return (
    <Header>
      <main className="mx-auto max-w-[37.5rem] px-5 pt-10 pb-14 text-center md:pt-20 md:pb-4">
        <span
          aria-hidden="true"
          className="mx-auto grid size-[72px] place-items-center rounded-full bg-surface-2"
        >
          <AlertCircle className="size-8" strokeWidth={1.8} />
        </span>
        <h1 className="mt-6 text-[28px] leading-[1.1] font-extrabold tracking-[-0.03em] md:text-[36px]">
          Algo deu errado
        </h1>
        <p className="mt-3 text-base leading-[1.6] text-ink-muted">
          Não conseguimos carregar esta página agora. Tente de novo em alguns
          instantes; se continuar, volte à página inicial.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={handleRetry}
            className={`${ACTION_CLASS} cursor-pointer bg-brand text-white hover:bg-brand-hover`}
          >
            Tentar de novo
          </button>
          <Link href="/" className={`${ACTION_CLASS} hover:bg-surface-2`}>
            Ir para a home
          </Link>
        </div>
        {digest && (
          <p className="mt-5 text-[13px] text-ink-muted">
            Código do erro: {digest}
          </p>
        )}
      </main>
      <Footer compact />
    </Header>
  );
};
