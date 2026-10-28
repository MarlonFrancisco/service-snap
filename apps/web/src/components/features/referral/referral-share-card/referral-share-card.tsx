'use client';

import { Button, Card, CardContent, Separator } from '@repo/ui';
import { Copy, Gift, Loader2, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useReferralShareCard } from './referral-share-card.hook';
import type { TReferralShareCardConfig } from './referral-share-card.types';

export function ReferralShareCard({
  variant,
  delay = 0,
}: TReferralShareCardConfig) {
  const {
    referral,
    isPendingReferral,
    isErrorReferral,
    refetchReferral,
    primaryUrl,
    primaryLabel,
    secondaryUrl,
    secondaryLabel,
    handleCopyCode,
    handleCopyPrimary,
    handleCopySecondary,
    handleShare,
  } = useReferralShareCard({ variant });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-gray-200 py-0">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center">
              <Gift className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900 mb-1">Indique e compartilhe</h3>
              <p className="text-gray-600">
                Convide amigos ou parceiros com o seu link exclusivo
              </p>
            </div>
          </div>

          <Separator className="mb-8" />

          {isPendingReferral ? (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Carregando seu link…</span>
            </div>
          ) : isErrorReferral || !referral ? (
            <div className="space-y-4 py-6 text-center">
              <p className="text-sm text-gray-600">
                Não foi possível carregar seu código de indicação.
              </p>
              <Button type="button" variant="outline" onClick={() => refetchReferral()}>
                Tentar novamente
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Seu código
                  </div>
                  <div className="font-mono text-lg tracking-wider text-gray-900">
                    {referral.code}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar código
                  </Button>
                  <Button type="button" size="sm" onClick={() => void handleShare()}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>

              <CopyRow
                label={primaryLabel}
                value={primaryUrl ?? ''}
                onCopy={handleCopyPrimary}
              />

              <CopyRow
                label={secondaryLabel}
                value={secondaryUrl ?? ''}
                onCopy={handleCopySecondary}
              />

              <p className="text-sm text-gray-600">
                {referral.referredCount === 0
                  ? 'Nenhuma indicação registrada ainda.'
                  : referral.referredCount === 1
                    ? '1 pessoa entrou com o seu link.'
                    : `${referral.referredCount} pessoas entraram com o seu link.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CopyRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-700">{label}</div>
      <div className="flex items-center gap-2">
        <div className="bg-muted text-muted-foreground flex-1 truncate rounded-md border px-3 py-2 text-sm font-mono">
          {value}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onCopy}
          aria-label={`Copiar ${label}`}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
