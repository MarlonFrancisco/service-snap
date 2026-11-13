import { cva } from 'class-variance-authority';

/**
 * Chip da linha de filtros: 38px no mobile e 40px no desktop. O `after`
 * estende a área de toque para além de 44px sem mudar o desenho.
 */
export const searchFilterChipVariants = cva(
  "relative inline-flex h-[38px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors outline-none after:absolute after:inset-x-0 after:-inset-y-1 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F] md:h-10 md:px-4",
  {
    variants: {
      state: {
        active: 'border-[#0B0B0F] bg-[#0B0B0F] text-white',
        inactive:
          'border-[#E3E1EA] bg-white text-[#0B0B0F] hover:border-[#0B0B0F]',
        link: 'border-transparent bg-transparent text-[#0B0B0F] underline underline-offset-2 hover:text-[#5F5C6E]',
      },
    },
    defaultVariants: {
      state: 'inactive',
    },
  },
);
