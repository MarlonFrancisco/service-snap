import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { Button } from '@repo/ui';
import { useRouter } from 'next/navigation';
import type { TPartnerButtonConfig } from './partner-button.types';

export const PartnerButton = ({
  variant = 'light',
  ...props
}: TPartnerButtonConfig) => {
  const router = useRouter();
  const { currentPlan } = useSubscriptionQuery();

  const handleClick = () => {
    if (currentPlan?.isActive) {
      router.push('/partner');
    } else {
      router.push('/pricing');
    }
  };

  const textColor = variant === 'dark' ? 'text-white' : 'text-black';
  const hoverStyles =
    variant === 'dark'
      ? 'hover:bg-gray-100 hover:text-black'
      : 'hover:bg-gray-100';

  return (
    <div className="hidden md:block">
      <Button
        variant="ghost"
        className={`text-sm font-medium ${textColor} ${hoverStyles} rounded-xl px-4 py-2`}
        onClick={handleClick}
        {...props}
      >
        {currentPlan?.isActive ? 'Meu painel' : 'Seja um parceiro'}
      </Button>
    </div>
  );
};
