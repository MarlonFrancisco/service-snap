import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useAuthStore } from '@/store/auth/auth.store';
import { useIsMobile } from '@repo/ui';
import Link from 'next/link';
import { useCallback, useMemo } from 'react';
import { NAVIGATION_ITEMS } from '../../header.constants';

const navItemClassName =
  // No -mx-6 on mobile: w-full + negative margin left the item viewport-left but
  // short on the right (~48px), so text-center sat left of the true midpoint.
  // md (not sm): 2-col grid only when the mobile-only partner item leaves the list.
  'text-2xl md:text-5xl text-center group relative isolate mx-0 bg-foreground px-6 py-6 even:mt-px md:px-0 md:py-16 md:odd:pr-16 md:even:mt-0 md:even:border-l md:even:border-neutral-200/10 md:even:pl-16 w-full whitespace-normal break-words';

export const NavigationMenu = () => {
  const openAuthAction = useAuthStore((state) => state.openAuthAction);
  const { currentPlan } = useSubscriptionQuery();
  const { isLoggedIn } = useUserQuery();

  const isMobile = useIsMobile();

  const handleAuth = useCallback(() => {
    openAuthAction({});
  }, [openAuthAction]);

  const navigationItems = useMemo(() => {
    const items = [...NAVIGATION_ITEMS];

    if (isMobile) {
      items.unshift(
        currentPlan?.isActive
          ? {
              href: '/partner',
              label: 'Meu painel',
            }
          : {
              href: '/pricing',
              label: 'Seja um parceiro',
            },
      );
    }

    if (isLoggedIn) {
      items.unshift({
        href: '/profile',
        label: 'Meu perfil',
      });
    } else {
      items.unshift({
        onClick: handleAuth,
        label: 'Entrar ou registrar-se',
      });
    }

    return items;
  }, [isLoggedIn, handleAuth, isMobile, currentPlan?.isActive]);

  return (
    <nav className="mt-px font-display text-5xl font-medium tracking-tight text-white">
      <div className="even:mt-px bg-foreground">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {navigationItems.map((item) => {
                if (item.onClick && !item.href) {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      className={`${navItemClassName} appearance-none border-0 cursor-pointer`}
                    >
                      {item.label}
                      <span className="absolute inset-y-0 -z-10 w-screen group-odd:right-0 group-even:left-0 bg-transparent md:border-b md:border-t md:border-neutral-200/10 hover:display-none" />
                      <span className="absolute inset-y-0 -z-10 w-screen bg-neutral-800 opacity-0 transition group-odd:right-0 group-even:left-0 group-hover:opacity-100" />
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href!}
                    onClick={item.onClick}
                    className={navItemClassName}
                  >
                    {item.label}
                    <span className="absolute inset-y-0 -z-10 w-screen group-odd:right-0 group-even:left-0 bg-transparent md:border-b md:border-t md:border-neutral-200/10 hover:display-none" />
                    <span className="absolute inset-y-0 -z-10 w-screen bg-neutral-800 opacity-0 transition group-odd:right-0 group-even:left-0 group-hover:opacity-100" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
