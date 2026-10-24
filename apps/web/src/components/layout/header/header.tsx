'use client';

import { cn } from '@repo/ui/index';
import { motion } from 'motion/react';
import { GlobeMenu } from './components/globe-menu';
import { HeaderLogo } from './components/header-logo';
import { MenuButton } from './components/menu-button';
import { NavigationMenu } from './components/navigation-menu';
import { PartnerButton } from './components/partner-button';
import { SearchBar } from './components/search-bar/search-bar';
import { dropdownAnimation } from './header.animation';
import { useHeader } from './header.hook';
import type { THeaderConfig } from './header.types';

export const Header = ({
  showSearchBar = false,
  logoProps = {},
  children,
  ...props
}: THeaderConfig) => {
  const { isMenuOpen, toggleMenu } = useHeader();

  return (
    <div className="min-h-screen bg-foreground">
      <header {...props} className={cn(props.className, '')}>
        {/* Header Bar */}
        <div className="absolute top-0 right-0 left-0 z-40 h-[156px] flex items-center">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full">
            <div className="mx-auto md:max-w-2xl lg:max-w-none">
              <div className="flex items-center justify-between">
                <HeaderLogo variant="light" {...logoProps} />

                {showSearchBar && <SearchBar />}

                <div className="flex items-center gap-x-2">
                  <div className="hidden lg:block">
                    <PartnerButton variant="light" />
                  </div>
                  <GlobeMenu variant="light" />
                  <MenuButton
                    isOpen={isMenuOpen}
                    onClick={toggleMenu}
                    variant="light"
                    id="header-menu-open-button"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header Bar */}
        <motion.div
          className={cn(
            'relative z-50 overflow-hidden h-full bg-foreground will-change-max-height',
            !isMenuOpen && 'pointer-events-none',
          )}
          aria-hidden={!isMenuOpen}
          inert={isMenuOpen ? false : true}
          {...dropdownAnimation(isMenuOpen)}
        >
          {/* Menu Header */}
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto md:max-w-2xl lg:max-w-none">
              <div className="flex items-center justify-between h-[156px]">
                <HeaderLogo variant="dark" />

                <div className="flex items-center gap-x-2">
                  <PartnerButton variant="dark" />
                  <GlobeMenu variant="dark" />
                  <MenuButton
                    isOpen={isMenuOpen}
                    onClick={toggleMenu}
                    variant="dark"
                    id="header-menu-close-button"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <NavigationMenu />

          {/* Footer Section */}
          {/* <div className="relative bg-foreground before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-foreground">
            <div className="mx-auto max-w-7xl mt-8 md:mt-18 pb-10 md:pb-16 px-6">
              <SocialLinks links={SOCIAL_LINKS} />
            </div>
          </div> */}
        </motion.div>
      </header>

      <div className="rounded-tl-[40px] rounded-tr-[40px] bg-background pt-40 md:pt-40">
        {children}
      </div>
    </div>
  );
};
