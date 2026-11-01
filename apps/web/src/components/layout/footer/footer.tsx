'use client';

import { LocaleDialog } from '@/components/layout/locale-dialog';
import { useLocaleStore } from '@/store/locale';
import { SOCIAL_LINKS } from '@/utils/constants/contact.constants';
import { COUNTRIES, CURRENCIES } from '@repo/shared/constants';
import { getFlagEmoji } from '@repo/ui';
import { Globe } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export const Footer = () => {
  const [isLocaleOpen, setIsLocaleOpen] = useState(false);
  const { country, currency } = useLocaleStore();

  const countryData = COUNTRIES[country];
  const currencyData = CURRENCIES[currency];
  const copyrightYear = new Date().getFullYear();

  return (
    <footer>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="mb-4 text-sm font-medium text-gray-900 sm:mb-6">
                Empresa
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sobre nós
                  </Link>
                </li>

                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Termos
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-medium text-gray-900 sm:mb-6">
                Suporte
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/help"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Central de ajuda
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Como funciona
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Contato
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-medium text-gray-900 sm:mb-6">
                Parceiros
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/pricing"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Planos
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Fale conosco
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Dúvidas, indicação de profissionais ou interesse em ser parceiro —
              estamos a um e-mail de distância.
            </p>
            <Link
              href="/contact"
              className="inline-flex px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Ir para contato
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-6 border-t border-gray-200 pt-8 md:mt-16 md:flex-row">
          <Link href="/">
            <Image
              src="/d2-lockup-light.svg"
              alt="ServiceSnap"
              width={148}
              height={37}
              className="h-9 w-auto sm:h-11"
              unoptimized
            />
          </Link>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            {SOCIAL_LINKS.length > 0 ? (
              <ul className="flex items-center gap-3" aria-label="Redes sociais">
                {SOCIAL_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            <button
              type="button"
              onClick={() => setIsLocaleOpen(true)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span>{getFlagEmoji(country)}</span>
              <span>{countryData?.nativeName}</span>
              <span className="text-gray-400">·</span>
              <span>
                {currencyData?.symbol} {currency}
              </span>
            </button>

            <p className="text-sm text-gray-600">
              © ServiceSnap Inc. {copyrightYear}
            </p>
          </div>
        </div>
      </div>

      <LocaleDialog open={isLocaleOpen} onOpenChange={setIsLocaleOpen} />
    </footer>
  );
};
