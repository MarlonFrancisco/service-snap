'use client';
import { useAnalytics } from '@/providers/analytics.provider';
import { IProfessional } from '@/types/api';
import { cn } from '@repo/ui';
import { Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { getInitials } from '../../booking.helpers';
import { useGetStore } from '../../booking.hook';
import { TBookingFormData } from '../../booking.schema';

const OPTION_CLASS =
  'flex w-full items-center gap-4 rounded-[22px] border border-[#E3E1EA] bg-white px-5 py-[18px] text-left text-[#0B0B0F] transition-colors enabled:hover:border-[#A6A3B4] disabled:cursor-not-allowed disabled:opacity-50';
const OPTION_SELECTED_CLASS =
  'border-2 border-[#0B0B0F] px-[19px] py-[17px] enabled:hover:border-[#0B0B0F]';
const OPTION_AVATAR_CLASS =
  'grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-[#F4F3F7] text-[15px] font-bold';
const OPTION_TITLE_CLASS =
  'flex flex-wrap items-center gap-2 text-base font-bold';
const OPTION_DESCRIPTION_CLASS = 'mt-[3px] block text-sm text-[#5F5C6E]';
const OPTION_RADIO_CLASS =
  'ml-auto h-6 w-6 shrink-0 rounded-full border-2 border-[#A6A3B4]';
const OPTION_RADIO_ON_CLASS = 'border-[7px] border-[#0B0B0F]';

export function ProfessionalSelectionStep() {
  const stores = useGetStore();
  const analytics = useAnalytics();
  const form = useFormContext<TBookingFormData>();
  const selectedServices = form.watch('selectedServices');
  const selectedProfessional = form.watch('selectedProfessional');
  const isAnyProfessional = form.watch('isAnyProfessional');

  const professionals = stores?.storeMembers?.filter(
    (member) => member.role === 'professional',
  );

  const [compatibilityStatus, setCompatibilityStatus] = useState<{
    canUseAny: boolean;
    availableProfessionals: IProfessional[];
    hasIncompatibleCombination: boolean;
  }>({
    canUseAny: true,
    availableProfessionals: professionals || [],
    hasIncompatibleCombination: false,
  });

  useEffect(() => {
    analyzeCompatibility();
  }, [selectedServices]);

  const analyzeCompatibility = () => {
    if (selectedServices.length === 0) {
      setCompatibilityStatus({
        canUseAny: true,
        availableProfessionals: professionals || [],
        hasIncompatibleCombination: false,
      });
      form.clearErrors('root');
      return;
    }

    const selectedServiceIds = selectedServices.map((s) => s.id);

    // Verificar quais profissionais podem realizar TODOS os serviços selecionados
    const professionalsWhoCanDoAll = professionals?.filter((professional) =>
      selectedServiceIds.every((serviceId) =>
        professional.services?.some((service) => service.id === serviceId),
      ),
    );

    // Verificar quais profissionais podem realizar PELO MENOS UM dos serviços
    const professionalsWhoCanDoSome =
      professionals?.filter((professional) =>
        selectedServiceIds.some((serviceId) =>
          professional.services?.some((service) => service.id === serviceId),
        ),
      ) || [];

    const canUseAny = professionalsWhoCanDoAll!.length > 0;
    const hasIncompatibleCombination = professionalsWhoCanDoSome!.length === 0;

    setCompatibilityStatus({
      canUseAny,
      availableProfessionals: professionalsWhoCanDoSome,
      hasIncompatibleCombination,
    });

    // Só bloqueia quando ninguém atende: com parciais, basta escolher um da lista
    if (hasIncompatibleCombination) {
      form.setError('root', {
        message:
          'Esta combinação de serviços não pode ser realizada por nenhum profissional desta unidade. Por favor, volte ao Passo 1 e remova um serviço para prosseguir.',
      });
    } else {
      form.clearErrors('root');
    }

    // Reset da seleção se não for mais válida
    if (isAnyProfessional && !canUseAny) {
      form.setValue('selectedProfessional', null);
      form.setValue('isAnyProfessional', false);
    } else if (
      selectedProfessional &&
      !professionalsWhoCanDoSome.find((p) => p.id === selectedProfessional.id)
    ) {
      form.setValue('selectedProfessional', null);
      form.setValue('isAnyProfessional', false);
    }
  };

  const handleAnyProfessionalSelect = () => {
    if (compatibilityStatus.canUseAny) {
      form.setValue('selectedProfessional', null);
      form.setValue('isAnyProfessional', true);
      analytics.track('select_professional', {
        store_id: stores?.id ?? '',
        is_any_professional: true,
      });
    }
  };

  const handleProfessionalSelect = (professional: IProfessional) => {
    form.setValue('selectedProfessional', professional);
    form.setValue('isAnyProfessional', false);
    analytics.track('select_professional', {
      store_id: stores?.id ?? '',
      is_any_professional: false,
      professional_id: professional.id,
    });
  };

  const canProfessionalDoAllServices = (professional: IProfessional) => {
    const selectedServiceIds = selectedServices.map((s) => s.id);
    return selectedServiceIds.every((serviceId) =>
      professional.services?.some((service) => service.id === serviceId),
    );
  };

  const getServicesForProfessional = (professional: IProfessional) => {
    return selectedServices.filter((service) =>
      professional.services?.some((s) => s.id === service.id),
    );
  };

  const isAnySelected = isAnyProfessional && compatibilityStatus.canUseAny;

  return (
    <div>
      <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-[#0B0B0F]">
        Escolha o profissional
      </h1>
      <p className="mt-1.5 mb-6 text-[15px] text-[#5F5C6E]">
        Selecione um profissional ou deixe o sistema escolher automaticamente
      </p>

      {/* Informações de compatibilidade */}
      {!compatibilityStatus.canUseAny &&
        !compatibilityStatus.hasIncompatibleCombination && (
          <div className="mb-3 flex items-start gap-3 rounded-[14px] bg-[#F7F6FA] px-[18px] py-4 text-sm leading-[1.5] text-[#0B0B0F]">
            <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div>
              <p>
                <strong>Atenção:</strong> A combinação de serviços selecionados
                exige profissionais específicos.
              </p>
              <p className="mt-1 text-[13px] text-[#5F5C6E]">
                Escolha um dos profissionais listados abaixo para continuar.
              </p>
            </div>
          </div>
        )}

      {/* Opção "Qualquer profissional" */}
      <button
        type="button"
        disabled={!compatibilityStatus.canUseAny}
        aria-pressed={isAnySelected}
        onClick={handleAnyProfessionalSelect}
        className={cn(OPTION_CLASS, isAnySelected && OPTION_SELECTED_CLASS)}
      >
        <span aria-hidden className={OPTION_AVATAR_CLASS}>
          ✦
        </span>
        <span className="min-w-0">
          <span className={OPTION_TITLE_CLASS}>Qualquer profissional</span>
          <span className={OPTION_DESCRIPTION_CLASS}>
            {compatibilityStatus.canUseAny
              ? 'O sistema escolherá o melhor profissional disponível'
              : 'Não disponível para esta combinação de serviços'}
          </span>
        </span>
        <span
          aria-hidden
          className={cn(
            OPTION_RADIO_CLASS,
            isAnySelected && OPTION_RADIO_ON_CLASS,
          )}
        />
      </button>

      {/* Lista de Profissionais */}
      <p className="mt-7 mb-3 text-[13px] font-bold tracking-[0.06em] text-[#5F5C6E] uppercase">
        Ou escolha um profissional específico
      </p>

      <div className="grid gap-3">
        {compatibilityStatus.availableProfessionals.map((professional) => {
          const canDoAll = canProfessionalDoAllServices(professional);
          const availableServices = getServicesForProfessional(professional);
          const isSelected = selectedProfessional?.id === professional.id;

          return (
            <button
              key={professional.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => handleProfessionalSelect(professional)}
              className={cn(OPTION_CLASS, isSelected && OPTION_SELECTED_CLASS)}
            >
              <span aria-hidden className={OPTION_AVATAR_CLASS}>
                {getInitials(
                  professional.user.firstName,
                  professional.user.lastName,
                )}
              </span>
              <span className="min-w-0">
                <span className={OPTION_TITLE_CLASS}>
                  {professional.user.firstName} {professional.user.lastName}
                  {!canDoAll && (
                    <span className="rounded-full bg-[#FFF1E0] px-[9px] py-[3px] text-xs font-bold text-[#8A4B00]">
                      Parcial
                    </span>
                  )}
                </span>
                <span className={OPTION_DESCRIPTION_CLASS}>
                  {canDoAll
                    ? professional.services?.map((s) => s.name).join(' • ')
                    : `Pode realizar: ${availableServices.map((s) => s.name).join(', ')}`}
                </span>
              </span>
              <span
                aria-hidden
                className={cn(
                  OPTION_RADIO_CLASS,
                  isSelected && OPTION_RADIO_ON_CLASS,
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
