import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useAuthStore } from '@/store/auth/auth.store';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

const DISCOVERY_SECTION_ID = 'descoberta';
const DISCOVERY_INPUT_ID = 'descoberta-query';
const HEADER_HEIGHT_PX = 80;

/** Mostra a busca compacta do header quando a busca principal sai da tela. */
export const useCompactSearch = (isEnabled: boolean) => {
  const [isCompactSearchVisible, setIsCompactSearchVisible] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;

    const section = document.getElementById(DISCOVERY_SECTION_ID);
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsCompactSearchVisible(!entry?.isIntersecting),
      { rootMargin: `-${HEADER_HEIGHT_PX}px 0px 0px 0px` },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [isEnabled]);

  const focusDiscoverySearch = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document
      .getElementById(DISCOVERY_INPUT_ID)
      ?.focus({ preventScroll: true });
  }, []);

  return { isCompactSearchVisible, focusDiscoverySearch };
};

export const useMarketplaceHeader = () => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const openAuthAction = useAuthStore((state) => state.openAuthAction);
  const { user, isLoggedIn } = useUserQuery();
  const { currentPlan } = useSubscriptionQuery();

  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((part) => part?.[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const partnerHref = currentPlan?.isActive ? '/partner' : '/pricing';
  const partnerLabel = currentPlan?.isActive
    ? 'Meu painel'
    : 'Torne-se um parceiro';

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((open) => !open);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleAuth = useCallback(() => {
    closeMenu();
    if (isLoggedIn) {
      router.push('/profile');
      return;
    }
    openAuthAction({});
  }, [closeMenu, isLoggedIn, openAuthAction, router]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isMenuOpen]);

  return {
    menuRef,
    isMenuOpen,
    initials,
    isLoggedIn,
    partnerHref,
    partnerLabel,
    toggleMenu,
    closeMenu,
    handleAuth,
  };
};
