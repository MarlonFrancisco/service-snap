import { cva } from 'class-variance-authority';

/**
 * Chip da linha de filtros: 38px no mobile e 40px no desktop. O `after`
 * estende a área de toque para além de 44px sem mudar o desenho.
 */
export const searchFilterChipVariants = cva(
  "relative inline-flex h-[38px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors outline-none after:absolute after:inset-x-0 after:-inset-y-1 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:h-10 md:px-4",
  {
    variants: {
      state: {
        active: 'border-ink bg-ink text-white',
        inactive:
          'border-line-strong bg-white text-ink hover:border-ink',
        link: 'border-transparent bg-transparent text-ink underline underline-offset-2 hover:text-ink-muted',
      },
    },
    defaultVariants: {
      state: 'inactive',
    },
  },
);
