import Image from 'next/image';
import Link from 'next/link';
import type { THeaderLogoConfig } from './header-logo.types';

export const HeaderLogo = ({
  variant = 'light',
  width = 176,
  height = 44,
  ...props
}: THeaderLogoConfig) => {
  const logoSrc =
    variant === 'dark' ? '/d2-lockup-dark.svg' : '/d2-lockup-light.svg';

  return (
    <Link
      href="/"
      aria-label="Home"
      className="inline-flex items-center leading-none"
      {...props}
    >
      <Image
        src={logoSrc}
        alt="ServiceSnap logo"
        width={width}
        height={height}
        className="block h-11 w-auto"
        unoptimized
        preload
      />
    </Link>
  );
};
