'use client';

import { LocaleDialog } from '@/components/layout/locale-dialog';
import { useLocaleStore } from '@/store/locale';
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
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-6">
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
              <h3 className="text-sm font-medium text-gray-900 mb-6">
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
              <h3 className="text-sm font-medium text-gray-900 mb-6">
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

        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/">
            <Image
              src="/d2-lockup-light.svg"
              alt="ServiceSnap"
              width={176}
              height={44}
              className="h-11 w-auto"
              unoptimized
            />
          </Link>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
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
