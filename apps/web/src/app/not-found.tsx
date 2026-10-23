'use client';

import { Header } from '@/components/layout';
import { Footer } from '@/components/layout/footer';
import { NotFound } from '@/components/ui/not-found';
import { Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GlobalNotFound() {
  const router = useRouter();

  return (
    <Header>
      <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
        <NotFound
          icon={Home}
          title="Página não encontrada"
          description="O endereço que você acessou não existe ou foi removido. Volte à página inicial para continuar."
          actionLabel="Ir para a home"
          onAction={() => router.push('/')}
        />
      </div>
      <Footer />
    </Header>
  );
}
