'use client';

import { NotFound } from '@/components/ui/not-found';
import { Store } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BookingNotFound() {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-[82.5rem] px-5 md:px-10">
      <NotFound
        className="flex py-20"
        icon={Store}
        title="Estabelecimento não encontrado"
        description="O estabelecimento que você está procurando não existe ou foi removido. Verifique o link ou explore outros estabelecimentos disponíveis."
        actionLabel="Explorar estabelecimentos"
        onAction={() => router.push('/')}
      />
    </div>
  );
}
