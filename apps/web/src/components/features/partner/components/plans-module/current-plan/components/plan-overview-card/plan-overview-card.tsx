'use client';

import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { formatPriceByCurrency } from '@repo/shared/formatters';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Separator,
} from '@repo/ui';
import { Mail, RefreshCw, Shield, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { usePlanOverviewCard } from './plan-overview-card.hook';

interface PlanOverviewCardProps {
  onCancelReactivateClick: () => void;
  delay?: number;
}

export function PlanOverviewCard({
  onCancelReactivateClick,
  delay = 0,
}: PlanOverviewCardProps) {
  const { currentPlan } = useSubscriptionQuery();

  const {
    formattedNextBillingDate,
    storesUsagePercentage,
    usersUsagePercentage,
    isStoresUnlimited,
    isUsersUnlimited,
  } = usePlanOverviewCard();

  if (!currentPlan?.isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Shield className="h-6 w-6 text-gray-900" />
              </div>
              <div>
                <CardTitle className="text-gray-900 mb-1">
                  Plano {currentPlan.planName}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {formatPriceByCurrency(
                    currentPlan.price,
                    currentPlan.currency,
                  )}
                  /{currentPlan.billingPeriod === 'month' ? 'mês' : 'ano'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {currentPlan.cancelAtPeriodEnd ? (
                <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
                    Cancelamento Agendado
                  </div>
                </Badge>
              ) : (
                <Badge className="bg-green-50 text-green-700 border-green-200">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                    Ativo
                  </div>
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelReactivateClick}
                className={
                  currentPlan.cancelAtPeriodEnd
                    ? 'border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700'
                    : 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700'
                }
              >
                {currentPlan.cancelAtPeriodEnd ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reativar Plano
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar Plano
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {currentPlan.cancelAtPeriodEnd
                      ? 'Acesso até'
                      : 'Próxima cobrança'}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {formattedNextBillingDate}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {currentPlan.cancelAtPeriodEnd
                      ? 'Cobrança futura'
                      : 'Valor'}
                  </span>
                  <span className="text-gray-900">
                    {currentPlan.cancelAtPeriodEnd
                      ? 'Nenhuma (cancelamento agendado)'
                      : formatPriceByCurrency(
                          currentPlan.price,
                          currentPlan.currency,
                        )}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm text-gray-900 mb-3">
                  Informações de Contato
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    general@ssnap.io
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm text-gray-900 mb-3">Uso do Plano</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Agendamentos este mês
                      </span>
                      <span className="text-sm text-gray-900">
                        {currentPlan.schedulesLength}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Lojas ativas
                      </span>
                      {isStoresUnlimited ? (
                        <Badge>Ilimitado</Badge>
                      ) : (
                        <span className="text-sm text-gray-900">
                          {currentPlan.storesLength}/
                          {currentPlan.features.UNIT_LIMIT}
                        </span>
                      )}
                    </div>
                    {!isStoresUnlimited && (
                      <Progress value={storesUsagePercentage} className="h-2" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Profissionais ativos
                      </span>
                      {isUsersUnlimited ? (
                        <Badge>Ilimitado</Badge>
                      ) : (
                        <span className="text-sm text-gray-900">
                          {currentPlan.storeMembersLength}/
                          {currentPlan.features.PRO_LIMIT}
                        </span>
                      )}
                    </div>
                    {!isUsersUnlimited && (
                      <Progress value={usersUsagePercentage} className="h-2" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
