import { PlayCircle, Store } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PARTNER_IMAGE } from '../../homepage-v2.mock';

const STATS = [
  { value: '+42%', label: 'Novos clientes', valueClassName: 'text-[#0A0A0A]' },
  { value: '-85%', label: 'Faltas e atrasos', valueClassName: 'text-[#10B981]' },
  { value: '30 dias', label: 'Teste gratuito', valueClassName: 'text-[#0A0A0A]' },
];

export const PartnerBanner = () => {
  return (
    <section className="mx-auto mb-8 w-full max-w-[90rem] px-6 py-10 lg:px-12">
      <div className="grid grid-cols-1 items-stretch overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-12">
        <div className="flex flex-col items-start gap-6 p-8 lg:col-span-7 lg:p-14">
          <div className="flex items-center gap-2 rounded-full bg-[#F4F4F5] px-3 py-1 text-xs font-semibold tracking-wider text-[#0A0A0A] uppercase">
            <Store className="h-4 w-4" />
            ServiceSnap para Negócios
          </div>
          <h2 className="text-4xl leading-tight font-bold tracking-tight text-[#0A0A0A]">
            Tem um salão, barbearia ou clínica de estética?
          </h2>
          <p className="max-w-xl text-lg text-[#2B2B2B]">
            Multiplique seus agendamentos, organize sua equipe e zere os
            no-shows com lembretes automáticos. Junte-se a mais de 4.800
            empreendedores parceiros.
          </p>
          <div className="grid w-full max-w-md grid-cols-3 gap-6 pt-2">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <span className={`block text-[28px] leading-9 font-semibold tracking-tight ${stat.valueClassName}`}>
                  {stat.value}
                </span>
                <span className="text-xs text-[#71717A]">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <Link
              href="/pricing"
              className="rounded-2xl bg-[#0A0A0A] px-8 py-4 font-semibold text-white shadow-lg shadow-black/20 transition-all hover:scale-105 hover:bg-[#2B2B2B] active:scale-95"
            >
              Cadastrar meu espaço gratuitamente
            </Link>
            <Link
              href="/help"
              className="flex items-center gap-1.5 py-2 text-sm font-semibold text-[#2B2B2B] hover:text-[#0A0A0A]"
            >
              Ver demonstração em vídeo
              <PlayCircle className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>
        <div className="relative min-h-[380px] lg:col-span-5 lg:h-full">
          <Image
            src={PARTNER_IMAGE}
            alt="Dono de barbearia em frente ao salão, com luz natural."
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent lg:bg-gradient-to-r" />
          <div className="absolute right-6 bottom-6 left-6 rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur-md lg:left-auto lg:w-72">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F4F5] text-sm font-semibold text-[#0A0A0A]">
                MC
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A]">Marcelo Castro</p>
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
