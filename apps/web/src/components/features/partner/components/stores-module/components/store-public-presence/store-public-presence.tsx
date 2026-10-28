'use client';

import {
  instagramLabel,
  storePublicUrl,
  toInstagramUrl,
} from '@/utils/helpers/social.helper';
import { Button } from '@repo/ui';
import { Copy, Instagram } from 'lucide-react';
import { toast } from 'sonner';

type StorePublicPresenceConfig = {
  storeId: string;
  instagram?: string | null;
};

export function StorePublicPresence({
  storeId,
  instagram,
}: StorePublicPresenceConfig) {
  const instagramUrl = toInstagramUrl(instagram);
  const label = instagramLabel(instagram);
  const publicUrl = storePublicUrl(storeId);

  const copyPublicUrl = () => {
    void navigator.clipboard.writeText(publicUrl).then(
      () => toast.success('Link copiado para o Google Perfil'),
      () => toast.error('Falha ao copiar o link'),
    );
  };

  return (
    <div className="space-y-3">
      {instagramUrl && label ? (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
        >
          <Instagram className="h-4 w-4" />
          {label}
        </a>
      ) : (
        <p className="text-sm text-gray-500">
          Instagram ainda não informado no cadastro da loja.
        </p>
      )}

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="text-xs text-gray-500 mb-1">Google Perfil da Empresa</p>
        <p className="text-sm text-gray-700 mb-2">
          Cole este link no site do perfil para apontar para o ServiceSnap.
        </p>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 truncate font-mono text-xs text-gray-600">
            {publicUrl}
          </div>
          <Button type="button" size="sm" variant="outline" onClick={copyPublicUrl}>
            <Copy className="h-4 w-4 mr-1" />
            Copiar
          </Button>
        </div>
      </div>
    </div>
  );
}
