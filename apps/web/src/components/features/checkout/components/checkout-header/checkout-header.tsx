import { HeaderLogo } from '@/components/layout/header/components/header-logo';

export const CheckoutHeader = () => {
  return (
    <header className="mx-auto flex h-16 max-w-[1320px] items-center px-5 md:h-20 md:px-10">
      <HeaderLogo
        width={148}
        height={37}
        aria-label="ServiceSnap, página inicial"
      />
    </header>
  );
};
