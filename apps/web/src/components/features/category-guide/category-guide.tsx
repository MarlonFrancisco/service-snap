import { Footer, Header } from '@/components/layout';
import {
  CATEGORY_GUIDES,
  categoryGuidePath,
  type TCategoryGuide,
} from '@/utils/constants/category-guides.constants';
import {
  businessPagePath,
  getBusinessSegment,
} from '@/utils/constants/business-pages.constants';
import { CalendarCheck, Search, UserRound } from 'lucide-react';
import Link from 'next/link';

const FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';
const PRIMARY_ACTION_CLASS = `inline-flex h-[52px] items-center rounded-full bg-[#0B0B0F] px-[26px] text-[15px] font-bold text-white transition-colors hover:bg-[#2B2B2B] ${FOCUS_CLASS}`;
const SECONDARY_ACTION_CLASS = `inline-flex h-11 items-center rounded-full border border-[#0B0B0F] px-5 text-[13px] font-bold transition-colors hover:bg-[#F7F6FA] ${FOCUS_CLASS}`;
const SECTION_TITLE_CLASS =
  'text-[22px] leading-[1.15] font-extrabold tracking-[-0.025em] md:text-[28px]';

const STEPS = [
  {
    icon: Search,
    title: 'Encontre um espaço',
    text: 'Compare serviços, preços e avaliações de quem atende perto de você.',
  },
  {
    icon: UserRound,
    title: 'Escolha serviço e profissional',
    text: 'Selecione um ou mais serviços e o profissional de sua preferência.',
  },
  {
    icon: CalendarCheck,
    title: 'Confirme o horário',
    text: 'Veja só os horários livres, confirme na hora e receba a confirmação por e-mail.',
  },
];

export function categorySearchHref(guide: TCategoryGuide): string {
  const params = new URLSearchParams({
    query: guide.name,
    category: guide.name,
  });
  return `/booking?${params.toString()}`;
}

export function CategoryGuide({ guide }: { guide: TCategoryGuide }) {
  const searchHref = categorySearchHref(guide);
  const otherGuides = CATEGORY_GUIDES.filter(
    (item) => item.slug !== guide.slug,
  );

  return (
    <Header>
      <main className="mx-auto max-w-[82.5rem] px-5 pb-20 md:px-10">
        <nav aria-label="Navegação estrutural" className="mt-3 md:mt-8">
          <ol className="flex gap-1.5 text-sm text-[#5F5C6E]">
            <li>
              <Link href="/" className={`hover:underline ${FOCUS_CLASS}`}>
                Início
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-[#0B0B0F]">
              {guide.name}
            </li>
          </ol>
        </nav>

        <h1 className="mt-3 max-w-[48rem] text-[34px] leading-[1.08] font-extrabold tracking-[-0.035em] md:text-[44px]">
          {guide.heading}
        </h1>
        <p className="mt-3 max-w-[42.5rem] text-base leading-[1.6] text-[#5F5C6E]">
          {guide.intro}
        </p>
        <div className="mt-7">
          <Link href={searchHref} className={PRIMARY_ACTION_CLASS}>
            Ver horários disponíveis
          </Link>
        </div>

        <section aria-labelledby="servicos" className="mt-14 md:mt-20">
          <h2 id="servicos" className={SECTION_TITLE_CLASS}>
            {guide.servicesTitle}
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {guide.services.map((service) => (
              <li
                key={service}
                className="rounded-full bg-[#F7F6FA] px-4 py-2.5 text-sm font-semibold"
              >
                {service}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="como-funciona" className="mt-14 md:mt-20">
          <h2 id="como-funciona" className={SECTION_TITLE_CLASS}>
            {guide.howToTitle}
          </h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="rounded-3xl bg-[#F7F6FA] p-6">
                <Icon
                  aria-hidden="true"
                  className="h-7 w-7"
                  strokeWidth={1.6}
                />
                <h3 className="mt-4 text-base font-bold">
                  {index + 1}. {title}
                </h3>
                <p className="mt-1.5 text-sm leading-[1.6] text-[#5F5C6E]">
                  {text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="perguntas" className="mt-14 md:mt-20">
          <h2 id="perguntas" className={SECTION_TITLE_CLASS}>
            Perguntas frequentes
          </h2>
          <div className="mt-5 max-w-[48rem] divide-y divide-[#EBE9F0] border-y border-[#EBE9F0]">
            {guide.faq.map((item) => (
              <details key={item.question} className="group py-4">
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

        <section aria-labelledby="outras-categorias" className="mt-14 md:mt-20">
          <h2 id="outras-categorias" className={SECTION_TITLE_CLASS}>
            Outras categorias
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {otherGuides.map((item) => (
              <li key={item.slug}>
                <Link
                  href={categoryGuidePath(item.slug)}
                  className={SECONDARY_ACTION_CLASS}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 rounded-3xl bg-[#0B0B0F] px-6 py-10 text-white md:mt-20 md:px-10">
          <h2 className={SECTION_TITLE_CLASS}>{guide.partnerTitle}</h2>
          <p className="mt-2 max-w-[36rem] text-sm leading-[1.6] text-white/70">
            Receba agendamentos online, organize sua equipe e envie lembretes
            automáticos para os clientes.
          </p>
          <Link
            href={businessPagePath(
              getBusinessSegment(guide.slug) ? guide.slug : '',
            )}
            className="mt-6 inline-flex h-11 items-center rounded-full bg-white px-5 text-[13px] font-bold text-[#0B0B0F] transition-colors hover:bg-[#EBE9F0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Conhecer o sistema
          </Link>
        </section>
      </main>
      <Footer />
    </Header>
  );
}
