import {
  Brain,
  Brush,
  Camera,
  Dumbbell,
  Flower2,
  LayoutGrid,
  Leaf,
  PawPrint,
  Scissors,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

const TAB_CLASS =
  'flex min-w-14 flex-col items-center gap-1.5 border-b-2 pt-1.5 pb-3 text-xs font-semibold whitespace-nowrap transition-colors md:min-w-16 md:gap-2 md:pb-3.5';
const ICON_CLASS = 'h-6 w-6 md:h-[26px] md:w-[26px]';

/** `query` deve bater com `PUBLIC_CATEGORY_NAMES`. */
const HOME_CATEGORIES = [
  { label: 'Barbearias', query: 'Barbearia', icon: Scissors },
  { label: 'Salões', query: 'Salão de Beleza', icon: Sparkles },
  { label: 'Spas', query: 'Spa & Massagem', icon: Leaf },
  { label: 'Manicure', query: 'Manicure', icon: Brush },
  { label: 'Academias', query: 'Academia', icon: Dumbbell },
  { label: 'Yoga', query: 'Yoga', icon: Flower2 },
  { label: 'Psicologia', query: 'Psicologia', icon: Brain },
  { label: 'Pet Care', query: 'Pet Shop', icon: PawPrint },
  { label: 'Fotografia', query: 'Fotografia', icon: Camera },
];

const getCategoryHref = (query: string) => {
  const params = new URLSearchParams({ query, category: query });
  return `/booking?${params.toString()}`;
};

export const CategoryTabs = () => {
  return (
    <div className="mx-auto w-full max-w-[82.5rem] md:px-10">
      <nav
        aria-label="Categorias"
        className="mt-5 flex gap-6 overflow-x-auto border-b border-[#EBE9F0] px-5 [scrollbar-width:none] md:mt-10 md:gap-9 md:px-0 lg:justify-center"
      >
        <Link
          href="/"
          aria-current="page"
          className={`${TAB_CLASS} border-[#0B0B0F] text-[#0B0B0F]`}
        >
          <LayoutGrid className={ICON_CLASS} strokeWidth={1.6} aria-hidden />
          Tudo
        </Link>
        {HOME_CATEGORIES.map(({ label, query, icon: Icon }) => (
          <Link
            key={query}
            href={getCategoryHref(query)}
            className={`${TAB_CLASS} border-transparent text-[#5F5C6E] hover:border-[#0B0B0F] hover:text-[#0B0B0F]`}
          >
            <Icon className={ICON_CLASS} strokeWidth={1.6} aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
};
