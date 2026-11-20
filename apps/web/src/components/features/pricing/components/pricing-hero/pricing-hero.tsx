import type { ReactNode } from 'react';
import { PRICING_PILL_CLASS } from '../../pricing.constants';

type TPricingHeroConfig = {
  /** Seletor de período, ou o esqueleto dele enquanto a página carrega. */
  children: ReactNode;
};

export const PricingHero = ({ children }: TPricingHeroConfig) => (
  <div className="mx-auto max-w-[45rem] pt-4 text-center md:pt-10">
    <span className={PRICING_PILL_CLASS}>Planos</span>
    <h1 className="mt-3.5 text-[2.125rem] leading-[1.08] font-extrabold tracking-[-0.035em] md:mt-4 md:text-[3rem]">
      Preços que crescem com você
    </h1>
    <p className="mt-3 text-[0.9375rem] leading-[1.6] text-ink-muted md:mt-4 md:text-[1.0625rem]">
      Organize agenda, WhatsApp e clientes em um só lugar. Comece com teste
      gratuito e escolha o plano certo para o seu espaço.
    </p>
    <div className="mt-5 md:mt-7">{children}</div>
  </div>
);
