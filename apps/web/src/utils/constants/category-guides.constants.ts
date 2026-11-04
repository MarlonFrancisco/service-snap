import type { PUBLIC_CATEGORY_NAMES } from './public-categories.constants';

export type TCategoryGuideFaq = {
  question: string;
  answer: string;
};

export type TCategoryGuide = {
  /** Slug da URL: `/categoria/<slug>`. Igual a `slugifyPlace(name)`. */
  slug: string;
  /** Nome em `PUBLIC_CATEGORY_NAMES`, usado na busca. */
  name: (typeof PUBLIC_CATEGORY_NAMES)[number];
  title: string;
  description: string;
  heading: string;
  intro: string;
  servicesTitle: string;
  services: string[];
  faq: TCategoryGuideFaq[];
};

/** Perguntas que valem para qualquer categoria (regras da Central de Ajuda e dos Termos). */
const COMMON_FAQ: TCategoryGuideFaq[] = [
  {
    question: 'Como recebo a confirmação do agendamento?',
    answer:
      'Assim que você confirma o horário, o ServiceSnap envia a confirmação do agendamento para o seu e-mail.',
  },
  {
    question: 'Posso cancelar ou desistir do horário?',
    answer:
      'Sim. O cancelamento pode ser feito pelo site até 24 horas antes do horário marcado. Cancelamentos de última hora podem ter taxa, conforme a política de cada profissional.',
  },
];

export const CATEGORY_GUIDES: TCategoryGuide[] = [
  {
    slug: 'barbearia',
    name: 'Barbearia',
    title: 'Barbearia perto de você: agende online | ServiceSnap',
    description:
      'Encontre barbearias perto de você e agende corte de cabelo, barba e acabamento online. Veja horários livres, escolha o barbeiro e confirme na hora.',
    heading: 'Barbearia perto de você, com agendamento online',
    intro:
      'Agende corte, barba e acabamento sem precisar ligar nem esperar na fila. No ServiceSnap você vê os horários livres de cada barbeiro, escolhe o serviço e confirma na hora.',
    servicesTitle: 'Serviços de barbearia mais agendados',
    services: [
      'Corte de cabelo masculino',
      'Barba com toalha quente',
      'Corte e barba',
      'Acabamento e pezinho',
      'Sobrancelha',
      'Pigmentação de barba',
    ],
    faq: [
      {
        question: 'Posso escolher o barbeiro?',
        answer:
          'Sim. Na página da barbearia você vê os profissionais que fazem cada serviço e escolhe com quem quer ser atendido, de acordo com os horários livres de cada um.',
      },
      {
        question: 'Dá para agendar corte e barba no mesmo horário?',
        answer:
          'Sim. Você pode selecionar mais de um serviço no mesmo agendamento, e a duração total é somada automaticamente.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'salao-de-beleza',
    name: 'Salão de Beleza',
    title: 'Salão de beleza perto de você: agende online | ServiceSnap',
    description:
      'Agende corte, escova, coloração e outros serviços em salões de beleza perto de você. Compare horários, escolha o profissional e confirme online.',
    heading: 'Salão de beleza perto de você, com agendamento online',
    intro:
      'Encontre salões de beleza perto de você e marque o horário em poucos cliques. Veja os serviços, a duração e os horários livres de cada profissional antes de confirmar.',
    servicesTitle: 'Serviços de salão mais agendados',
    services: [
      'Corte feminino',
      'Escova e finalização',
      'Coloração e mechas',
      'Hidratação e tratamentos capilares',
      'Penteados para eventos',
      'Maquiagem',
    ],
    faq: [
      {
        question: 'Consigo ver quanto tempo cada serviço leva?',
        answer:
          'Sim. Cada serviço mostra a duração e o preço definidos pelo salão antes de você escolher o horário.',
      },
      {
        question: 'Posso marcar mais de um serviço de uma vez?',
        answer:
          'Sim. Selecione todos os serviços que quiser no mesmo agendamento, como corte e escova, e o ServiceSnap reserva o tempo total.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'manicure',
    name: 'Manicure',
    title: 'Manicure e pedicure perto de você: agende online | ServiceSnap',
    description:
      'Agende manicure, pedicure, esmaltação em gel e alongamento de unhas perto de você. Veja horários livres, escolha a profissional e confirme online.',
    heading: 'Manicure e pedicure perto de você',
    intro:
      'Marque manicure e pedicure no horário que encaixa na sua rotina. No ServiceSnap você compara os serviços de cada espaço, vê os horários livres e confirma na hora.',
    servicesTitle: 'Serviços de unhas mais agendados',
    services: [
      'Manicure',
      'Pedicure',
      'Pé e mão',
      'Esmaltação em gel',
      'Alongamento de unhas',
      'Spa dos pés',
    ],
    faq: [
      {
        question: 'Dá para agendar pé e mão juntos?',
        answer:
          'Sim. Selecione os dois serviços no mesmo agendamento e o tempo total é reservado de uma vez.',
      },
      {
        question: 'Como escolho a profissional?',
        answer:
          'Na página do espaço aparecem as profissionais que fazem cada serviço. Escolha uma e veja só os horários livres dela.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'spa-massagem',
    name: 'Spa & Massagem',
    title: 'Spa e massagem perto de você: agende online | ServiceSnap',
    description:
      'Agende massagem relaxante, drenagem linfática, day spa e outros tratamentos perto de você. Veja horários livres, compare espaços e confirme online.',
    heading: 'Spa e massagem perto de você',
    intro:
      'Reserve um momento para você sem trocar mensagens para achar horário. Compare os tratamentos de cada spa, veja a duração e os horários livres e confirme na hora.',
    servicesTitle: 'Tratamentos mais agendados',
    services: [
      'Massagem relaxante',
      'Massagem modeladora',
      'Drenagem linfática',
      'Pedras quentes',
      'Day spa',
      'Reflexologia',
    ],
    faq: [
      {
        question: 'Consigo ver a duração de cada tratamento?',
        answer:
          'Sim. Cada tratamento mostra a duração e o preço definidos pelo espaço antes de você escolher o horário.',
      },
      {
        question: 'Posso escolher o terapeuta?',
        answer:
          'Sim. Na página do espaço você vê quem faz cada tratamento e escolhe com quem quer ser atendido.',
      },
      ...COMMON_FAQ,
    ],
  },
];

const GUIDE_BY_SLUG = new Map(
  CATEGORY_GUIDES.map((guide) => [guide.slug, guide]),
);
const GUIDE_BY_NAME = new Map(
  CATEGORY_GUIDES.map((guide) => [guide.name, guide]),
);

export function getCategoryGuide(slug: string): TCategoryGuide | undefined {
  return GUIDE_BY_SLUG.get(slug);
}

export function getCategoryGuideByName(
  name: string,
): TCategoryGuide | undefined {
  return GUIDE_BY_NAME.get(name as TCategoryGuide['name']);
}

export function categoryGuidePath(slug: string): string {
  return `/categoria/${slug}`;
}
