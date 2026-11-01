import { HeaderLogo } from '@/components/layout/header/components/header-logo';
import { ONBOARDING_LINK_CLASS } from '../../partner-onboarding.styles';

type TOnboardingHeaderProps = {
  onSaveAndExit?: () => void;
  isSaving?: boolean;
};

export const OnboardingHeader = ({
  onSaveAndExit,
  isSaving = false,
}: TOnboardingHeaderProps) => (
  <header className="flex min-h-16 items-center justify-between border-b border-[#EBE9F0] px-5 md:min-h-[72px] md:px-8">
    <HeaderLogo width={148} height={37} aria-label="ServiceSnap, página inicial" />
    {onSaveAndExit && (
      <button
        type="button"
        onClick={onSaveAndExit}
        disabled={isSaving}
        className={`${ONBOARDING_LINK_CLASS} cursor-pointer disabled:opacity-60`}
      >
        Salvar e sair
      </button>
    )}
  </header>
);
