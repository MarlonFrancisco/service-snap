import { Footer, Header } from '@/components/layout';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';
import Link from 'next/link';

export const metadata = createPageMetadata({
  title: 'Sobre nós | ServiceSnap',
  description:
    'Conheça o ServiceSnap, a plataforma brasileira que conecta clientes a barbearias, salões, spas e outros profissionais com agendamento online.',
  path: '/about',
});

const STORY_SECTIONS = [
  {
    title: 'Nossa história',
    text: 'O ServiceSnap nasceu da visão de simplificar a forma como as pessoas encontram e agendam serviços locais no Brasil. Percebemos que profissionais qualificados perdiam tempo gerenciando agendamentos manualmente, enquanto clientes tinham dificuldade para encontrar serviços de forma rápida e confiável.',
  },
  {
    title: 'Nossa missão',
    text: 'Transformar a experiência de agendamento no Brasil, eliminando barreiras entre clientes e profissionais. Todo mundo merece acesso fácil a serviços de qualidade, e os profissionais merecem ferramentas modernas para gerenciar seus negócios.',
  },
];

const AUDIENCES = [
  {
    title: 'Para clientes',
    text: 'Busca por categoria, agendamento online em 4 etapas, avaliações, lembretes automáticos, histórico e favoritos.',
  },
  {
    title: 'Para profissionais',
    text: 'Painel com métricas, agenda visual, gestão de equipe, cadastro de serviços, bloqueio de horários e notificações configuráveis.',
  },
  {
    title: 'Para o mercado',
    text: 'Menos faltas com lembretes, menos trabalho administrativo e mais qualidade com avaliações de clientes.',
  },
];

const VALUES = [
  {
    title: 'Transparência',
    text: 'Preços transparentes, avaliações reais e informações completas para decisões informadas.',
  },
  {
    title: 'Qualidade',
    text: 'A satisfação dos nossos usuários é nossa prioridade.',
  },
  {
    title: 'Inovação',
    text: 'Sempre buscando melhorar a experiência com tecnologia e design centrado no usuário.',
  },
  {
    title: 'Comunidade',
    text: 'Clientes e profissionais crescendo juntos, com respeito e confiança mútua.',
  },
];

const SECTION_TITLE_CLASS = 'text-[28px] font-extrabold tracking-[-0.03em]';

export default function AboutPage() {
  return (
    <Header>
      <main className="mx-auto max-w-[82.5rem] px-5 pb-20 md:px-10">
        <div className="max-w-[53.75rem] pt-5 md:pt-12">
          <h1 className="text-[38px] leading-[1.05] font-extrabold tracking-[-0.04em] md:text-[56px]">
            Conectando pessoas aos melhores profissionais de serviços locais
          </h1>
          <p className="mt-[18px] text-[19px] leading-[1.6] text-[#5F5C6E]">
            Um marketplace brasileiro para encontrar, comparar e agendar de
            beleza e saúde a oficinas e consultorias.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] gap-x-16 gap-y-10 pt-16">
          {STORY_SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className={SECTION_TITLE_CLASS}>{section.title}</h2>
              <p className="mt-3 text-base leading-[1.7] text-[#2C2A36]">
                {section.text}
              </p>
            </section>
          ))}
        </div>

        <section className="pt-[72px]">
          <h2 className={SECTION_TITLE_CLASS}>O que fazemos</h2>
          <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-5">
            {AUDIENCES.map((audience) => (
              <article
                key={audience.title}
                className="rounded-3xl bg-[#F7F6FA] p-[26px]"
              >
                <h3 className="text-lg font-extrabold tracking-[-0.015em]">
                  {audience.title}
                </h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-[#5F5C6E]">
                  {audience.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="pt-[72px]">
          <h2 className={SECTION_TITLE_CLASS}>Nossos valores</h2>
          <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-x-8 gap-y-7">
            {VALUES.map((value) => (
              <div key={value.title}>
                <h3 className="border-t-2 border-[#0B0B0F] pt-3.5 text-[17px] font-bold">
                  {value.title}
                </h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-[#5F5C6E]">
                  {value.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-[72px] flex flex-wrap items-center justify-between gap-6 rounded-[32px] p-6 shadow-[0_12px_40px_rgba(15,12,30,0.1)] md:p-10">
          <div>
            <h2 className="text-[30px] font-extrabold tracking-[-0.03em]">
              Pronto para agendar?
            </h2>
            <p className="mt-1.5 text-[15px] text-[#5F5C6E]">
              Encontre profissionais perto de você.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full bg-[#0B0B0F] px-7 py-[17px] text-[15px] font-bold text-white transition-colors hover:bg-[#2B2B2B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]"
          >
            Explorar serviços
          </Link>
        </div>
      </main>
      <Footer />
    </Header>
  );
}
