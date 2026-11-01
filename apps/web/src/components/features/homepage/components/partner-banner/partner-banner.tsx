import Image from 'next/image';
import Link from 'next/link';
import { PARTNER_IMAGE } from '../../homepage.mock';

const STATS = [
  { value: '+42%', label: 'Novos clientes', valueClassName: 'text-[#0B0B0F]' },
  { value: '-85%', label: 'Faltas e atrasos', valueClassName: 'text-[#0A7D4F]' },
  { value: '30 dias', label: 'Teste gratuito', valueClassName: 'text-[#0B0B0F]' },
];

export const PartnerBanner = () => {
  return (
    <section className="mx-auto w-full max-w-[82.5rem] px-5 pt-10 md:px-10 md:pt-14">
      <div className="grid grid-cols-1 overflow-hidden rounded-[28px] bg-white shadow-[0_12px_40px_rgba(15,12,30,0.1)] md:rounded-[32px] lg:grid-cols-[1.1fr_1fr]">
        <div className="px-6 py-7 md:p-8 lg:p-16">
          <span className="inline-block rounded-full bg-[#F4F3F7] px-3 py-[7px] text-[11px] font-bold tracking-[0.06em] text-[#0B0B0F] uppercase md:px-3.5 md:py-2 md:text-xs">
            ServiceSnap para negócios
          </span>
          <h2 className="mt-4 text-[30px] leading-[1.1] font-extrabold tracking-[-0.035em] text-[#0B0B0F] md:mt-5 lg:text-[44px] lg:leading-[1.08]">
            Tem um salão, barbearia ou clínica de estética?
          </h2>
          <p className="mt-3.5 text-[15px] leading-[1.6] text-[#5F5C6E] md:mt-[18px] md:text-[17px]">
            Multiplique seus agendamentos, organize sua equipe e zere os
            no-shows com lembretes automáticos. Junte-se a mais de 4.800
            empreendedores parceiros.
          </p>
          <div className="mt-6 flex justify-between gap-3 md:mt-8 md:justify-start md:gap-11">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <b
                  className={`block text-2xl font-extrabold tracking-[-0.03em] md:text-[34px] ${stat.valueClassName}`}
                >
                  {stat.value}
                </b>
                <span className="text-xs text-[#5F5C6E] md:text-[13px]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col items-stretch gap-4 md:mt-9 md:flex-row md:items-center md:gap-6">
            <Link
              href="/pricing"
              className="rounded-full bg-[#0B0B0F] px-[30px] py-[18px] text-center text-[15px] font-bold text-white transition-colors hover:bg-[#2B2B2B]"
            >
              Cadastrar meu espaço
            </Link>
            <Link
              href="/help"
              className="py-2 text-center text-sm font-semibold text-[#0B0B0F] hover:underline md:text-[15px]"
            >
              Ver demonstração →
            </Link>
          </div>
        </div>
        <div className="relative flex min-h-[260px] items-end bg-[#2B2420] p-4 md:p-6 lg:min-h-[520px]">
          <Image
            src={PARTNER_IMAGE}
            alt="Dono de barbearia em frente ao salão, com luz natural."
            fill
            quality={90}
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
          <figure className="relative m-0 max-w-[380px] rounded-[18px] bg-white/94 p-4 text-[13px] leading-[1.5] text-[#0B0B0F] md:rounded-[20px] md:p-[22px] md:text-sm">
            <div className="mb-2.5 flex items-center gap-3">
              <span
                aria-hidden
                className="hidden h-10 w-10 place-items-center rounded-full bg-[#F4F3F7] text-[13px] font-bold md:grid"
              >
                MC
              </span>
              <figcaption>
                <b className="block">Marcelo Castro</b>
                <span className="text-[13px] text-[#5F5C6E]">
                  Dono da Barbearia 1821
                </span>
              </figcaption>
            </div>
            <blockquote className="m-0">
              “Minha agenda lotou logo na primeira semana. O sistema de WhatsApp
              eliminou os furos na agenda.”
            </blockquote>
          </figure>
        </div>
      </div>
    </section>
  );
};
