'use client';

import { CalendarDays, Heart, Search, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useHomeTabBar } from './home-tab-bar.hook';

const TAB_CLASS =
  'flex min-h-11 min-w-16 flex-col items-center gap-1 py-1.5 text-[11px] font-semibold';
const ICON_CLASS = 'h-6 w-6';

const PROTECTED_TABS = [
  { label: 'Favoritos', href: '/profile?tab=favorites', icon: Heart },
  { label: 'Agenda', href: '/profile?tab=bookings', icon: CalendarDays },
  { label: 'Perfil', href: '/profile?tab=settings', icon: UserRound },
];

export const HomeTabBar = () => {
  const { handleProtectedClick } = useHomeTabBar();

  return (
    <nav
      aria-label="Navegação principal"
      className="sticky bottom-0 z-40 flex justify-around border-t border-[#EBE9F0] bg-white/97 px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] md:hidden"
    >
      <Link
        href="/"
        aria-current="page"
        className={`${TAB_CLASS} text-[#9810FA]`}
      >
        <Search className={ICON_CLASS} strokeWidth={1.7} aria-hidden />
        Explorar
      </Link>
      {PROTECTED_TABS.map(({ label, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={handleProtectedClick}
          className={`${TAB_CLASS} text-[#5F5C6E]`}
        >
          <Icon className={ICON_CLASS} strokeWidth={1.7} aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
};
