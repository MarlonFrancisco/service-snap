import { categoryGuidePath } from '@/utils/constants/category-guides.constants';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { CATEGORY_DIRECTORY_GROUPS } from './category-directory.constants';

const FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';

export const CategoryDirectory = () => {
  return (
    <section
      aria-labelledby="explore-categorias"
      className="mx-auto w-full max-w-[82.5rem] px-5 pt-12 md:px-10 md:pt-20"
    >
      <h2
        id="explore-categorias"
        className="text-[22px] leading-[1.15] font-extrabold tracking-[-0.025em] md:text-[28px]"
      >
        Explore por categoria
      </h2>
      <p className="mt-2 max-w-[40rem] text-[15px] leading-[1.6] text-[#5F5C6E] md:text-base">
        De barbearias e clínicas a eletricistas e consultorias: tudo o que
        funciona com hora marcada.
      </p>

      {/* Celular: grupos que abrem e fecham, para a lista não ficar enorme. */}
      <div className="mt-4 border-t border-[#EBE9F0] md:hidden">
        {CATEGORY_DIRECTORY_GROUPS.map((group, index) => (
          <details
            key={group.title}
            open={index === 0}
            className="group border-b border-[#EBE9F0]"
          >
            <summary
              className={`flex min-h-14 cursor-pointer list-none items-center justify-between text-base font-bold [&::-webkit-details-marker]:hidden ${FOCUS_CLASS}`}
            >
              {group.title}
              <span className="flex items-center gap-2 text-[13px] font-semibold text-[#5F5C6E]">
                {group.items.length}
                <ChevronDown
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-open:rotate-180"
                />
              </span>
            </summary>
            <ul className="flex flex-wrap gap-2 pb-4">
              {group.items.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={categoryGuidePath(item.slug)}
                    className={`inline-flex h-11 items-center rounded-full border border-[#E3E1EA] px-4 text-sm font-semibold ${FOCUS_CLASS}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>

      {/* Desktop: todos os grupos abertos, em colunas. */}
      <div className="mt-7 hidden gap-x-8 gap-y-9 md:grid md:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_DIRECTORY_GROUPS.map((group) => (
          <div key={group.title}>
            <h3 className="border-b border-[#EBE9F0] pb-3 text-[15px] font-bold">
              {group.title}
            </h3>
            <ul className="mt-3 grid gap-0.5">
              {group.items.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={categoryGuidePath(item.slug)}
                    className={`flex min-h-10 items-center justify-between text-[15px] text-[#2C2A36] hover:text-[#0B0B0F] hover:underline ${FOCUS_CLASS}`}
                  >
                    {item.label}
                    <span aria-hidden="true" className="text-[#A6A3B4]">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};
