'use client';

import { Skeleton } from '@repo/ui';
import { AdminShell } from './admin-shell';

/**
 * O menu da plataforma não depende de dados, então aparece pronto. Só o
 * conteúdo fica em esqueleto: título, números e a lista.
 */
export const AdminShellSkeleton = () => (
  <AdminShell>
    <div role="status" aria-busy="true">
      <span className="sr-only">Carregando o painel da plataforma</span>
      <div aria-hidden="true">
        <Skeleton className="h-8 w-56 bg-surface-4" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full bg-surface-4" />
        <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-[108px] rounded-[20px] bg-surface-4"
            />
          ))}
        </div>
        <div className="mt-6 rounded-[20px] bg-white p-2 shadow-[0_8px_28px_rgba(15,12,30,0.08)]">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="flex items-center gap-3.5 border-b border-line px-3 py-3.5 last:border-b-0"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-48 max-w-full" />
                <Skeleton className="h-3.5 w-32" />
              </div>
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </AdminShell>
);
