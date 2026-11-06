import { TrackedLink } from '@/components/ui/tracked-link';
import { PartnerVideo } from './partner-video';

export const PartnerBanner = () => {
  return (
    <section className="mx-auto w-full max-w-[82.5rem] px-5 pt-10 md:px-10 md:pt-14">
      <div className="grid grid-cols-1 overflow-hidden rounded-[28px] bg-white shadow-[0_12px_40px_rgba(15,12,30,0.1)] md:rounded-[32px] xl:grid-cols-[1fr_1.5fr]">
        <div className="px-6 py-7 md:p-8 xl:p-12">
          <span className="inline-block rounded-full bg-[#F4F3F7] px-3 py-[7px] text-[11px] font-bold tracking-[0.06em] text-[#0B0B0F] uppercase md:px-3.5 md:py-2 md:text-xs">
            ServiceSnap para negócios
          </span>
          <h2 className="mt-4 text-[30px] leading-[1.1] font-extrabold tracking-[-0.035em] text-[#0B0B0F] md:mt-5 xl:text-[40px] xl:leading-[1.08]">
            Trabalha com hora marcada?
          </h2>
          <p className="mt-3.5 text-[15px] leading-[1.6] text-[#5F5C6E] md:mt-[18px] md:text-[17px]">
            Seja qual for o seu serviço, receba agendamentos online, organize
            sua equipe e acompanhe tudo em uma agenda só.
          </p>
          <div className="mt-6 flex flex-col items-stretch gap-4 md:mt-9 md:flex-row md:items-center md:gap-6">
            <TrackedLink
              href="/pricing"
              event="partner_cta_clicked"
              properties={{ placement: 'home_banner', destination: '/pricing' }}
              className="rounded-full bg-[#0B0B0F] px-[30px] py-[18px] text-center text-[15px] font-bold text-white transition-colors hover:bg-[#2B2B2B] whitespace-nowrap"
            >
              Cadastrar meu espaço
            </TrackedLink>
            <TrackedLink
              href="/sistema-de-agendamento"
              event="partner_cta_clicked"
              properties={{
                placement: 'home_banner',
                destination: '/sistema-de-agendamento',
              }}
              className="py-2 text-center text-sm font-semibold text-[#0B0B0F] hover:underline md:text-[15px] whitespace-nowrap"
            >
              Conhecer o sistema →
            </TrackedLink>
          </div>
        </div>
        {/* O vídeo com display: none nunca entra na tela, então não é baixado. */}
        <div className="relative aspect-[9/16] bg-[#0B0B0F] sm:aspect-video xl:aspect-auto">
          <PartnerVideo
            src="/videos/servicesnap-demo-vertical-v1.mp4"
            poster="/videos/servicesnap-demo-vertical-v1.jpg"
            width={810}
            height={1440}
            className="sm:hidden"
          />
          <PartnerVideo
            src="/videos/servicesnap-demo-v2.mp4"
            poster="/videos/servicesnap-demo-v2.jpg"
            width={1920}
            height={1080}
            className="hidden sm:block"
          />
        </div>
      </div>
    </section>
  );
};
