import { Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

export const GuideEyebrow = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-bold tracking-[0.06em] text-[#9810FA] uppercase">
    {children}
  </p>
);

export const GuideTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-xl font-extrabold tracking-[-0.02em]">{children}</h3>
);

export const GuideText = ({ children }: { children: ReactNode }) => (
  <p className="text-sm leading-relaxed text-[#5F5C6E]">{children}</p>
);

/** Nome de botão ou menu como aparece na tela da Meta. */
export const Kbd = ({ children }: { children: ReactNode }) => (
  <span className="inline-block rounded-lg border border-[#E3E1EA] bg-[#FAFAFC] px-2 py-px text-[13px] font-semibold whitespace-nowrap text-[#0B0B0F]">
    {children}
  </span>
);

export const GuideInstructions = ({ items }: { items: ReactNode[] }) => (
  <ol className="grid gap-3">
    {items.map((item, index) => (
      <li
        key={index}
        className="relative pl-10 text-sm leading-[1.55] text-[#2B2934] [&_b]:text-[#0B0B0F]"
      >
        <span
          aria-hidden="true"
          className="absolute top-[-1px] left-0 grid size-[26px] place-items-center rounded-full bg-[#F4F3F7] text-xs font-bold text-[#0B0B0F]"
        >
          {index + 1}
        </span>
        {item}
      </li>
    ))}
  </ol>
);

export const GuideTip = ({ children }: { children: ReactNode }) => (
  <div className="flex gap-3 rounded-[16px] bg-[#F4F3F7] px-4 py-3.5 text-sm leading-normal text-[#2B2934]">
    <Info aria-hidden="true" className="mt-px size-5 shrink-0 stroke-[1.8]" />
    <span>{children}</span>
  </div>
);

export const GuideWarning = ({ children }: { children: ReactNode }) => (
  <div className="flex gap-3 rounded-[16px] bg-[#FFF4E5] px-4 py-3.5 text-sm leading-normal text-[#6B3A00]">
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
    className="font-bold text-[#0B0B0F] underline underline-offset-[3px]"
  >
    {children}
    <span className="sr-only"> (abre em nova aba)</span>
  </a>
);
