import { CalendarCheck, Search, UserRound } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    title: '1. Encontre um espaço',
    text: 'Busque pelo serviço ou pela categoria e compare preços, avaliações e localização.',
  },
  {
    icon: UserRound,
    title: '2. Escolha serviço e profissional',
    text: 'Selecione um ou mais serviços e o profissional de sua preferência.',
  },
  {
    icon: CalendarCheck,
    title: '3. Confirme o horário',
    text: 'Escolha entre os horários livres, confirme na hora e receba a confirmação por e-mail.',
  },
];

export const HowItWorks = () => {
  return (
    <section
      aria-labelledby="como-funciona"
      className="mx-auto w-full max-w-[82.5rem] px-5 pt-12 md:px-10 md:pt-20"
    >
      <h2
        id="como-funciona"
        className="text-[22px] leading-[1.15] font-extrabold tracking-[-0.025em] md:text-[28px]"
      >
        Como funciona o ServiceSnap
      </h2>
      <p className="mt-2 max-w-[40rem] text-[15px] leading-[1.6] text-[#5F5C6E] md:text-base">
        Encontre quem atende perto de você, veja só os horários livres e
        confirme sem precisar ligar.
      </p>
      <ol className="mt-5 grid gap-3.5 md:mt-7 md:grid-cols-3 md:gap-6">
        {STEPS.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex gap-3.5 rounded-[20px] bg-[#F7F6FA] p-5 md:block md:rounded-3xl md:p-7"
          >
            <Icon
              aria-hidden="true"
              className="h-[26px] w-[26px] flex-none md:h-7 md:w-7"
              strokeWidth={1.6}
            />
            <div>
              <h3 className="text-base font-bold md:mt-4 md:text-[17px]">
                {title}
              </h3>
              <p className="mt-1 text-sm leading-[1.55] text-[#5F5C6E] md:mt-1.5 md:leading-[1.6]">
                {text}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};
