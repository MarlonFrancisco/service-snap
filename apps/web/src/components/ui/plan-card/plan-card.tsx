import { formatPriceByCountry } from '@/utils/helpers/price.helper';
import { formatPriceByCurrency } from '@repo/shared/formatters';
import { Badge, Button, Card } from '@repo/ui';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { usePlanCard } from './plan-card.hook';
import { TPlanCardConfig } from './plan-card.types';

export const PlanCard = ({
  plan,
  index,
  trialPeriodDays,
  isCurrentPlan = false,
  customButtonText,
  onSelectPlan,
  isLoading = false,
}: TPlanCardConfig) => {
  const { handleCreateSubscription } = usePlanCard({ priceId: plan.priceId });

  const hasDiscount = plan.discount > 0;
  const hasTrial = trialPeriodDays > 0;
  const priceInReais = plan.price / 100;
  const originalPrice = hasDiscount
    ? priceInReais / (1 - plan.discount / 100)
    : priceInReais;

  const handleClick = () => {
    if (onSelectPlan) {
      onSelectPlan(plan.priceId);
    } else {
      handleCreateSubscription();
    }
  };

  return (
    <motion.div
      key={plan.name}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      className="relative h-full select-none"
    >
      <Card
        className={`relative h-full p-8 ${
          plan.popular
            ? 'border-2 border-black shadow-xl'
            : 'border border-gray-200'
        } ${isCurrentPlan ? 'opacity-75' : ''}`}
      >
        {/* Never show "Mais popular" together with "Plano Atual" — confusing in partner upgrade. */}
        {isCurrentPlan ? (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white">
            Plano Atual
          </Badge>
        ) : plan.popular ? (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white">
            Mais popular
          </Badge>
        ) : null}

        <div className="mb-8">
          <h3 className="text-xl text-gray-900 mb-2">{plan.name}</h3>
          <p className="text-sm text-gray-600">{plan.description}</p>
        </div>

        <div className="mb-8">
          {hasDiscount && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500 line-through">
                {formatPriceByCountry(originalPrice)}
              </span>
              <Badge
                variant="outline"
                className="border-green-600 text-green-600 text-xs"
              >
                -{plan.discount}%
              </Badge>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl text-gray-900">
              {formatPriceByCurrency(priceInReais, plan.currency)}
            </span>
            <span className="text-gray-600">
              /{plan.interval === 'month' ? 'mês' : 'ano'}
            </span>
          </div>
          {hasTrial && !isCurrentPlan && (
            <p className="text-sm text-gray-500 mt-2">
              {trialPeriodDays} dias grátis, depois{' '}
              {formatPriceByCountry(priceInReais)}/
              {plan.interval === 'month' ? 'mês' : 'ano'}
            </p>
          )}
        </div>

        <Button
          className={`w-full mb-8 ${
            isCurrentPlan
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : plan.popular
                ? 'bg-black hover:bg-gray-800 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
          }`}
          onClick={handleClick}
          disabled={isCurrentPlan || isLoading}
        >
          {customButtonText || 'Assinar plano'}
        </Button>

        <ul className="space-y-4">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </Card>
    </motion.div>
  );
};
