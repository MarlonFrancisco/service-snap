import { cn } from '@repo/ui';
import type { SVGAttributes } from 'react';

/** Balão do WhatsApp em traço, como no desenho; decorativo. */
export const WhatsappGlyph = ({
  className,
  ...props
}: SVGAttributes<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('size-5 shrink-0', className)}
    {...props}
  >
    <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
    <path d="M9 9.5c.5 2 2 3.6 4 4.5l1.3-1.2 2 .9c-.2 1.2-1.2 2-2.4 1.8C10.6 15 8.4 12.8 8 9.6 7.9 8.5 8.7 7.5 9.8 7.3l.9 2z" />
  </svg>
);
