import { PlayCircle, Store } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PARTNER_IMAGE } from '../../homepage.mock';

const STATS = [
  { value: '+42%', label: 'Novos clientes', valueClassName: 'text-[#0A0A0A]' },
  { value: '-85%', label: 'Faltas e atrasos', valueClassName: 'text-[#10B981]' },
  { value: '30 dias', label: 'Teste gratuito', valueClassName: 'text-[#0A0A0A]' },
];

export const PartnerBanner = () => {
  return (
    <section className="mx-auto mb-6 w-full max-w-[90rem] px-4 py-6 sm:mb-8 sm:px-6 sm:py-10 lg:px-12">
      <div className="grid grid-cols-1 items-stretch overflow-hidden rounded-2xl bg-white shadow-xl sm:rounded-3xl lg:grid-cols-12">
        <div className="flex flex-col items-start gap-4 p-5 sm:gap-6 sm:p-8 lg:col-span-7 lg:p-14">
          <div className="flex items-center gap-2 rounded-full bg-[#F4F4F5] px-3 py-1 text-[10px] font-semibold tracking-wider text-[#0A0A0A] uppercase sm:text-xs">
            <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ServiceSnap para Negócios
          </div>
          <h2 className="text-2xl leading-tight font-bold tracking-tight text-[#0A0A0A] sm:text-3xl lg:text-4xl">
            Tem um salão, barbearia ou clínica de estética?
          </h2>
          <p className="max-w-xl text-sm text-[#2B2B2B] sm:text-base lg:text-lg">
            Multiplique seus agendamentos, organize sua equipe e zere os
            no-shows com lembretes automáticos. Junte-se a mais de 4.800
            empreendedores parceiros.
          </p>
          <div className="grid w-full max-w-md grid-cols-3 gap-3 pt-1 sm:gap-6 sm:pt-2">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <span
                  className={`block text-xl leading-7 font-semibold tracking-tight sm:text-[28px] sm:leading-9 ${stat.valueClassName}`}
                >
                  {stat.value}
                </span>
                <span className="text-[10px] text-[#71717A] sm:text-xs">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex w-full flex-col items-stretch gap-3 pt-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:pt-3">
            <Link
              href="/pricing"
              className="rounded-2xl bg-[#0A0A0A] px-5 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-black/20 transition-all active:scale-[0.98] hover:bg-[#2B2B2B] sm:px-8 sm:py-4 sm:text-base md:hover:scale-105"
            >
              Cadastrar meu espaço
            </Link>
            <Link
              href="/help"
              className="flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-[#2B2B2B] active:opacity-70 hover:text-[#0A0A0A]"
            >
              Ver demonstração
              <PlayCircle className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>
        <div className="relative min-h-[220px] sm:min-h-[280px] lg:col-span-5 lg:min-h-full lg:h-full">
          <Image
            src={PARTNER_IMAGE}
            alt="Dono de barbearia em frente ao salão, com luz natural."
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent lg:bg-gradient-to-r" />
          <div className="absolute right-4 bottom-4 left-4 rounded-2xl bg-white/90 p-3 shadow-lg backdrop-blur-md sm:right-6 sm:bottom-6 sm:left-6 sm:p-4 lg:left-auto lg:w-72">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F4F5] text-sm font-semibold text-[#0A0A0A] sm:h-10 sm:w-10">
                MC
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A]">
                  Marcelo Castro
                </p>
                <p className="text-xs text-[#71717A]">Dono da Barbearia 1821</p>
              </div>
            </div>
            <p className="text-xs text-[#2B2B2B] italic">
              “Minha agenda lotou logo na primeira semana. O sistema de WhatsApp
              eliminou os furos na agenda.”
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
