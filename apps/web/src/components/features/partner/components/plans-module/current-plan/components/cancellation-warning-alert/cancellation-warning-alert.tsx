import { Alert, AlertDescription, AlertTitle } from '@repo/ui';
import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export function CancellationWarningAlert() {
  const { currentPlan } = useSubscriptionQuery();

  if (!currentPlan?.cancelAtPeriodEnd) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Alert className="border-orange-200 bg-orange-50 text-orange-900">
        <AlertTriangle className="text-orange-600" />
        <AlertTitle className="text-orange-900">
          Cancelamento Agendado
        </AlertTitle>
        <AlertDescription className="text-orange-700">
          <p className="">
            Seu plano <strong>{currentPlan.planName}</strong> está programado
            para ser cancelado. Você continuará tendo acesso a todos os
            recursos até{' '}
            <strong>
              {currentPlan.nextBillingDate
                ? new Date(currentPlan.nextBillingDate).toLocaleDateString(
                    'pt-BR',
                    {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    },
                  )
                : 'o final do ciclo atual'}
            </strong>
            .
          </p>
          <p className="text-sm text-orange-600">
            Após essa data, você perderá o acesso à plataforma e não será mais
            cobrado. Para mudar de plano antes disso, reative a assinatura em
            “Meu plano” e só então use “Upgrade”.
          </p>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}
