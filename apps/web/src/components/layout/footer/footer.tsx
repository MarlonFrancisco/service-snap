'use client';

import { LocaleDialog } from '@/components/layout/locale-dialog';
import { useConsentStore } from '@/store/consent';
import { useLocaleStore } from '@/store/locale';
import { SOCIAL_LINKS } from '@/utils/constants/contact.constants';
import { COUNTRIES, CURRENCIES } from '@repo/shared/constants';
import { cn } from '@repo/ui';
import Image from 'next/image';
import { TrackedLink } from '@/components/ui/tracked-link';
import { useState } from 'react';
import type { TFooterConfig } from './footer.types';

const COLUMN_TITLE_CLASS = 'mb-2 text-sm font-bold text-[#0B0B0F] md:mb-3';
const COLUMN_LINK_CLASS =
  'block py-2 transition-colors hover:text-[#0B0B0F] md:py-[7px]';

export const Footer = ({ compact = false }: TFooterConfig) => {
  const [isLocaleOpen, setIsLocaleOpen] = useState(false);
  const { country, currency } = useLocaleStore();
  const openCookiePreferences = useConsentStore(
    (state) => state.openPreferences,
  );

  const countryData = COUNTRIES[country];
  const currencyData = CURRENCIES[currency];
  const copyrightYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'mx-auto w-full max-w-[82.5rem] px-5 md:px-10',
        compact && 'mt-20 hidden md:block',
      )}
    >
      <div
        className={cn(
          'border-t border-[#EBE9F0] text-sm text-[#5F5C6E]',
          compact ? 'py-7' : 'pt-8 pb-10 md:pt-12',
        )}
      >
        {compact ? null : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-[1fr_1fr_1fr_2fr] md:gap-8">
            <div>
              <h3 className={COLUMN_TITLE_CLASS}>Empresa</h3>
              <TrackedLink
                href="/about"
                event="footer_link_clicked"
                properties={{ destination: '/about' }}
                className={COLUMN_LINK_CLASS}
              >
                Sobre nós
              </TrackedLink>
              <TrackedLink
                href="/privacy"
                event="footer_link_clicked"
                properties={{ destination: '/privacy' }}
                className={COLUMN_LINK_CLASS}
              >
                Privacidade
              </TrackedLink>
              <TrackedLink
                href="/terms"
                event="footer_link_clicked"
                properties={{ destination: '/terms' }}
                className={COLUMN_LINK_CLASS}
              >
                Termos
              </TrackedLink>
            </div>

            <div>
              <h3 className={COLUMN_TITLE_CLASS}>Suporte</h3>
              <TrackedLink
                href="/help"
                event="footer_link_clicked"
                properties={{ destination: '/help' }}
                className={COLUMN_LINK_CLASS}
              >
                Central de ajuda
              </TrackedLink>
              <TrackedLink
                href="/help"
                event="footer_link_clicked"
                properties={{ destination: '/help' }}
                className={COLUMN_LINK_CLASS}
              >
                Como funciona
              </TrackedLink>
              <TrackedLink
                href="/contact"
                event="footer_link_clicked"
                properties={{ destination: '/contact' }}
                className={COLUMN_LINK_CLASS}
              >
                Contato
              </TrackedLink>
            </div>

            <div>
              <h3 className={COLUMN_TITLE_CLASS}>Parceiros</h3>
              <TrackedLink
                href="/sistema-de-agendamento"
                event="footer_link_clicked"
                properties={{ destination: '/sistema-de-agendamento' }}
                className={COLUMN_LINK_CLASS}
              >
                Sistema de agendamento
              </TrackedLink>
              <TrackedLink
                href="/pricing"
                event="footer_link_clicked"
                properties={{ destination: '/pricing' }}
                className={COLUMN_LINK_CLASS}
              >
                Planos
              </TrackedLink>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h3 className={COLUMN_TITLE_CLASS}>Fale conosco</h3>
              <p className="mb-4 leading-[1.6]">
                Dúvidas, indicação de profissionais ou interesse em ser parceiro
                — estamos a um e-mail de distância.
              </p>
              <TrackedLink
                href="/contact"
                event="footer_link_clicked"
                properties={{ destination: '/contact' }}
                className="inline-block rounded-full bg-[#0B0B0F] px-[22px] py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#2B2B2B]"
              >
                Ir para contato
              </TrackedLink>
            </div>
          </div>
        )}

        <div
          className={cn(
            'flex flex-col gap-4 text-[13px] md:flex-row md:items-center md:justify-between',
            !compact && 'mt-8 border-t border-[#EBE9F0] pt-6 md:mt-12',
          )}
        >
          <TrackedLink
            href="/"
            event="footer_link_clicked"
            properties={{ destination: '/' }}
            className="self-start md:self-auto"
          >
            <Image
              src="/d2-lockup-light.svg"
              alt="ServiceSnap"
              width={148}
              height={37}
              className="h-9 w-auto"
              unoptimized
            />
          </TrackedLink>

          <div className="flex flex-wrap items-center gap-4">
            {SOCIAL_LINKS.length > 0 && !compact ? (
              <ul
                className="flex items-center gap-1"
                aria-label="Redes sociais"
              >
                {SOCIAL_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <TrackedLink
                        href={link.href}
                        event="social_link_clicked"
                        properties={{ network: link.label, page: 'footer' }}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[#F4F3F7] hover:text-[#0B0B0F]"
                      >
                        <Icon className="h-4 w-4" />
                      </TrackedLink>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            <button
              type="button"
              onClick={openCookiePreferences}
              className="min-h-11 transition-colors hover:text-[#0B0B0F]"
            >
              Preferências de cookies
            </button>

            <button
              type="button"
              onClick={() => setIsLocaleOpen(true)}
              className="min-h-11 transition-colors hover:text-[#0B0B0F]"
            >
              {countryData?.nativeName} · {currencyData?.symbol} {currency}
            </button>
          </div>

          <p>© ServiceSnap Inc. {copyrightYear}</p>
        </div>
      </div>

      <LocaleDialog open={isLocaleOpen} onOpenChange={setIsLocaleOpen} />
    </footer>
  );
};
