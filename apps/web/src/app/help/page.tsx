import { Footer, Header } from '@/components/layout';
import { TrackedSummary } from '@/components/ui/tracked-summary';
import Link from 'next/link';

const FAQ_ITEMS = [
  {
    question: 'Como funciona o agendamento?',
    answer:
      'O agendamento é simples: escolha o serviço desejado, selecione um profissional disponível, escolha data e horário, e confirme seu agendamento. Você receberá uma confirmação por e-mail.',
  },
  {
    question: 'Como posso cancelar um agendamento?',
    answer:
      'Você pode cancelar seu agendamento diretamente pelo app ou site até 24 horas antes do horário marcado. Cancelamentos de última hora podem estar sujeitos a taxas conforme política do prestador.',
  },
  {
    question: 'Como funciona o sistema de avaliações?',
    answer:
      'Após cada serviço realizado, você pode avaliar o profissional com uma nota de 1 a 5 estrelas e deixar um comentário. Sua avaliação ajuda outros usuários e profissionais da plataforma.',
  },
  {
    question: 'Como posso me tornar um prestador de serviços?',
    answer:
      'Acesse "Torne-se um parceiro" no menu, escolha um plano e cadastre seu espaço.',
  },
];

export default function HelpPage() {
  return (
    <Header>
      <main className="mx-auto max-w-[82.5rem] px-5 pb-20 md:px-10">
        <div className="mx-auto max-w-[47.5rem] pt-4 md:pt-10">
          <h1 className="text-[34px] leading-[1.08] font-extrabold tracking-[-0.035em] md:text-[44px]">
            Central de ajuda
          </h1>
          <p className="mt-3 mb-7 text-[17px] leading-[1.6] text-[#5F5C6E]">
            Encontre respostas para suas dúvidas sobre o ServiceSnap.
          </p>

          {FAQ_ITEMS.map((item, index) => (
            <details
              key={item.question}
              open={index === 0}
              className="group border-b border-[#EBE9F0] first-of-type:border-t"
            >
              <TrackedSummary
                event="faq_opened"
                properties={{ page: 'help', question_index: index }}
                className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-bold after:text-2xl after:font-medium after:content-['+'] group-open:after:content-['−'] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F] [&::-webkit-details-marker]:hidden"
              >
                {item.question}
              </TrackedSummary>
              <p className="pr-10 pb-5 text-[15px] leading-[1.65] text-[#5F5C6E]">
                {item.answer}
              </p>
            </details>
          ))}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-3xl p-7 shadow-[0_12px_40px_rgba(15,12,30,0.1)]">
            <div>
              <h2 className="text-xl font-extrabold tracking-[-0.02em]">
                Não encontrou o que procurava?
              </h2>
              <p className="mt-[3px] text-sm text-[#5F5C6E]">
                Respondemos por e-mail em dias úteis.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center rounded-full bg-[#0B0B0F] px-6 py-[15px] text-sm font-bold text-white transition-colors hover:bg-[#2B2B2B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]"
            >
              Ir para contato
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </Header>
  );
}
