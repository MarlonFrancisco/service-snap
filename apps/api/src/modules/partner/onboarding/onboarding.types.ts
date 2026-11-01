export const ONBOARDING_STEPS = [
  'space',
  'hours',
  'services',
  'team',
  'photos',
] as const;

export type TOnboardingStep = (typeof ONBOARDING_STEPS)[number];

export type TOnboardingStatus = 'not_needed' | 'welcome' | 'in_progress';

export type TChecklistItemId =
  | 'share_link'
  | 'photos'
  | 'email_reminders'
  | 'whatsapp'
  | 'team'
  | 'monthly_goal';

export type TChecklistItem = {
  id: TChecklistItemId;
  done: boolean;
};
