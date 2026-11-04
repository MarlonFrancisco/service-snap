import type { TCategoryGuideFaq } from './category-guides.constants';

export type TBusinessPage = {
  /** `/sistema-de-agendamento/<slug>`; vazio para a página geral. */
  slug: string;
  /** Como o negócio é chamado no texto: "barbearia", "salão de beleza"... */
  audience: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  benefits: { title: string; text: string }[];
  faq: TCategoryGuideFaq[];
};

export const BUSINESS_PAGES_BASE_PATH = '/sistema-de-agendamento';

/** Funcionalidades reais do painel do parceiro, iguais para todo segmento. */
export const BUSINESS_FEATURES = [
  {
    title: 'Agenda online',
    text: 'Veja os horários de toda a equipe em um só lugar e bloqueie folgas, pausas e feriados.',
  },
  {
    title: 'Agendamento pelo cliente',
    text: 'Seu espaço ganha uma página no ServiceSnap onde o cliente escolhe serviço, profissional e horário.',
  },
  {
    title: 'Lembretes automáticos',
    text: 'O cliente recebe lembrete por e-mail e, nos planos com WhatsApp, também pelo WhatsApp.',
  },
  {
    title: 'Serviços e equipe',
    text: 'Cadastre serviços com preço e duração e defina quais profissionais fazem cada um.',
  },
  {
    title: 'Mais de uma unidade',
    text: 'Gerencie várias lojas na mesma conta, conforme o plano escolhido.',
  },
  {
    title: 'Métricas do negócio',
    text: 'Acompanhe agendamentos e resultados no painel para decidir com base em números.',
  },
];

/** Perguntas que valem para qualquer segmento (regras da página de planos). */
const COMMON_FAQ: TCategoryGuideFaq[] = [
  {
    question: 'Posso testar antes de assinar?',
    answer:
      'Sim. Os planos mensais têm um período de teste grátis, e o prazo aparece na página de planos antes de você assinar.',
  },
  {
    question: 'Os lembretes por WhatsApp têm custo extra?',
    answer:
      'Os lembretes por WhatsApp estão nos planos a partir do Professional. As mensagens seguem as tarifas da Meta, cobradas à parte.',
  },
  {
    question: 'Quantos profissionais posso cadastrar?',
    answer:
      'Depende do plano: do Starter, para quem atende sozinho, até o Enterprise, com profissionais e lojas ilimitados. Veja os limites de cada um na página de planos.',
  },
];

export const BUSINESS_HUB: TBusinessPage = {
  slug: '',
  audience: 'negócio',
  title: 'Sistema de agendamento online para o seu negócio | ServiceSnap',
  description:
    'Agenda online, agendamento pelo cliente, lembretes por e-mail e WhatsApp e gestão da equipe para qualquer negócio que trabalha com hora marcada.',
  heading: 'Sistema de agendamento online para o seu negócio',
  intro:
    'Se o seu negócio trabalha com hora marcada, o ServiceSnap organiza a agenda da equipe, recebe agendamentos online e lembra o cliente do horário, para você parar de marcar tudo pelo telefone.',
  benefits: [
    {
      title: 'Menos tempo no telefone',
      text: 'O cliente agenda sozinho a qualquer hora, sem depender de alguém para responder mensagens.',
    },
    {
      title: 'Menos faltas',
      text: 'Lembretes automáticos ajudam o cliente a não esquecer o horário marcado.',
    },
    {
      title: 'Novos clientes',
      text: 'Seu espaço aparece na busca do ServiceSnap para quem procura o seu serviço.',
    },
  ],
  faq: [
    {
      question: 'Para quais tipos de negócio o ServiceSnap serve?',
      answer:
        'Para qualquer negócio que atende com hora marcada: barbearias, salões, clínicas de estética, spas, estúdios, consultórios, academias, pet shops e muitos outros.',
    },
    ...COMMON_FAQ,
  ],
};

export const BUSINESS_SEGMENTS: TBusinessPage[] = [
  {
    slug: 'barbearia',
    audience: 'barbearia',
    title: 'Sistema de agendamento para barbearia | ServiceSnap',
    description:
      'Agenda online para barbearia: o cliente marca corte e barba sozinho, recebe lembrete por WhatsApp e você organiza a agenda de cada barbeiro em um só lugar.',
    heading: 'Sistema de agendamento para barbearia',
    intro:
      'Deixe o cliente marcar corte e barba sozinho, escolhendo o barbeiro e o horário livre. Você acompanha a agenda de toda a equipe e reduz as faltas com lembretes automáticos.',
    benefits: [
      {
        title: 'Agenda por barbeiro',
        text: 'Cada barbeiro tem os próprios horários e serviços, e o cliente escolhe com quem quer cortar.',
      },
      {
        title: 'Fim da fila de mensagens',
        text: 'Pare de responder "tem horário hoje?" o dia inteiro: o cliente vê os horários livres e confirma.',
      },
      {
        title: 'Menos cadeira vazia',
        text: 'Lembretes automáticos diminuem as faltas e ajudam a manter a agenda cheia.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'salao-de-beleza',
    audience: 'salão de beleza',
    title: 'Sistema de agendamento para salão de beleza | ServiceSnap',
    description:
      'Agenda online para salão de beleza: clientes agendam corte, escova e coloração sozinhos, recebem lembretes automáticos e você organiza toda a equipe.',
    heading: 'Sistema de agendamento para salão de beleza',
    intro:
      'Organize a agenda de cabeleireiros, manicures e maquiadores em um só lugar. O cliente marca um ou vários serviços de uma vez, e cada profissional vê só os próprios horários.',
    benefits: [
      {
        title: 'Vários serviços por agendamento',
        text: 'Corte e escova, pé e mão: o cliente marca tudo de uma vez e o tempo total é reservado.',
      },
      {
        title: 'Equipe organizada',
        text: 'Defina quais profissionais fazem cada serviço e evite horários conflitando.',
      },
      {
        title: 'Clientes lembrados',
        text: 'Lembretes automáticos por e-mail e WhatsApp reduzem as faltas e os atrasos.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'manicure',
    audience: 'manicure',
    title: 'Sistema de agendamento para manicure | ServiceSnap',
    description:
      'Agenda online para manicure e nail designer: clientes marcam pé e mão sozinhos, recebem lembretes automáticos e você para de agendar pelo WhatsApp.',
    heading: 'Agenda online para manicure e nail designer',
    intro:
      'Pare de parar o atendimento para responder mensagem. Com o ServiceSnap, a cliente vê seus horários livres, escolhe os serviços e confirma, e você recebe tudo organizado na agenda.',
    benefits: [
      {
        title: 'Ideal para quem atende sozinha',
        text: 'O plano Starter atende uma profissional, e você pode crescer para uma equipe depois.',
      },
      {
        title: 'Agenda sempre atualizada',
        text: 'Bloqueie folgas e pausas e mostre para a cliente só os horários em que você pode atender.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos ajudam a cliente a não esquecer o horário.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'spa-massagem',
    audience: 'spa',
    title: 'Sistema de agendamento para spa e massagem | ServiceSnap',
    description:
      'Agenda online para spa, massoterapia e estética: clientes agendam tratamentos sozinhos, recebem lembretes e você organiza a agenda de cada terapeuta.',
    heading: 'Sistema de agendamento para spa e massagem',
    intro:
      'Ofereça uma experiência tranquila desde o agendamento. O cliente escolhe o tratamento, o terapeuta e o horário livre, e sua equipe vê a agenda do dia em um só lugar.',
    benefits: [
      {
        title: 'Tratamentos com duração certa',
        text: 'Cada tratamento tem a própria duração, e a agenda reserva o tempo exato.',
      },
      {
        title: 'Agenda por terapeuta',
        text: 'Defina quem faz cada tratamento e deixe o cliente escolher com quem quer ser atendido.',
      },
      {
        title: 'Clientes lembrados',
        text: 'Lembretes automáticos por e-mail e WhatsApp diminuem as faltas.',
      },
    ],
    faq: COMMON_FAQ,
  },
];

const SEGMENT_BY_SLUG = new Map(
  BUSINESS_SEGMENTS.map((segment) => [segment.slug, segment]),
);

export function getBusinessSegment(slug: string): TBusinessPage | undefined {
  return SEGMENT_BY_SLUG.get(slug);
}

export function businessPagePath(slug: string): string {
  return slug
    ? `${BUSINESS_PAGES_BASE_PATH}/${slug}`
    : BUSINESS_PAGES_BASE_PATH;
}
