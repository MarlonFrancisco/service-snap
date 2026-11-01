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
            'min-h-screen bg-white text-[#0B0B0F]',
          )}
        >
          <CheckoutHeader />
          <main className="mx-auto max-w-[560px] px-5 pt-10 pb-16 text-center">
            <p className="text-sm text-[#5F5C6E]">Carregando checkout…</p>
          </main>
        </div>
      }
    >
      <Checkout />
    </Suspense>
  );
}
