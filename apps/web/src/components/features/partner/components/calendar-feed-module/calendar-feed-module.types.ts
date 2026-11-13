/** Ações que derrubam o link atual e por isso pedem confirmação. */
export type TCalendarFeedAction = 'rotate' | 'revoke';

export type TCalendarMemberOption = {
  id: string;
  name: string;
};

export type TCalendarGuideTabId = 'google' | 'iphone' | 'outlook';

/** Trecho de um passo: texto corrido ou o nome de um botão, em negrito. */
export type TCalendarGuideStepPart = string | { strong: string };

export type TCalendarGuideTab = {
  id: TCalendarGuideTabId;
  label: string;
  steps: readonly (readonly TCalendarGuideStepPart[])[];
};

export type TCalendarFeedConfirmContent = {
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
};
