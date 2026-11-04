import { Footer, Header } from '@/components/layout';
import {
  BUSINESS_FEATURES,
  BUSINESS_SEGMENTS,
  businessPagePath,
  type TBusinessPage,
} from '@/utils/constants/business-pages.constants';
import { Check } from 'lucide-react';
import Link from 'next/link';

const FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';
const PRIMARY_ACTION_CLASS = `inline-flex h-[52px] items-center rounded-full bg-[#0B0B0F] px-[26px] text-[15px] font-bold text-white transition-colors hover:bg-[#2B2B2B] ${FOCUS_CLASS}`;
const SECONDARY_ACTION_CLASS = `inline-flex h-11 items-center rounded-full border border-[#0B0B0F] px-5 text-[13px] font-bold transition-colors hover:bg-[#F7F6FA] ${FOCUS_CLASS}`;
const SECTION_TITLE_CLASS =
  'text-[22px] leading-[1.15] font-extrabold tracking-[-0.025em] md:text-[28px]';

/** Segmentos para o link "Também atendemos": rótulo curto, com maiúscula. */
const SEGMENT_LABELS: Record<string, string> = {
  barbearia: 'Barbearia',
  'salao-de-beleza': 'Salão de beleza',
  manicure: 'Manicure',
  'spa-massagem': 'Spa e massagem',
};

export function BusinessLanding({ page }: { page: TBusinessPage }) {
  const isHub = !page.slug;
  const otherSegments = BUSINESS_SEGMENTS.filter(
    (segment) => segment.slug !== page.slug,
  );

  return (
    <Header>
      <main className="mx-auto max-w-[82.5rem] px-5 pb-20 md:px-10">
        <nav aria-label="Navegação estrutural" className="mt-3 md:mt-8">
          <ol className="flex flex-wrap gap-1.5 text-sm text-[#5F5C6E]">
            <li>
              <Link href="/" className={`hover:underline ${FOCUS_CLASS}`}>
                Início
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            {isHub ? (
              <li aria-current="page" className="text-[#0B0B0F]">
                Para negócios
              </li>
            ) : (
              <>
                <li>
                  <Link
                    href={businessPagePath('')}
                    className={`hover:underline ${FOCUS_CLASS}`}
                  >
                    Para negócios
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-[#0B0B0F]">
                  {SEGMENT_LABELS[page.slug] ?? page.audience}
                </li>
              </>
            )}
          </ol>
        </nav>

        <h1 className="mt-3 max-w-[48rem] text-[34px] leading-[1.08] font-extrabold tracking-[-0.035em] md:text-[44px]">
          {page.heading}
        </h1>
        <p className="mt-3 max-w-[42.5rem] text-base leading-[1.6] text-[#5F5C6E]">
          {page.intro}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link href="/pricing" className={PRIMARY_ACTION_CLASS}>
            Ver planos e testar grátis
          </Link>
          <Link href="/contact" className={SECONDARY_ACTION_CLASS}>
            Falar com a gente
          </Link>
        </div>

        <section aria-labelledby="beneficios" className="mt-14 md:mt-20">
          <h2 id="beneficios" className={SECTION_TITLE_CLASS}>
            Por que usar o ServiceSnap
          </h2>
          <ul className="mt-6 grid gap-6 md:grid-cols-3">
            {page.benefits.map((benefit) => (
              <li key={benefit.title} className="rounded-3xl bg-[#F7F6FA] p-6">
                <h3 className="text-base font-bold">{benefit.title}</h3>
                <p className="mt-1.5 text-sm leading-[1.6] text-[#5F5C6E]">
                  {benefit.text}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="funcionalidades" className="mt-14 md:mt-20">
          <h2 id="funcionalidades" className={SECTION_TITLE_CLASS}>
            Tudo o que você precisa para organizar a agenda
          </h2>
          <ul className="mt-6 grid gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
            {BUSINESS_FEATURES.map((feature) => (
              <li key={feature.title} className="flex gap-3">
                <Check
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 flex-none"
                  strokeWidth={2}
                />
                <div>
                  <h3 className="text-base font-bold">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-[1.6] text-[#5F5C6E]">
                    {feature.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="perguntas" className="mt-14 md:mt-20">
          <h2 id="perguntas" className={SECTION_TITLE_CLASS}>
            Perguntas frequentes
          </h2>
          <div className="mt-5 max-w-[48rem] divide-y divide-[#EBE9F0] border-y border-[#EBE9F0]">
            {page.faq.map((item) => (
              <details key={item.question} className="py-4">
                <summary
                  className={`cursor-pointer text-base font-bold ${FOCUS_CLASS}`}
                >
                  {item.question}
                </summary>
                <p className="mt-2 text-sm leading-[1.6] text-[#5F5C6E]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="segmentos" className="mt-14 md:mt-20">
          <h2 id="segmentos" className={SECTION_TITLE_CLASS}>
            {isHub ? 'Soluções por segmento' : 'Também atendemos'}
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {otherSegments.map((segment) => (
              <li key={segment.slug}>
                <Link
                  href={businessPagePath(segment.slug)}
                  className={SECONDARY_ACTION_CLASS}
                >
                  {SEGMENT_LABELS[segment.slug] ?? segment.audience}
                </Link>
              </li>
            ))}
            {isHub ? null : (
              <li>
                <Link
                  href={businessPagePath('')}
                  className={SECONDARY_ACTION_CLASS}
                >
                  Outros negócios
                </Link>
              </li>
            )}
          </ul>
        </section>

        <section className="mt-14 rounded-3xl bg-[#0B0B0F] px-6 py-10 text-white md:mt-20 md:px-10">
          <h2 className={SECTION_TITLE_CLASS}>
            Comece a receber agendamentos online
          </h2>
          <p className="mt-2 max-w-[36rem] text-sm leading-[1.6] text-white/70">
            Cadastre seu espaço, configure serviços e equipe e compartilhe sua
            página de agendamento com os clientes.
          </p>
          <Link
            href="/pricing"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-white px-5 text-[13px] font-bold text-[#0B0B0F] transition-colors hover:bg-[#EBE9F0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Ver planos
          </Link>
        </section>
      </main>
      <Footer />
    </Header>
  );
}
