import type {
  TCalendarFeedAction,
  TCalendarFeedConfirmContent,
  TCalendarGuideTab,
} from './calendar-feed-module.types';

export const CALENDAR_GUIDE_TABS: readonly [
  TCalendarGuideTab,
  ...TCalendarGuideTab[],
] = [
  {
    id: 'google',
    label: 'Google Agenda',
    steps: [
      ['Abra o Google Agenda no computador.'],
      [
        'Ao lado de "Outras agendas", clique em ',
        { strong: '+' },
        ' e escolha ',
        { strong: 'Do URL' },
        '.',
      ],
      [
        'Cole o link e clique em ',
        { strong: 'Adicionar agenda' },
        '. Ela aparece no celular também.',
      ],
    ],
  },
  {
    id: 'iphone',
    label: 'iPhone',
    steps: [
      ['Copie o link acima e abra os ', { strong: 'Ajustes' }, ' do iPhone.'],
      [
        'Toque em ',
        { strong: 'Calendário' },
        ' › ',
        { strong: 'Contas' },
        ' › ',
        { strong: 'Adicionar Conta' },
        ' › ',
        { strong: 'Outra' },
        '.',
      ],
      [
        'Toque em ',
        { strong: 'Adicionar Calendário Assinado' },
        ', cole o link e toque em ',
        { strong: 'Seguinte' },
        ' e depois em ',
        { strong: 'Salvar' },
        '.',
      ],
    ],
  },
  {
    id: 'outlook',
    label: 'Outlook',
    steps: [
      ['Abra o calendário do Outlook no computador ou em outlook.com.'],
      [
        'Clique em ',
        { strong: 'Adicionar calendário' },
        ' e escolha ',
        { strong: 'Assinar da Web' },
        '.',
      ],
      [
        'Cole o link, dê um nome para a agenda e clique em ',
        { strong: 'Importar' },
        '.',
      ],
    ],
  },
] as const;

export const CALENDAR_FEED_CONFIRM_CONTENT: Record<
  TCalendarFeedAction,
  TCalendarFeedConfirmContent
> = {
  rotate: {
    title: 'Gerar um novo link?',
    description:
      'O link atual para de funcionar na hora. Depois, cole o novo link no calendário para continuar vendo os atendimentos.',
    confirmLabel: 'Gerar novo link',
    pendingLabel: 'Gerando...',
  },
  revoke: {
    title: 'Desativar o link da agenda?',
    description:
      'O link para de funcionar na hora e o calendário deixa de receber os atendimentos. Você pode gerar outro quando quiser.',
    confirmLabel: 'Desativar link',
    pendingLabel: 'Desativando...',
  },
};

export const MANAGER_ROLES = ['owner', 'manager'] as const;
