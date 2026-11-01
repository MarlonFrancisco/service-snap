import { cn } from '@repo/ui';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { PARTNER_MUTED_TEXT_CLASS } from '../../../../partner.styles';

type TServicesStatePanelConfig = {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: 'neutral' | 'error';
  role?: 'alert';
  children?: ReactNode;
};

export const ServicesStatePanel = ({
  icon: Icon,
  title,
  description,
  tone = 'neutral',
  role,
  children,
}: TServicesStatePanelConfig) => (
  <div
    role={role}
    className="flex min-h-[230px] flex-col items-center justify-center gap-2 rounded-[24px] border border-[#EBE9F0] p-6 text-center"
  >
    <span
      aria-hidden="true"
      className={cn(
        'grid size-12 place-items-center rounded-full',
        tone === 'error' ? 'bg-[#FBE8E6]' : 'bg-[#F4F3F7]',
      )}
    >
      <Icon
        className={cn(
          'size-[22px] stroke-[1.8]',
          tone === 'error' ? 'text-[#A4231A]' : 'text-[#0B0B0F]',
        )}
      />
    </span>
    <h3 className="text-lg font-extrabold tracking-[-0.02em]">{title}</h3>
    <p
      className={cn(
        'max-w-[340px] text-sm leading-normal',
        PARTNER_MUTED_TEXT_CLASS,
      )}
    >
      {description}
    </p>
    {children}
  </div>
);
