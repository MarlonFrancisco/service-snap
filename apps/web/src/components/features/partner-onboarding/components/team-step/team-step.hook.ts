import { isNotFoundError } from '@/service/api';
import { OnboardingService } from '@/service/partner/onboarding';
import type { TOnboardingState } from '@/types/api/onboarding.types';
import { useState } from 'react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../../partner-onboarding.helpers';
import { useOnboardingMutation } from '../../partner-onboarding.hook';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type TUseTeamStepParams = {
  state: TOnboardingState;
  onSaved: () => void;
  onExit: () => void;
};

export const useTeamStep = ({ state, onSaved, onExit }: TUseTeamStepParams) => {
  const ownerMember = state.members.find((member) => member.isOwner);
  const otherMembers = state.members.filter((member) => !member.isOwner);
  const allServiceIds = state.services.map((service) => service.id);

  // Primeira visita já vem com "Eu mesmo atendo": é o caminho mais comum, e sem
  // ninguém a loja não recebe agendamentos.
  const [ownerEnabled, setOwnerEnabled] = useState(
    Boolean(ownerMember) || !otherMembers.length,
  );
  const [ownerServiceIds, setOwnerServiceIds] = useState<string[]>(
    ownerMember?.serviceIds.length ? ownerMember.serviceIds : allServiceIds,
  );
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showSignupLink, setShowSignupLink] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const ownerMutation = useOnboardingMutation(
    OnboardingService.saveOwner.bind(OnboardingService),
  );
  const addMemberMutation = useOnboardingMutation(
    OnboardingService.addMember.bind(OnboardingService),
  );
  const removeMemberMutation = useOnboardingMutation(
    OnboardingService.removeMember.bind(OnboardingService),
  );
  const stepMutation = useOnboardingMutation(
    OnboardingService.setStep.bind(OnboardingService),
  );

  const hasProfessional =
    (ownerEnabled && ownerServiceIds.length > 0) || otherMembers.length > 0;

  const saveOwner = () =>
    ownerMutation.mutateAsync({
      enabled: ownerEnabled,
      serviceIds: ownerEnabled ? ownerServiceIds : [],
    });

  const save = async (afterSave: () => void, advance: boolean) => {
    if (ownerEnabled && !ownerServiceIds.length) {
      setStepError('Escolha pelo menos um serviço que você faz.');
      return;
    }

    if (advance && !hasProfessional) {
      return;
    }

    setStepError(null);

    try {
      await saveOwner();

      if (advance) {
        await stepMutation.mutateAsync('photos');
      }

      afterSave();
    } catch (error) {
      setStepError(
        getApiErrorMessage(error, 'Não foi possível salvar. Tente de novo.'),
      );
    }
  };

  const handleAddMember = async () => {
    setShowSignupLink(false);

    if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError('Informe um e-mail válido.');
      return;
    }

    setEmailError(null);

    try {
      // O dono entra primeiro para ocupar a vaga do plano antes do convidado.
      if (ownerEnabled && !ownerMember && ownerServiceIds.length) {
        await saveOwner();
      }

      await addMemberMutation.mutateAsync({
        email: email.trim(),
        serviceIds: allServiceIds,
      });
      setEmail('');
    } catch (error) {
      setEmailError(
        getApiErrorMessage(error, 'Não foi possível adicionar. Tente de novo.'),
      );
      setShowSignupLink(isNotFoundError(error));
    }
  };

  const handleCopySignupLink = async () => {
    const link = `${window.location.origin}/?cadastro=1`;

    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link de cadastro copiado');
    } catch {
      toast.error(`Não foi possível copiar. Envie este link: ${link}`);
    }
  };

  // A conta usada pelo plano considera o dono que ainda vai ser salvo.
  const pendingOwner = ownerEnabled && !ownerMember ? 1 : 0;
  const removingOwner = !ownerEnabled && ownerMember ? 1 : 0;

  return {
    services: state.services,
    otherMembers,
    ownerEnabled,
    ownerServiceIds,
    email,
    emailError,
    showSignupLink,
    stepError,
    hasProfessional,
    usedSlots: state.plan.count + pendingOwner - removingOwner,
    planLimit: state.plan.limit,
    isAdding: addMemberMutation.isPending,
    isSaving: ownerMutation.isPending || stepMutation.isPending,
    setOwnerEnabled,
    toggleOwnerService: (serviceId: string) =>
      setOwnerServiceIds((current) =>
        current.includes(serviceId)
          ? current.filter((id) => id !== serviceId)
          : [...current, serviceId],
      ),
    setEmail: (value: string) => {
      setEmail(value);
      setEmailError(null);
      setShowSignupLink(false);
    },
    handleAddMember: () => void handleAddMember(),
    handleRemoveMember: (memberId: string) =>
      removeMemberMutation.mutate(memberId),
    handleCopySignupLink: () => void handleCopySignupLink(),
    handleContinue: () => void save(onSaved, true),
    handleSaveAndExit: () => void save(onExit, false),
  };
};
