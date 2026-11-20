import { Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

export const GuideEyebrow = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-bold tracking-[0.06em] text-brand uppercase">
    {children}
  </p>
);

export const GuideTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-xl font-extrabold tracking-[-0.02em]">{children}</h3>
);

export const GuideText = ({ children }: { children: ReactNode }) => (
  <p className="text-sm leading-relaxed text-ink-muted">{children}</p>
);

/** Nome de botão ou menu como aparece na tela da Meta. */
export const Kbd = ({ children }: { children: ReactNode }) => (
  <span className="inline-block rounded-lg border border-line-strong bg-surface-0 px-2 py-px text-[13px] font-semibold whitespace-nowrap text-ink">
    {children}
  </span>
);

export const GuideInstructions = ({ items }: { items: ReactNode[] }) => (
  <ol className="grid gap-3">
    {items.map((item, index) => (
      <li
        key={index}
        className="relative pl-10 text-sm leading-[1.55] text-ink-body [&_b]:text-ink"
      >
        <span
          aria-hidden="true"
          className="absolute top-[-1px] left-0 grid size-[26px] place-items-center rounded-full bg-surface-2 text-xs font-bold text-ink"
        >
          {index + 1}
        </span>
        {item}
      </li>
    ))}
  </ol>
);

export const GuideTip = ({ children }: { children: ReactNode }) => (
  <div className="flex gap-3 rounded-[16px] bg-surface-2 px-4 py-3.5 text-sm leading-normal text-ink-body">
    <Info aria-hidden="true" className="mt-px size-5 shrink-0 stroke-[1.8]" />
    <span>{children}</span>
  </div>
);

export const GuideWarning = ({ children }: { children: ReactNode }) => (
  <div className="flex gap-3 rounded-[16px] bg-warning-bg px-4 py-3.5 text-sm leading-normal text-warning">
    <TriangleAlert
      aria-hidden="true"
      className="mt-px size-5 shrink-0 stroke-[1.8]"
    />
    <span>{children}</span>
  </div>
);

export const ExternalLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="font-bold text-ink underline underline-offset-[3px]"
  >
    {children}
    <span className="sr-only"> (abre em nova aba)</span>
  </a>
);
