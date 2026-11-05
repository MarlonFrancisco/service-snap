import type { TCategoryGuideFaq } from './category-guides.constants';

export type TBusinessPage = {
  /** `/sistema-de-agendamento/<slug>`; vazio para a página geral. */
  slug: string;
  /** Nome curto do segmento, usado em links e no breadcrumb: "Barbearia". */
  label: string;
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
  label: 'Todos os negócios',
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
    label: 'Barbearia',
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
    label: 'Salão de beleza',
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
    label: 'Manicure',
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
    label: 'Spa e massagem',
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
  {
    slug: 'odontologia',
    label: 'Odontologia',
    title: 'Sistema de agendamento para dentistas | ServiceSnap',
    description:
      'Agenda online para consultório odontológico: pacientes agendam avaliação e procedimentos sozinhos, recebem lembretes e você organiza cada dentista.',
    heading: 'Agenda online para consultório odontológico',
    intro:
      'Deixe o paciente marcar avaliação, limpeza e retorno sem depender da recepção. Cada dentista tem a própria agenda, e os lembretes automáticos ajudam a reduzir as faltas.',
    benefits: [
      {
        title: 'Agenda por dentista',
        text: 'Cada dentista tem os próprios horários e serviços, e o paciente escolhe com quem quer ser atendido.',
      },
      {
        title: 'Duração certa na agenda',
        text: 'Cada procedimento tem a própria duração, e a agenda reserva o tempo exato de cada atendimento.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o paciente a não esquecer a consulta.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'personal-trainer',
    label: 'Personal trainer',
    title: 'Sistema de agendamento para personal trainer | ServiceSnap',
    description:
      'Agenda online para personal trainer: alunos marcam aulas e avaliações sozinhos, recebem lembretes e você organiza seus horários sem trocar mensagens.',
    heading: 'Agenda online para personal trainer',
    intro:
      'Seus alunos veem os horários livres e marcam a aula sem você precisar parar o treino para responder mensagem. Bloqueie os horários em que não atende e mantenha a agenda em dia.',
    benefits: [
      {
        title: 'Comece sozinho',
        text: 'O plano Starter atende o personal que trabalha sozinho, e você amplia para uma equipe quando precisar.',
      },
      {
        title: 'Menos tempo no WhatsApp',
        text: 'Pare de combinar horário por mensagem: o aluno vê os horários livres e confirma sozinho.',
      },
      {
        title: 'Agenda sempre em dia',
        text: 'Bloqueie folgas, pausas e feriados e mostre ao cliente só os horários em que você pode atender.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'estetica',
    label: 'Estética',
    title: 'Sistema de agendamento para clínica de estética | ServiceSnap',
    description:
      'Agenda online para clínica de estética: clientes agendam tratamentos sozinhos, recebem lembretes automáticos e você organiza a agenda de cada profissional.',
    heading: 'Sistema de agendamento para clínica de estética',
    intro:
      'Organize limpeza de pele, depilação, sobrancelhas e outros tratamentos em uma agenda só. O cliente escolhe o procedimento, a profissional e o horário livre.',
    benefits: [
      {
        title: 'Agenda por profissional',
        text: 'Cada profissional tem os próprios horários e serviços, e o cliente escolhe com quem quer ser atendido.',
      },
      {
        title: 'Vários serviços por agendamento',
        text: 'Limpeza de pele e sobrancelha: o cliente marca tudo de uma vez e o tempo total é reservado.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o cliente a não esquecer o horário.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'psicologia',
    label: 'Psicologia',
    title: 'Sistema de agendamento para psicólogos | ServiceSnap',
    description:
      'Agenda online para psicólogos: pacientes marcam sessões sozinhos, recebem lembretes automáticos e você organiza seus horários sem trocar mensagens.',
    heading: 'Agenda online para psicólogos',
    intro:
      'Deixe o agendamento das sessões fora da sua rotina de mensagens. O paciente vê os horários livres e confirma, e você recebe tudo organizado na agenda.',
    benefits: [
      {
        title: 'Comece sozinho',
        text: 'O plano Starter atende o psicólogo que atende sozinho, e você amplia para uma equipe quando precisar.',
      },
      {
        title: 'Menos tempo no WhatsApp',
        text: 'Pare de combinar horário por mensagem: o paciente vê os horários livres e confirma sozinho.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o paciente a não esquecer a sessão.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'nutricao',
    label: 'Nutrição',
    title: 'Sistema de agendamento para nutricionistas | ServiceSnap',
    description:
      'Agenda online para nutricionistas: pacientes agendam consulta e retorno sozinhos, recebem lembretes automáticos e você organiza seus horários.',
    heading: 'Agenda online para nutricionistas',
    intro:
      'Cadastre primeira consulta, retorno e avaliação com a duração de cada um. O paciente escolhe o atendimento e o horário livre, e você acompanha tudo na agenda.',
    benefits: [
      {
        title: 'Duração certa na agenda',
        text: 'Cada atendimento tem a própria duração, e a agenda reserva o tempo exato de cada atendimento.',
      },
      {
        title: 'Comece sozinho',
        text: 'O plano Starter atende o nutricionista que atende sozinho, e você amplia para uma equipe quando precisar.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o paciente a não esquecer a consulta.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'fisioterapia',
    label: 'Fisioterapia',
    title: 'Sistema de agendamento para fisioterapia | ServiceSnap',
    description:
      'Agenda online para clínica de fisioterapia: pacientes agendam avaliação e sessões sozinhos, recebem lembretes e você organiza cada fisioterapeuta.',
    heading: 'Sistema de agendamento para clínica de fisioterapia',
    intro:
      'Organize avaliações e sessões de toda a equipe em uma agenda só. O paciente escolhe o fisioterapeuta e o horário livre, e os lembretes ajudam a manter a frequência.',
    benefits: [
      {
        title: 'Agenda por fisioterapeuta',
        text: 'Cada fisioterapeuta tem os próprios horários e serviços, e o paciente escolhe com quem quer ser atendido.',
      },
      {
        title: 'Duração certa na agenda',
        text: 'Cada atendimento tem a própria duração, e a agenda reserva o tempo exato de cada atendimento.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o paciente a não perder a sessão.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'pilates',
    label: 'Pilates',
    title: 'Sistema de agendamento para estúdio de pilates | ServiceSnap',
    description:
      'Agenda online para estúdio de pilates: alunos marcam aulas sozinhos, recebem lembretes automáticos e você organiza a agenda de cada instrutor.',
    heading: 'Sistema de agendamento para estúdio de pilates',
    intro:
      'Deixe o aluno marcar a aula experimental ou a aula da semana sem passar pela recepção. Cada instrutor tem a própria agenda, e os lembretes reduzem as faltas.',
    benefits: [
      {
        title: 'Agenda por instrutor',
        text: 'Cada instrutor tem os próprios horários e serviços, e o aluno escolhe com quem quer ser atendido.',
      },
      {
        title: 'Menos tempo no WhatsApp',
        text: 'Pare de combinar horário por mensagem: o aluno vê os horários livres e confirma sozinho.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o aluno a não faltar.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'tatuagem',
    label: 'Tatuagem',
    title: 'Sistema de agendamento para estúdio de tatuagem | ServiceSnap',
    description:
      'Agenda online para estúdio de tatuagem: clientes agendam orçamento e sessão sozinhos, escolhem o tatuador e recebem lembretes automáticos.',
    heading: 'Sistema de agendamento para estúdio de tatuagem',
    intro:
      'Organize a agenda de cada tatuador e deixe o cliente marcar orçamento, sessão ou piercing sem dezenas de mensagens. Cada serviço tem a própria duração.',
    benefits: [
      {
        title: 'Agenda por tatuador',
        text: 'Cada tatuador tem os próprios horários e serviços, e o cliente escolhe com quem quer ser atendido.',
      },
      {
        title: 'Duração certa na agenda',
        text: 'Cada sessão tem a própria duração, e a agenda reserva o tempo exato de cada atendimento.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o cliente a não esquecer o horário.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'pet-shop',
    label: 'Pet shop',
    title: 'Sistema de agendamento para pet shop | ServiceSnap',
    description:
      'Agenda online para pet shop: tutores agendam banho e tosa sozinhos, recebem lembretes automáticos e você organiza a agenda de cada tosador.',
    heading: 'Sistema de agendamento para pet shop',
    intro:
      'Deixe o tutor marcar banho, tosa e outros serviços no horário livre, sem ligação. Cada serviço tem a própria duração, e a equipe vê a agenda do dia em um só lugar.',
    benefits: [
      {
        title: 'Vários serviços por agendamento',
        text: 'Banho e tosa: o cliente marca tudo de uma vez e o tempo total é reservado.',
      },
      {
        title: 'Agenda por profissional',
        text: 'Cada profissional tem os próprios horários e serviços, e o tutor escolhe com quem quer ser atendido.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o tutor a não esquecer o horário.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'fotografia',
    label: 'Fotografia',
    title: 'Sistema de agendamento para fotógrafos | ServiceSnap',
    description:
      'Agenda online para fotógrafos e estúdios: clientes agendam ensaios sozinhos, veem a duração de cada sessão e recebem lembretes automáticos.',
    heading: 'Agenda online para fotógrafos',
    intro:
      'Mostre seus ensaios com duração e preço e deixe o cliente escolher a data sem trocar mensagens. Bloqueie os dias de evento e mantenha a agenda sempre certa.',
    benefits: [
      {
        title: 'Duração certa na agenda',
        text: 'Cada ensaio tem a própria duração, e a agenda reserva o tempo exato de cada atendimento.',
      },
      {
        title: 'Agenda sempre em dia',
        text: 'Bloqueie dias de evento, folgas e feriados e mostre ao cliente só as datas em que você pode fotografar.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o cliente a não esquecer o horário.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'mecanica',
    label: 'Mecânica',
    title: 'Sistema de agendamento para oficina mecânica | ServiceSnap',
    description:
      'Agenda online para oficina mecânica: clientes agendam revisão, troca de óleo e outros serviços sozinhos e recebem lembretes antes do horário.',
    heading: 'Sistema de agendamento para oficina mecânica',
    intro:
      'Distribua o movimento da oficina ao longo do dia com horários marcados. O cliente escolhe o serviço e o horário livre, e os lembretes ajudam a evitar faltas.',
    benefits: [
      {
        title: 'Duração certa na agenda',
        text: 'Cada serviço tem a própria duração, e a agenda reserva o tempo exato de cada atendimento.',
      },
      {
        title: 'Menos tempo no WhatsApp',
        text: 'Pare de marcar horário por telefone: o cliente vê os horários livres e confirma sozinho.',
      },
      {
        title: 'Mais de uma unidade',
        text: 'Gerencie várias lojas ou endereços na mesma conta, conforme o plano escolhido.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'limpeza',
    label: 'Limpeza',
    title: 'Sistema de agendamento para empresas de limpeza | ServiceSnap',
    description:
      'Agenda online para empresas e profissionais de limpeza: clientes agendam faxina e outros serviços sozinhos e você organiza a agenda da equipe.',
    heading: 'Sistema de agendamento para empresas de limpeza',
    intro:
      'Cadastre faxina, limpeza pesada e pós-obra com a duração de cada serviço. O cliente escolhe o horário livre, e você vê a agenda de toda a equipe em um só lugar.',
    benefits: [
      {
        title: 'Agenda por profissional',
        text: 'Cada profissional tem os próprios horários e serviços, e o cliente escolhe com quem quer ser atendido.',
      },
      {
        title: 'Duração certa na agenda',
        text: 'Cada serviço tem a própria duração, e a agenda reserva o tempo exato de cada atendimento.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o cliente a não esquecer o horário.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'advocacia',
    label: 'Advocacia',
    title: 'Sistema de agendamento para advogados | ServiceSnap',
    description:
      'Agenda online para escritório de advocacia: clientes agendam consultas sozinhos, escolhem o advogado e recebem lembretes antes do horário.',
    heading: 'Agenda online para escritório de advocacia',
    intro:
      'Deixe o cliente marcar a consulta inicial sem depender de ligações para a recepção. Cada advogado tem a própria agenda, e os lembretes reduzem as faltas.',
    benefits: [
      {
        title: 'Agenda por advogado',
        text: 'Cada advogado tem os próprios horários e serviços, e o cliente escolhe com quem quer ser atendido.',
      },
      {
        title: 'Menos tempo no WhatsApp',
        text: 'Pare de combinar horário por telefone: o cliente vê os horários livres e confirma sozinho.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o cliente a não esquecer a consulta.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'contabilidade',
    label: 'Contabilidade',
    title: 'Sistema de agendamento para contadores | ServiceSnap',
    description:
      'Agenda online para escritório de contabilidade: clientes agendam reuniões e atendimentos sozinhos, escolhem o contador e recebem lembretes.',
    heading: 'Agenda online para escritório de contabilidade',
    intro:
      'Organize atendimentos de imposto de renda, abertura de empresa e reuniões de rotina em uma agenda só. Cada contador tem os próprios horários.',
    benefits: [
      {
        title: 'Agenda por contador',
        text: 'Cada contador tem os próprios horários e serviços, e o cliente escolhe com quem quer ser atendido.',
      },
      {
        title: 'Duração certa na agenda',
        text: 'Cada atendimento tem a própria duração, e a agenda reserva o tempo exato de cada atendimento.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o cliente a não esquecer a reunião.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'academia',
    label: 'Academia',
    title: 'Sistema de agendamento para academias | ServiceSnap',
    description:
      'Agenda online para academias: alunos agendam aula experimental, avaliação física e aulas sozinhos, recebem lembretes e você organiza os professores.',
    heading: 'Sistema de agendamento para academias',
    intro:
      'Deixe o aluno marcar avaliação física, aula experimental ou acompanhamento sem passar pela recepção. Cada professor tem a própria agenda.',
    benefits: [
      {
        title: 'Agenda por professor',
        text: 'Cada professor tem os próprios horários e serviços, e o aluno escolhe com quem quer ser atendido.',
      },
      {
        title: 'Mais de uma unidade',
        text: 'Gerencie várias lojas ou endereços na mesma conta, conforme o plano escolhido.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o aluno a não faltar.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'yoga',
    label: 'Yoga',
    title: 'Sistema de agendamento para estúdio de yoga | ServiceSnap',
    description:
      'Agenda online para estúdio de yoga: alunos marcam aulas sozinhos, recebem lembretes automáticos e você organiza a agenda de cada professor.',
    heading: 'Sistema de agendamento para estúdio de yoga',
    intro:
      'Deixe o aluno escolher a prática e o horário sem trocar mensagens. Cada professor tem a própria agenda, e você bloqueia feriados e retiros com antecedência.',
    benefits: [
      {
        title: 'Agenda por professor',
        text: 'Cada professor tem os próprios horários e serviços, e o aluno escolhe com quem quer ser atendido.',
      },
      {
        title: 'Agenda sempre em dia',
        text: 'Bloqueie feriados, retiros e pausas e mostre ao aluno só os horários com aula.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o aluno a não faltar.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'veterinario',
    label: 'Veterinário',
    title: 'Sistema de agendamento para clínica veterinária | ServiceSnap',
    description:
      'Agenda online para clínica veterinária: tutores agendam consulta, vacina e retorno sozinhos, recebem lembretes e você organiza cada veterinário.',
    heading: 'Sistema de agendamento para clínica veterinária',
    intro:
      'Organize consultas, vacinas e retornos de toda a equipe em uma agenda só. O tutor escolhe o veterinário e o horário livre, sem precisar ligar.',
    benefits: [
      {
        title: 'Agenda por veterinário',
        text: 'Cada veterinário tem os próprios horários e serviços, e o tutor escolhe com quem quer ser atendido.',
      },
      {
        title: 'Duração certa na agenda',
        text: 'Cada atendimento tem a própria duração, e a agenda reserva o tempo exato de cada atendimento.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o tutor a não esquecer a consulta.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'dermatologia',
    label: 'Dermatologia',
    title: 'Sistema de agendamento para dermatologistas | ServiceSnap',
    description:
      'Agenda online para clínica de dermatologia: pacientes agendam consulta e procedimentos sozinhos, recebem lembretes e você organiza cada médico.',
    heading: 'Sistema de agendamento para clínica de dermatologia',
    intro:
      'Separe consultas e procedimentos com a duração certa de cada um. O paciente escolhe o médico e o horário livre, e os lembretes ajudam a reduzir as faltas.',
    benefits: [
      {
        title: 'Agenda por médico',
        text: 'Cada médico tem os próprios horários e serviços, e o paciente escolhe com quem quer ser atendido.',
      },
      {
        title: 'Duração certa na agenda',
        text: 'Cada procedimento tem a própria duração, e a agenda reserva o tempo exato de cada atendimento.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o paciente a não esquecer a consulta.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'consultoria',
    label: 'Consultoria',
    title: 'Sistema de agendamento para consultores | ServiceSnap',
    description:
      'Agenda online para consultores: clientes marcam reuniões de diagnóstico e mentoria sozinhos e você para de trocar e-mails para combinar horário.',
    heading: 'Agenda online para consultores',
    intro:
      'Publique suas reuniões com duração e preço e deixe o cliente escolher o horário livre. Você recebe tudo organizado na agenda, sem troca de e-mails.',
    benefits: [
      {
        title: 'Menos tempo no WhatsApp',
        text: 'Pare de combinar horário por e-mail: o cliente vê os horários livres e confirma sozinho.',
      },
      {
        title: 'Duração certa na agenda',
        text: 'Cada reunião tem a própria duração, e a agenda reserva o tempo exato de cada atendimento.',
      },
      {
        title: 'Comece sozinho',
        text: 'O plano Starter atende o consultor que trabalha sozinho, e você amplia para uma equipe quando precisar.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'design',
    label: 'Design',
    title: 'Sistema de agendamento para designers | ServiceSnap',
    description:
      'Agenda online para designers e estúdios: clientes agendam reunião de briefing sozinhos, veem a duração e recebem lembretes antes do horário.',
    heading: 'Agenda online para designers',
    intro:
      'Deixe o cliente marcar a reunião de briefing direto na sua agenda. Você define a duração de cada reunião e bloqueia os horários reservados para produzir.',
    benefits: [
      {
        title: 'Menos tempo no WhatsApp',
        text: 'Pare de combinar reunião por mensagem: o cliente vê os horários livres e confirma sozinho.',
      },
      {
        title: 'Agenda sempre em dia',
        text: 'Bloqueie os horários reservados para produzir e mostre ao cliente só os horários de reunião.',
      },
      {
        title: 'Comece sozinho',
        text: 'O plano Starter atende o designer que trabalha sozinho, e você amplia para uma equipe quando precisar.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'marketing',
    label: 'Marketing',
    title: 'Sistema de agendamento para agências de marketing | ServiceSnap',
    description:
      'Agenda online para profissionais e agências de marketing: clientes agendam reuniões de diagnóstico sozinhos e escolhem o especialista.',
    heading: 'Agenda online para agências de marketing',
    intro:
      'Transforme o "vamos marcar uma conversa" em agendamento confirmado. O cliente escolhe o especialista e o horário livre, e os lembretes evitam reuniões perdidas.',
    benefits: [
      {
        title: 'Agenda por especialista',
        text: 'Cada especialista tem os próprios horários e serviços, e o cliente escolhe com quem quer ser atendido.',
      },
      {
        title: 'Menos tempo no WhatsApp',
        text: 'Pare de combinar reunião por e-mail: o cliente vê os horários livres e confirma sozinho.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o cliente a não esquecer a reunião.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'carpintaria',
    label: 'Carpintaria',
    title: 'Sistema de agendamento para marcenarias | ServiceSnap',
    description:
      'Agenda online para marceneiros e carpinteiros: clientes agendam orçamento, montagem e reparos sozinhos, e você organiza a agenda da equipe.',
    heading: 'Agenda online para marcenaria e carpintaria',
    intro:
      'Organize orçamentos, montagens e reparos em uma agenda só. O cliente escolhe o serviço e o horário livre, e você vê a agenda de cada profissional.',
    benefits: [
      {
        title: 'Duração certa na agenda',
        text: 'Cada serviço tem a própria duração, e a agenda reserva o tempo exato de cada atendimento.',
      },
      {
        title: 'Agenda por profissional',
        text: 'Cada profissional tem os próprios horários e serviços, e o cliente escolhe com quem quer ser atendido.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o cliente a não esquecer o horário.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'jardinagem',
    label: 'Jardinagem',
    title: 'Sistema de agendamento para jardinagem e paisagismo | ServiceSnap',
    description:
      'Agenda online para jardineiros e paisagistas: clientes agendam manutenção, poda e projetos sozinhos e você organiza a agenda da equipe.',
    heading: 'Agenda online para jardinagem e paisagismo',
    intro:
      'Cadastre manutenção, corte de grama, poda e projeto de paisagismo com a duração de cada um. O cliente escolhe o horário livre, e a equipe vê a agenda do dia.',
    benefits: [
      {
        title: 'Duração certa na agenda',
        text: 'Cada serviço tem a própria duração, e a agenda reserva o tempo exato de cada atendimento.',
      },
      {
        title: 'Agenda por profissional',
        text: 'Cada profissional tem os próprios horários e serviços, e o cliente escolhe com quem quer ser atendido.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o cliente a não esquecer o horário.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'eletricista',
    label: 'Eletricista',
    title: 'Sistema de agendamento para eletricistas | ServiceSnap',
    description:
      'Agenda online para eletricistas: clientes agendam instalações e reparos sozinhos, recebem lembretes e você para de marcar serviço por telefone.',
    heading: 'Agenda online para eletricistas',
    intro:
      'Deixe o cliente marcar a instalação ou o reparo no horário livre, sem ligação. Você define a duração de cada serviço e bloqueia os horários já ocupados.',
    benefits: [
      {
        title: 'Menos tempo no WhatsApp',
        text: 'Pare de marcar serviço por telefone: o cliente vê os horários livres e confirma sozinho.',
      },
      {
        title: 'Duração certa na agenda',
        text: 'Cada serviço tem a própria duração, e a agenda reserva o tempo exato de cada atendimento.',
      },
      {
        title: 'Comece sozinho',
        text: 'O plano Starter atende o eletricista que trabalha sozinho, e você amplia para uma equipe quando precisar.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'encanador',
    label: 'Encanador',
    title: 'Sistema de agendamento para encanadores | ServiceSnap',
    description:
      'Agenda online para encanadores: clientes agendam conserto, desentupimento e instalações sozinhos e você organiza seus horários sem ligações.',
    heading: 'Agenda online para encanadores',
    intro:
      'Organize consertos e instalações em uma agenda só. O cliente escolhe o serviço e o horário livre, e você bloqueia os períodos em que já está em atendimento.',
    benefits: [
      {
        title: 'Menos tempo no WhatsApp',
        text: 'Pare de marcar serviço por telefone: o cliente vê os horários livres e confirma sozinho.',
      },
      {
        title: 'Agenda sempre em dia',
        text: 'Bloqueie folgas, pausas e feriados e mostre ao cliente só os horários em que você pode atender.',
      },
      {
        title: 'Comece sozinho',
        text: 'O plano Starter atende o encanador que trabalha sozinho, e você amplia para uma equipe quando precisar.',
      },
    ],
    faq: COMMON_FAQ,
  },
  {
    slug: 'pintura',
    label: 'Pintura',
    title: 'Sistema de agendamento para pintores | ServiceSnap',
    description:
      'Agenda online para pintores: clientes agendam orçamento e serviços de pintura sozinhos, recebem lembretes e você organiza a agenda da equipe.',
    heading: 'Agenda online para pintores',
    intro:
      'Receba pedidos de orçamento com dia e hora marcados, sem perder tempo combinando por mensagem. Você vê a agenda de cada pintor da equipe em um só lugar.',
    benefits: [
      {
        title: 'Menos tempo no WhatsApp',
        text: 'Pare de combinar horário por mensagem: o cliente vê os horários livres e confirma sozinho.',
      },
      {
        title: 'Agenda por pintor',
        text: 'Cada pintor tem os próprios horários e serviços, e o cliente escolhe com quem quer ser atendido.',
      },
      {
        title: 'Menos faltas',
        text: 'Lembretes automáticos por e-mail e WhatsApp ajudam o cliente a não esquecer o horário.',
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
