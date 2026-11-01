import Link from 'next/link';
import { MARKETPLACE_CATEGORIES } from '../../homepage.mock';

export const CategoryRail = () => {
  return (
    <section className="sticky top-20 z-40 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex w-full items-center justify-center px-4 py-3 sm:px-6">
        <nav
          aria-label="Categorias"
          className="flex items-center justify-center gap-7 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {MARKETPLACE_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const params = new URLSearchParams({
              query: category.query,
              category: category.query,
            });

            return (
              <Link
                key={category.id}
                href={`/booking?${params.toString()}`}
                className="group relative flex shrink-0 flex-col items-center gap-2 pb-2 opacity-70 transition-opacity hover:opacity-100"
              >
                <Icon className="h-6 w-6 text-[#2B2B2B] transition-transform group-hover:scale-110" />
                <span className="text-sm whitespace-nowrap text-[#2B2B2B]">
                  {category.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
};
