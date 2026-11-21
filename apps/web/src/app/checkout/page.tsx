import { Checkout, CheckoutHeader } from '@/components/features/checkout';
import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { cn } from '@repo/ui';
import { Suspense } from 'react';

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            plusJakartaSans.className,
            'min-h-screen bg-white text-ink',
          )}
        >
          <CheckoutHeader />
          <main className="mx-auto max-w-[560px] px-5 pt-10 pb-16 text-center">
            <p className="text-sm text-ink-muted">Carregando checkout…</p>
          </main>
        </div>
      }
    >
      <Checkout />
    </Suspense>
  );
}
