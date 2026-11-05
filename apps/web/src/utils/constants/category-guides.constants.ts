import type { PUBLIC_CATEGORY_NAMES } from './public-categories.constants';

export type TCategoryGuideFaq = {
  question: string;
  answer: string;
};

export type TCategoryGuide = {
  /** Slug da URL: `/categoria/<slug>`. Igual a `slugify(name)`. */
  slug: string;
  /** Nome em `PUBLIC_CATEGORY_NAMES`, usado na busca. */
  name: (typeof PUBLIC_CATEGORY_NAMES)[number];
  title: string;
  description: string;
  heading: string;
  intro: string;
  servicesTitle: string;
  services: string[];
  /** Título da seção de passo a passo, ex.: "Como agendar dentista no ServiceSnap". */
  howToTitle: string;
  /** Pergunta do bloco para parceiros, ex.: "Tem um consultório odontológico?". */
  partnerTitle: string;
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
    howToTitle: 'Como agendar barbearia no ServiceSnap',
    partnerTitle: 'Trabalha com barbearia?',
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
    howToTitle: 'Como agendar salão de beleza no ServiceSnap',
    partnerTitle: 'Tem um salão de beleza?',
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
    howToTitle: 'Como agendar manicure no ServiceSnap',
    partnerTitle: 'Trabalha como manicure?',
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
    howToTitle: 'Como agendar spa e massagem no ServiceSnap',
    partnerTitle: 'Tem um spa ou espaço de massagem?',
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
  {
    slug: 'odontologia',
    name: 'Odontologia',
    title: 'Dentista perto de você: agende consulta online | ServiceSnap',
    description:
      'Encontre dentistas e clínicas odontológicas perto de você e agende avaliação, limpeza, clareamento e outros procedimentos online, sem precisar ligar.',
    heading: 'Dentista perto de você, com agendamento online',
    intro:
      'Marque sua consulta odontológica no horário que cabe na sua rotina. Veja os procedimentos de cada clínica, a duração e os horários livres de cada dentista antes de confirmar.',
    servicesTitle: 'Procedimentos odontológicos mais agendados',
    services: [
      'Avaliação odontológica',
      'Limpeza (profilaxia)',
      'Clareamento dental',
      'Restauração',
      'Avaliação ortodôntica',
      'Manutenção de aparelho',
    ],
    howToTitle: 'Como agendar dentista no ServiceSnap',
    partnerTitle: 'Tem um consultório odontológico?',
    faq: [
      {
        question: 'Posso escolher o dentista?',
        answer:
          'Sim. Na página da clínica você vê os profissionais que fazem cada serviço e escolhe com quem quer ser atendido, de acordo com os horários livres de cada um.',
      },
      {
        question: 'O preço do procedimento aparece antes de agendar?',
        answer:
          'Sim. Cada serviço mostra o preço e a duração definidos pela clínica antes de você escolher o horário. O tratamento indicado depois da avaliação é combinado diretamente com o dentista.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'personal-trainer',
    name: 'Personal Trainer',
    title: 'Personal trainer perto de você: agende online | ServiceSnap',
    description:
      'Encontre personal trainers perto de você e agende aula individual, avaliação física e treino funcional online. Veja horários livres e confirme na hora.',
    heading: 'Personal trainer perto de você',
    intro:
      'Agende treinos com acompanhamento individual sem trocar mensagens para achar horário. Compare os serviços de cada profissional, veja os horários livres e confirme na hora.',
    servicesTitle: 'Serviços de personal trainer mais agendados',
    services: [
      'Aula individual',
      'Avaliação física',
      'Treino funcional',
      'Treino de força',
      'Aula em dupla',
      'Consultoria de treino',
    ],
    howToTitle: 'Como agendar personal trainer no ServiceSnap',
    partnerTitle: 'Trabalha como personal trainer?',
    faq: [
      {
        question: 'Posso agendar uma avaliação antes de começar?',
        answer:
          'Sim, quando o profissional oferece a avaliação física. Ela aparece na lista de serviços com duração e preço, e você agenda como qualquer aula.',
      },
      {
        question: 'Consigo marcar várias aulas na semana?',
        answer:
          'Cada agendamento reserva um horário. Para fazer mais de uma aula, faça um agendamento para cada uma.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'estetica',
    name: 'Estética',
    title: 'Clínica de estética perto de você: agende online | ServiceSnap',
    description:
      'Agende limpeza de pele, depilação, design de sobrancelhas e outros tratamentos estéticos perto de você. Compare espaços, veja horários e confirme online.',
    heading: 'Clínica de estética perto de você',
    intro:
      'Encontre clínicas e espaços de estética e marque o tratamento em poucos cliques. Veja a duração e o preço de cada procedimento e os horários livres de cada profissional.',
    servicesTitle: 'Tratamentos estéticos mais agendados',
    services: [
      'Limpeza de pele',
      'Depilação',
      'Design de sobrancelhas',
      'Drenagem linfática',
      'Peeling',
      'Extensão de cílios',
    ],
    howToTitle: 'Como agendar estética no ServiceSnap',
    partnerTitle: 'Tem uma clínica de estética?',
    faq: [
      {
        question: 'Posso escolher a profissional?',
        answer:
          'Sim. Na página do espaço você vê os profissionais que fazem cada serviço e escolhe com quem quer ser atendido, de acordo com os horários livres de cada um.',
      },
      {
        question: 'Dá para marcar mais de um tratamento no mesmo horário?',
        answer:
          'Sim. Selecione os serviços no mesmo agendamento e o tempo total é reservado de uma vez.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'psicologia',
    name: 'Psicologia',
    title: 'Psicólogo perto de você: agende sua sessão | ServiceSnap',
    description:
      'Encontre psicólogos perto de você e agende sessões de psicoterapia com praticidade. Veja os horários livres de cada profissional e confirme pelo ServiceSnap.',
    heading: 'Psicólogo perto de você, com agendamento prático',
    intro:
      'Escolher um horário não precisa ser mais uma preocupação. Veja os profissionais, os tipos de atendimento e os horários livres e confirme a sessão em poucos cliques.',
    servicesTitle: 'Atendimentos de psicologia mais agendados',
    services: [
      'Psicoterapia individual',
      'Primeira sessão',
      'Terapia de casal',
      'Psicoterapia infantil',
      'Terapia cognitivo-comportamental',
      'Orientação profissional',
    ],
    howToTitle: 'Como agendar uma sessão de psicologia no ServiceSnap',
    partnerTitle: 'Atende como psicólogo?',
    faq: [
      {
        question: 'Consigo ver a duração e o valor da sessão?',
        answer:
          'Sim. Cada atendimento mostra a duração e o preço definidos pelo profissional antes de você escolher o horário.',
      },
      {
        question: 'O ServiceSnap atende situações de emergência?',
        answer:
          'Não. O ServiceSnap só agenda atendimentos com hora marcada. Em uma situação de crise, ligue para o CVV no 188 ou para o SAMU no 192.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'nutricao',
    name: 'Nutrição',
    title: 'Nutricionista perto de você: agende consulta | ServiceSnap',
    description:
      'Encontre nutricionistas perto de você e agende consulta, retorno e avaliação de composição corporal online. Veja os horários livres e confirme na hora.',
    heading: 'Nutricionista perto de você',
    intro:
      'Marque sua consulta com nutricionista sem trocar mensagens para achar horário. Veja os tipos de atendimento, a duração e os horários livres de cada profissional.',
    servicesTitle: 'Atendimentos de nutrição mais agendados',
    services: [
      'Primeira consulta',
      'Consulta de retorno',
      'Avaliação de composição corporal',
      'Nutrição esportiva',
      'Reeducação alimentar',
      'Nutrição materno-infantil',
    ],
    howToTitle: 'Como agendar nutricionista no ServiceSnap',
    partnerTitle: 'Atende como nutricionista?',
    faq: [
      {
        question: 'Consulta e retorno aparecem separados?',
        answer:
          'Depende do profissional: cada um cadastra os próprios atendimentos, com duração e preço. Escolha o que corresponde ao seu caso.',
      },
      {
        question: 'Posso escolher o nutricionista?',
        answer:
          'Sim. Na página do consultório você vê os profissionais que fazem cada serviço e escolhe com quem quer ser atendido, de acordo com os horários livres de cada um.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'fisioterapia',
    name: 'Fisioterapia',
    title: 'Fisioterapia perto de você: agende sessão online | ServiceSnap',
    description:
      'Encontre clínicas de fisioterapia perto de você e agende avaliação, sessões de reabilitação e RPG online. Veja horários livres e escolha o fisioterapeuta.',
    heading: 'Fisioterapia perto de você',
    intro:
      'Agende avaliação e sessões de fisioterapia no horário que encaixa na sua rotina. Veja os atendimentos de cada clínica e os horários livres de cada fisioterapeuta.',
    servicesTitle: 'Atendimentos de fisioterapia mais agendados',
    services: [
      'Avaliação fisioterapêutica',
      'Fisioterapia ortopédica',
      'RPG',
      'Fisioterapia esportiva',
      'Pilates clínico',
      'Liberação miofascial',
    ],
    howToTitle: 'Como agendar fisioterapia no ServiceSnap',
    partnerTitle: 'Tem uma clínica de fisioterapia?',
    faq: [
      {
        question: 'Posso escolher o fisioterapeuta?',
        answer:
          'Sim. Na página da clínica você vê os profissionais que fazem cada serviço e escolhe com quem quer ser atendido, de acordo com os horários livres de cada um.',
      },
      {
        question: 'Consigo marcar todas as sessões do tratamento?',
        answer:
          'Cada agendamento reserva um horário. Para fazer mais de uma sessão, faça um agendamento para cada uma.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'pilates',
    name: 'Pilates',
    title: 'Pilates perto de você: agende sua aula online | ServiceSnap',
    description:
      'Encontre estúdios de pilates perto de você e agende aula experimental, pilates solo ou com aparelhos online. Veja horários livres e confirme na hora.',
    heading: 'Pilates perto de você',
    intro:
      'Encontre estúdios de pilates e marque sua aula sem precisar ligar. Compare as modalidades de cada estúdio, veja os horários livres e confirme na hora.',
    servicesTitle: 'Aulas de pilates mais agendadas',
    services: [
      'Aula experimental',
      'Pilates com aparelhos',
      'Pilates solo',
      'Aula individual',
      'Aula em dupla',
      'Pilates para gestantes',
    ],
    howToTitle: 'Como agendar pilates no ServiceSnap',
    partnerTitle: 'Tem um estúdio de pilates?',
    faq: [
      {
        question: 'Posso fazer uma aula experimental?',
        answer:
          'Se o estúdio oferecer a aula experimental, ela aparece na lista de serviços com duração e preço, e você agenda como qualquer outra aula.',
      },
      {
        question: 'Posso escolher o instrutor?',
        answer:
          'Sim. Na página do estúdio você vê os profissionais que fazem cada serviço e escolhe com quem quer ser atendido, de acordo com os horários livres de cada um.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'tatuagem',
    name: 'Tatuagem',
    title: 'Estúdio de tatuagem perto de você: agende online | ServiceSnap',
    description:
      'Encontre estúdios de tatuagem e piercing perto de você e agende orçamento, sessão ou aplicação de piercing. Escolha o tatuador e confirme online.',
    heading: 'Estúdio de tatuagem perto de você',
    intro:
      'Escolha o estúdio e o tatuador e marque o horário sem trocar dezenas de mensagens. Veja os serviços de cada estúdio e os horários livres de cada artista.',
    servicesTitle: 'Serviços de tatuagem mais agendados',
    services: [
      'Orçamento de tatuagem',
      'Sessão de tatuagem',
      'Flash tattoo',
      'Cobertura (cover-up)',
      'Aplicação de piercing',
      'Retoque',
    ],
    howToTitle: 'Como agendar tatuagem no ServiceSnap',
    partnerTitle: 'Tem um estúdio de tatuagem?',
    faq: [
      {
        question: 'Posso escolher o tatuador?',
        answer:
          'Sim. Na página do estúdio você vê os profissionais que fazem cada serviço e escolhe com quem quer ser atendido, de acordo com os horários livres de cada um.',
      },
      {
        question: 'O preço da tatuagem aparece antes?',
        answer:
          'Sim. Cada serviço mostra o preço e a duração definidos pelo estúdio antes de você escolher o horário. Em tatuagens personalizadas, o valor final costuma ser combinado com o tatuador no orçamento.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'pet-shop',
    name: 'Pet Shop',
    title: 'Pet shop perto de você: agende banho e tosa | ServiceSnap',
    description:
      'Agende banho, tosa, hidratação e outros cuidados para o seu pet em pet shops perto de você. Veja os serviços e os horários livres e confirme online.',
    heading: 'Pet shop perto de você, com banho e tosa agendados',
    intro:
      'Marque o banho e a tosa do seu pet sem precisar ligar. Compare os serviços de cada pet shop, veja a duração e os horários livres e confirme na hora.',
    servicesTitle: 'Serviços de pet shop mais agendados',
    services: [
      'Banho',
      'Banho e tosa',
      'Tosa higiênica',
      'Hidratação de pelos',
      'Corte de unhas',
      'Escovação de dentes',
    ],
    howToTitle: 'Como agendar pet shop no ServiceSnap',
    partnerTitle: 'Tem um pet shop?',
    faq: [
      {
        question: 'Dá para marcar banho e tosa juntos?',
        answer:
          'Sim. Selecione os serviços no mesmo agendamento e o tempo total é reservado de uma vez.',
      },
      {
        question: 'O preço aparece antes de agendar?',
        answer:
          'Sim. Cada serviço mostra o preço e a duração definidos pelo pet shop antes de você escolher o horário.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'fotografia',
    name: 'Fotografia',
    title: 'Fotógrafo perto de você: agende seu ensaio online | ServiceSnap',
    description:
      'Encontre fotógrafos e estúdios perto de você e agende ensaio, retrato, fotos de produto e outros trabalhos online. Veja horários livres e confirme na hora.',
    heading: 'Fotógrafo perto de você',
    intro:
      'Reserve seu ensaio fotográfico sem trocar mensagens para achar data. Compare os serviços de cada fotógrafo, a duração de cada sessão e os horários livres.',
    servicesTitle: 'Ensaios e serviços mais agendados',
    services: [
      'Ensaio individual',
      'Retrato corporativo',
      'Ensaio de casal',
      'Ensaio gestante',
      'Fotos de produto',
      'Fotos para documentos',
    ],
    howToTitle: 'Como agendar fotógrafo no ServiceSnap',
    partnerTitle: 'Trabalha com fotografia?',
    faq: [
      {
        question: 'A duração e o preço do ensaio aparecem antes?',
        answer:
          'Sim. Cada serviço mostra o preço e a duração definidos pelo fotógrafo antes de você escolher o horário.',
      },
      {
        question: 'Posso escolher o fotógrafo?',
        answer:
          'Sim. Na página do estúdio você vê os profissionais que fazem cada serviço e escolhe com quem quer ser atendido, de acordo com os horários livres de cada um.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'mecanica',
    name: 'Mecânica',
    title: 'Oficina mecânica perto de você: agende online | ServiceSnap',
    description:
      'Agende revisão, troca de óleo, alinhamento e outros serviços em oficinas mecânicas perto de você. Veja os serviços e os horários livres e confirme online.',
    heading: 'Oficina mecânica perto de você',
    intro:
      'Leve o carro na hora marcada, sem esperar na fila da oficina. Compare os serviços de cada oficina, veja os horários livres e confirme o agendamento na hora.',
    servicesTitle: 'Serviços de oficina mais agendados',
    services: [
      'Revisão preventiva',
      'Troca de óleo e filtros',
      'Alinhamento e balanceamento',
      'Freios',
      'Suspensão',
      'Diagnóstico eletrônico',
    ],
    howToTitle: 'Como agendar oficina mecânica no ServiceSnap',
    partnerTitle: 'Tem uma oficina mecânica?',
    faq: [
      {
        question: 'O preço do conserto aparece antes?',
        answer:
          'Serviços com preço fixo, como a troca de óleo, mostram o valor definido pela oficina. Consertos que dependem de diagnóstico costumam ser orçados na oficina.',
      },
      {
        question: 'Posso agendar mais de um serviço de uma vez?',
        answer:
          'Sim. Selecione os serviços no mesmo agendamento e o tempo total é reservado de uma vez.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'limpeza',
    name: 'Limpeza',
    title: 'Serviço de limpeza: agende faxina online | ServiceSnap',
    description:
      'Encontre profissionais e empresas de limpeza e agende faxina residencial, limpeza pós-obra, de estofados e outros serviços online, com horário confirmado.',
    heading: 'Serviços de limpeza com agendamento online',
    intro:
      'Agende a limpeza da sua casa ou do seu escritório sem trocar mensagens. Compare os serviços de cada profissional, veja a duração e os horários livres e confirme.',
    servicesTitle: 'Serviços de limpeza mais agendados',
    services: [
      'Faxina residencial',
      'Limpeza pesada',
      'Limpeza pós-obra',
      'Limpeza de estofados',
      'Limpeza de escritório',
      'Higienização de colchão',
    ],
    howToTitle: 'Como agendar limpeza no ServiceSnap',
    partnerTitle: 'Trabalha com limpeza?',
    faq: [
      {
        question: 'Consigo ver o que está incluído em cada serviço?',
        answer:
          'Sim. Cada serviço mostra a descrição, a duração e o preço definidos pelo profissional antes de você escolher o horário.',
      },
      {
        question: 'Posso agendar mais de um serviço de uma vez?',
        answer:
          'Sim. Selecione os serviços no mesmo agendamento e o tempo total é reservado de uma vez.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'advocacia',
    name: 'Advocacia',
    title: 'Advogado perto de você: agende uma consulta | ServiceSnap',
    description:
      'Encontre advogados e escritórios perto de você e agende consulta jurídica nas áreas de família, trabalho, consumidor e outras, com horário confirmado.',
    heading: 'Advogado perto de você, com consulta agendada',
    intro:
      'Marque uma consulta com um advogado sem precisar ligar para vários escritórios. Veja as áreas de atuação, a duração da consulta e os horários livres.',
    servicesTitle: 'Consultas jurídicas mais agendadas',
    services: [
      'Consulta jurídica',
      'Direito de família',
      'Direito trabalhista',
      'Direito do consumidor',
      'Direito previdenciário',
      'Análise de contrato',
    ],
    howToTitle: 'Como agendar consulta com advogado no ServiceSnap',
    partnerTitle: 'Tem um escritório de advocacia?',
    faq: [
      {
        question: 'O valor da consulta aparece antes?',
        answer:
          'Sim, quando o escritório cadastra a consulta com preço. Honorários de um processo ou de um serviço maior costumam ser combinados diretamente com o advogado.',
      },
      {
        question: 'Posso escolher o advogado?',
        answer:
          'Sim. Na página do escritório você vê os profissionais que fazem cada serviço e escolhe com quem quer ser atendido, de acordo com os horários livres de cada um.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'contabilidade',
    name: 'Contabilidade',
    title: 'Contador perto de você: agende uma consulta | ServiceSnap',
    description:
      'Encontre contadores e escritórios de contabilidade perto de você e agende consulta sobre imposto de renda, abertura de empresa, MEI e outros temas online.',
    heading: 'Contador perto de você',
    intro:
      'Agende uma conversa com um contador sem depender de troca de mensagens. Compare os serviços de cada escritório, veja a duração e os horários livres e confirme.',
    servicesTitle: 'Serviços de contabilidade mais agendados',
    services: [
      'Declaração de imposto de renda',
      'Abertura de empresa',
      'Consultoria para MEI',
      'Planejamento tributário',
      'Folha de pagamento',
      'Regularização fiscal',
    ],
    howToTitle: 'Como agendar contador no ServiceSnap',
    partnerTitle: 'Tem um escritório de contabilidade?',
    faq: [
      {
        question: 'O valor do serviço aparece antes?',
        answer:
          'Serviços com preço fixo mostram o valor definido pelo escritório. Serviços contínuos, como a contabilidade mensal de uma empresa, costumam ser orçados na consulta.',
      },
      {
        question: 'Posso escolher o contador?',
        answer:
          'Sim. Na página do escritório você vê os profissionais que fazem cada serviço e escolhe com quem quer ser atendido, de acordo com os horários livres de cada um.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'academia',
    name: 'Academia',
    title: 'Academia perto de você: agende aulas e treinos | ServiceSnap',
    description:
      'Encontre academias perto de você e agende aula experimental, avaliação física, aulas coletivas e treinos com acompanhamento online, com horário confirmado.',
    heading: 'Academia perto de você',
    intro:
      'Conheça academias perto de você e reserve sua aula ou avaliação sem precisar ligar. Veja as modalidades de cada espaço, os horários livres e confirme na hora.',
    servicesTitle: 'Aulas e serviços mais agendados',
    services: [
      'Aula experimental',
      'Avaliação física',
      'Musculação com acompanhamento',
      'Spinning',
      'Treino funcional',
      'Aula de dança',
    ],
    howToTitle: 'Como agendar na academia pelo ServiceSnap',
    partnerTitle: 'Tem uma academia?',
    faq: [
      {
        question: 'Posso fazer uma aula experimental?',
        answer:
          'Se a academia oferecer a aula experimental, ela aparece na lista de serviços com duração e preço, e você agenda como qualquer outra aula.',
      },
      {
        question: 'Posso escolher o professor?',
        answer:
          'Sim. Na página da academia você vê os profissionais que fazem cada serviço e escolhe com quem quer ser atendido, de acordo com os horários livres de cada um.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'yoga',
    name: 'Yoga',
    title: 'Aula de yoga perto de você: agende online | ServiceSnap',
    description:
      'Encontre estúdios e professores de yoga perto de você e agende aula experimental, aulas em grupo ou individuais online. Veja horários livres e confirme.',
    heading: 'Aula de yoga perto de você',
    intro:
      'Reserve seu lugar na aula de yoga sem trocar mensagens. Compare as práticas de cada estúdio, veja a duração das aulas e os horários livres e confirme na hora.',
    servicesTitle: 'Aulas de yoga mais agendadas',
    services: [
      'Aula experimental',
      'Hatha yoga',
      'Vinyasa',
      'Yoga restaurativa',
      'Aula individual',
      'Meditação guiada',
    ],
    howToTitle: 'Como agendar aula de yoga no ServiceSnap',
    partnerTitle: 'Dá aulas de yoga?',
    faq: [
      {
        question: 'Posso fazer uma aula experimental?',
        answer:
          'Se o estúdio oferecer a aula experimental, ela aparece na lista de serviços com duração e preço, e você agenda como qualquer outra aula.',
      },
      {
        question: 'Posso escolher o professor?',
        answer:
          'Sim. Na página do estúdio você vê os profissionais que fazem cada serviço e escolhe com quem quer ser atendido, de acordo com os horários livres de cada um.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'veterinario',
    name: 'Veterinário',
    title: 'Veterinário perto de você: agende consulta | ServiceSnap',
    description:
      'Encontre clínicas veterinárias perto de você e agende consulta, vacinação, check-up e outros atendimentos para o seu pet online, com horário confirmado.',
    heading: 'Veterinário perto de você',
    intro:
      'Marque a consulta do seu pet sem precisar ligar. Compare os atendimentos de cada clínica, veja a duração e os horários livres de cada veterinário e confirme.',
    servicesTitle: 'Atendimentos veterinários mais agendados',
    services: [
      'Consulta clínica',
      'Vacinação',
      'Check-up',
      'Avaliação para castração',
      'Consulta dermatológica',
      'Retorno',
    ],
    howToTitle: 'Como agendar veterinário no ServiceSnap',
    partnerTitle: 'Tem uma clínica veterinária?',
    faq: [
      {
        question: 'Posso escolher o veterinário?',
        answer:
          'Sim. Na página da clínica você vê os profissionais que fazem cada serviço e escolhe com quem quer ser atendido, de acordo com os horários livres de cada um.',
      },
      {
        question: 'O ServiceSnap serve para emergências?',
        answer:
          'Não. O agendamento é para atendimentos com hora marcada. Em uma emergência, procure diretamente um hospital veterinário 24 horas.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'dermatologia',
    name: 'Dermatologia',
    title: 'Dermatologista perto de você: agende consulta | ServiceSnap',
    description:
      'Encontre dermatologistas perto de você e agende consulta, avaliação de pintas, tratamento de acne e procedimentos dermatológicos com horário confirmado.',
    heading: 'Dermatologista perto de você',
    intro:
      'Agende sua consulta dermatológica no horário que funciona para você. Veja os atendimentos de cada clínica, a duração e os horários livres de cada médico.',
    servicesTitle: 'Atendimentos dermatológicos mais agendados',
    services: [
      'Consulta dermatológica',
      'Avaliação de pintas',
      'Tratamento de acne',
      'Peeling químico',
      'Toxina botulínica',
      'Preenchimento',
    ],
    howToTitle: 'Como agendar dermatologista no ServiceSnap',
    partnerTitle: 'Tem uma clínica de dermatologia?',
    faq: [
      {
        question: 'Posso escolher o médico?',
        answer:
          'Sim. Na página da clínica você vê os profissionais que fazem cada serviço e escolhe com quem quer ser atendido, de acordo com os horários livres de cada um.',
      },
      {
        question: 'O preço do procedimento aparece antes de agendar?',
        answer:
          'Sim. Cada serviço mostra o preço e a duração definidos pela clínica antes de você escolher o horário. Procedimentos indicados na consulta são combinados diretamente com o médico.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'consultoria',
    name: 'Consultoria',
    title: 'Consultoria: agende reunião com especialistas | ServiceSnap',
    description:
      'Encontre consultores e agende reuniões de diagnóstico, mentoria e planejamento para o seu negócio ou a sua carreira online, com horário confirmado na hora.',
    heading: 'Consultoria com agendamento online',
    intro:
      'Marque uma reunião com um consultor sem trocar e-mails para combinar horário. Compare os serviços de cada profissional, a duração de cada reunião e os horários livres.',
    servicesTitle: 'Serviços de consultoria mais agendados',
    services: [
      'Reunião de diagnóstico',
      'Mentoria de carreira',
      'Consultoria empresarial',
      'Planejamento financeiro',
      'Consultoria de vendas',
      'Gestão de pessoas',
    ],
    howToTitle: 'Como agendar consultoria no ServiceSnap',
    partnerTitle: 'Trabalha com consultoria?',
    faq: [
      {
        question: 'A duração e o valor da reunião aparecem antes?',
        answer:
          'Sim. Cada serviço mostra o preço e a duração definidos pelo consultor antes de você escolher o horário.',
      },
      {
        question: 'Posso escolher o consultor?',
        answer:
          'Sim. Na página da consultoria você vê os profissionais que fazem cada serviço e escolhe com quem quer ser atendido, de acordo com os horários livres de cada um.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'design',
    name: 'Design',
    title: 'Designer: agende uma reunião de projeto online | ServiceSnap',
    description:
      'Encontre designers e estúdios e agende reunião de briefing para identidade visual, design de interiores, sites e outros projetos, com horário confirmado.',
    heading: 'Designer com agendamento online',
    intro:
      'Comece seu projeto marcando uma reunião de briefing sem troca de mensagens. Veja os serviços de cada designer, a duração das reuniões e os horários livres.',
    servicesTitle: 'Serviços de design mais agendados',
    services: [
      'Reunião de briefing',
      'Identidade visual',
      'Design de interiores',
      'Design de site',
      'Design para redes sociais',
      'Embalagem',
    ],
    howToTitle: 'Como agendar com um designer no ServiceSnap',
    partnerTitle: 'Trabalha com design?',
    faq: [
      {
        question: 'O preço do projeto aparece antes?',
        answer:
          'Serviços com valor fixo mostram o preço definido pelo profissional. Projetos personalizados costumam ser orçados depois da reunião de briefing.',
      },
      {
        question: 'Posso escolher o designer?',
        answer:
          'Sim. Na página do estúdio você vê os profissionais que fazem cada serviço e escolhe com quem quer ser atendido, de acordo com os horários livres de cada um.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'marketing',
    name: 'Marketing',
    title: 'Marketing: agende reunião com especialistas | ServiceSnap',
    description:
      'Encontre profissionais e agências de marketing e agende reunião sobre redes sociais, tráfego pago, SEO e estratégia para o seu negócio, com horário confirmado.',
    heading: 'Especialistas em marketing com agendamento online',
    intro:
      'Marque uma conversa com quem entende de marketing sem perder tempo combinando agenda. Compare os serviços de cada profissional e os horários livres e confirme.',
    servicesTitle: 'Serviços de marketing mais agendados',
    services: [
      'Diagnóstico de marketing',
      'Gestão de redes sociais',
      'Tráfego pago',
      'SEO',
      'Estratégia de conteúdo',
      'Mentoria de marketing',
    ],
    howToTitle: 'Como agendar com especialistas de marketing no ServiceSnap',
    partnerTitle: 'Trabalha com marketing?',
    faq: [
      {
        question: 'O preço do serviço aparece antes?',
        answer:
          'Serviços com valor fixo mostram o preço definido pelo profissional. Gestão contínua, como redes sociais ou tráfego pago, costuma ser orçada na primeira reunião.',
      },
      {
        question: 'Posso escolher o especialista?',
        answer:
          'Sim. Na página da agência você vê os profissionais que fazem cada serviço e escolhe com quem quer ser atendido, de acordo com os horários livres de cada um.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'carpintaria',
    name: 'Carpintaria',
    title: 'Carpinteiro e marceneiro: agende orçamento | ServiceSnap',
    description:
      'Encontre carpinteiros e marceneiros e agende orçamento de móveis planejados, montagem, reparos, portas, decks e outros serviços com horário confirmado.',
    heading: 'Carpintaria e marcenaria com agendamento online',
    intro:
      'Agende o orçamento ou o serviço de carpintaria sem depender de ligações. Compare os serviços de cada profissional, veja a duração prevista e os horários livres.',
    servicesTitle: 'Serviços de carpintaria mais agendados',
    services: [
      'Orçamento de móveis planejados',
      'Montagem de móveis',
      'Reparo de móveis',
      'Instalação de portas',
      'Prateleiras e nichos',
      'Deck de madeira',
    ],
    howToTitle: 'Como agendar carpintaria no ServiceSnap',
    partnerTitle: 'Trabalha com carpintaria?',
    faq: [
      {
        question: 'O preço aparece antes de agendar?',
        answer:
          'Serviços com valor fixo, como a montagem de móveis, mostram o preço definido pelo profissional. Móveis sob medida costumam ser orçados depois da medição.',
      },
      {
        question: 'Posso agendar mais de um serviço de uma vez?',
        answer:
          'Sim. Selecione os serviços no mesmo agendamento e o tempo total é reservado de uma vez.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'jardinagem',
    name: 'Jardinagem',
    title: 'Jardinagem: agende jardineiro e paisagismo | ServiceSnap',
    description:
      'Encontre jardineiros e paisagistas e agende manutenção de jardim, poda, corte de grama e projeto de paisagismo online, com horário confirmado na hora.',
    heading: 'Jardinagem e paisagismo com agendamento online',
    intro:
      'Cuide do seu jardim sem precisar ligar para combinar horário. Compare os serviços de cada profissional, veja a duração prevista e os horários livres e confirme.',
    servicesTitle: 'Serviços de jardinagem mais agendados',
    services: [
      'Manutenção de jardim',
      'Corte de grama',
      'Poda de árvores e arbustos',
      'Projeto de paisagismo',
      'Plantio',
      'Controle de pragas',
    ],
    howToTitle: 'Como agendar jardinagem no ServiceSnap',
    partnerTitle: 'Trabalha com jardinagem?',
    faq: [
      {
        question: 'O preço aparece antes de agendar?',
        answer:
          'Sim. Cada serviço mostra o preço e a duração definidos pelo profissional antes de você escolher o horário.',
      },
      {
        question: 'Posso agendar mais de um serviço de uma vez?',
        answer:
          'Sim. Selecione os serviços no mesmo agendamento e o tempo total é reservado de uma vez.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'eletricista',
    name: 'Eletricista',
    title: 'Eletricista perto de você: agende o serviço | ServiceSnap',
    description:
      'Encontre eletricistas perto de você e agende instalação de tomadas, chuveiro, iluminação, quadro de distribuição e reparos com horário confirmado.',
    heading: 'Eletricista perto de você',
    intro:
      'Agende o eletricista no horário que funciona para você, sem depender de ligações. Compare os serviços de cada profissional, a duração prevista e os horários livres.',
    servicesTitle: 'Serviços elétricos mais agendados',
    services: [
      'Instalação de tomadas e interruptores',
      'Instalação de chuveiro',
      'Iluminação',
      'Quadro de distribuição',
      'Reparo elétrico',
      'Instalação de ventilador de teto',
    ],
    howToTitle: 'Como agendar eletricista no ServiceSnap',
    partnerTitle: 'Trabalha como eletricista?',
    faq: [
      {
        question: 'O preço aparece antes de agendar?',
        answer:
          'Sim. Cada serviço mostra o preço e a duração definidos pelo profissional antes de você escolher o horário.',
      },
      {
        question: 'E se houver risco de choque ou incêndio?',
        answer:
          'Não espere o horário agendado: desligue o disjuntor geral, se for seguro, e ligue para os Bombeiros no 193.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'encanador',
    name: 'Encanador',
    title: 'Encanador perto de você: agende o serviço | ServiceSnap',
    description:
      "Encontre encanadores perto de você e agende conserto de vazamento, desentupimento, instalação de torneira, limpeza de caixa d'água e outros serviços.",
    heading: 'Encanador perto de você',
    intro:
      'Resolva vazamentos e instalações sem passar o dia esperando. Compare os serviços de cada encanador, veja a duração prevista e os horários livres e confirme na hora.',
    servicesTitle: 'Serviços hidráulicos mais agendados',
    services: [
      'Conserto de vazamento',
      'Desentupimento',
      'Instalação de torneira',
      'Troca de sifão',
      "Limpeza de caixa d'água",
      'Instalação de aquecedor',
    ],
    howToTitle: 'Como agendar encanador no ServiceSnap',
    partnerTitle: 'Trabalha como encanador?',
    faq: [
      {
        question: 'O preço aparece antes de agendar?',
        answer:
          'Sim. Cada serviço mostra o preço e a duração definidos pelo profissional antes de você escolher o horário.',
      },
      {
        question: 'Posso agendar mais de um serviço de uma vez?',
        answer:
          'Sim. Selecione os serviços no mesmo agendamento e o tempo total é reservado de uma vez.',
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: 'pintura',
    name: 'Pintura',
    title: 'Pintor perto de você: agende orçamento e pintura | ServiceSnap',
    description:
      'Encontre pintores perto de você e agende orçamento ou pintura de apartamento, casa, fachada e textura com horário confirmado. Compare e confirme online.',
    heading: 'Pintor perto de você',
    intro:
      'Agende o orçamento ou a pintura sem depender de ligações. Compare os serviços de cada pintor, veja a duração prevista e os horários livres e confirme na hora.',
    servicesTitle: 'Serviços de pintura mais agendados',
    services: [
      'Orçamento de pintura',
      'Pintura de apartamento',
      'Pintura de fachada',
      'Textura e grafiato',
      'Massa corrida',
      'Pintura de portas e janelas',
    ],
    howToTitle: 'Como agendar pintor no ServiceSnap',
    partnerTitle: 'Trabalha com pintura?',
    faq: [
      {
        question: 'O preço da pintura aparece antes?',
        answer:
          'Serviços com valor fixo mostram o preço definido pelo pintor. Pinturas de ambientes inteiros costumam ser orçadas depois do orçamento no local.',
      },
      {
        question: 'Posso agendar mais de um serviço de uma vez?',
        answer:
          'Sim. Selecione os serviços no mesmo agendamento e o tempo total é reservado de uma vez.',
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
