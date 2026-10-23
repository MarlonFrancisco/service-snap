import { Checkout } from '@/components/features/checkout';
import { Suspense } from 'react';

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-sm text-gray-600">Carregando checkout…</p>
        </main>
      }
    >
      <Checkout />
    </Suspense>
  );
}
