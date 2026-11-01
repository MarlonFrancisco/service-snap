'use client';
import { IProfessional } from '@/types/api';
import { Card } from '@repo/ui';
import { Check, Info, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useGetStore } from '../../booking.hook';
import { TBookingFormData } from '../../booking.schema';

export function ProfessionalSelectionStep() {
  const stores = useGetStore();
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

    // Configurar mensagens de validação
    if (hasIncompatibleCombination) {
      form.setError('root', {
        message:
          'Esta combinação de serviços não pode ser realizada por nenhum profissional desta unidade. Por favor, volte ao Passo 1 e remova um serviço para prosseguir.',
      });
    } else if (!canUseAny && professionalsWhoCanDoSome.length > 0) {
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
    }
  };

  const handleProfessionalSelect = (professional: IProfessional) => {
    form.setValue('selectedProfessional', professional);
    form.setValue('isAnyProfessional', false);
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg sm:text-2xl text-[#0A0A0A] mb-1">
          Escolha o profissional
        </h2>
        <p className="text-sm sm:text-base text-[#2B2B2B]">
          Selecione um profissional ou deixe o sistema escolher automaticamente
        </p>
      </div>

      {/* Informações de compatibilidade */}
      {!compatibilityStatus.canUseAny &&
        !compatibilityStatus.hasIncompatibleCombination && (
          <Card className="p-4 bg-[#F4F4F5] shadow-sm">
            <div className="flex items-start gap-3 text-[#2B2B2B]">
              <Info className="h-5 w-5 text-[#2B2B2B] mt-0.5" />
              <div>
                <p className="text-sm mb-1">
                  <strong>Atenção:</strong> A combinação de serviços
                  selecionados exige profissionais específicos.
                </p>
                <p className="text-xs text-[#2B2B2B]">
                  Escolha um dos profissionais listados abaixo para continuar.
                </p>
              </div>
            </div>
          </Card>
        )}

      {/* Opção "Qualquer Profissional" */}
      <Card
        className={`p-4 cursor-pointer transition-all bg-white ${
          compatibilityStatus.canUseAny
            ? isAnyProfessional
              ? 'shadow-md ring-1 ring-black/5'
              : 'shadow-sm hover:shadow-md'
            : 'shadow-sm cursor-not-allowed opacity-50'
        }`}
        onClick={
          compatibilityStatus.canUseAny
            ? handleAnyProfessionalSelect
            : undefined
        }
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                compatibilityStatus.canUseAny ? 'bg-[#E4E4E7]' : 'bg-[#E4E4E7]'
              }`}
            >
              <User
                className={`h-5 w-5 ${
                  compatibilityStatus.canUseAny
                    ? 'text-[#2B2B2B]'
                    : 'text-[#A1A1AA]'
                }`}
              />
            </div>

            <div>
              <h4
                className={`${
                  compatibilityStatus.canUseAny
                    ? 'text-[#0A0A0A]'
                    : 'text-[#A1A1AA]'
                }`}
              >
                Qualquer Profissional
              </h4>
              <p
                className={`text-sm ${
                  compatibilityStatus.canUseAny
                    ? 'text-[#2B2B2B]'
                    : 'text-[#A1A1AA]'
                }`}
              >
                {compatibilityStatus.canUseAny
                  ? 'O sistema escolherá o melhor profissional disponível'
                  : 'Não disponível para esta combinação de serviços'}
              </p>
            </div>
          </div>

          {isAnyProfessional && compatibilityStatus.canUseAny && (
            <div className="w-6 h-6 bg-[#0A0A0A] rounded-full flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </Card>

      {/* Lista de Profissionais */}
      <div className="space-y-3">
        <h3 className="text-sm text-[#2B2B2B]">
          Ou escolha um profissional específico:
        </h3>

        {compatibilityStatus.availableProfessionals.map((professional) => {
          const canDoAll = canProfessionalDoAllServices(professional);
          const availableServices = getServicesForProfessional(professional);
          const isSelected = selectedProfessional?.id === professional.id;

          return (
            <Card
              key={professional.id}
              className={`p-4 cursor-pointer transition-all bg-white ${
                isSelected
                  ? 'shadow-md ring-1 ring-black/5'
                  : 'shadow-sm hover:shadow-md'
              }`}
              onClick={() => handleProfessionalSelect(professional)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0A0A0A]/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-[#0A0A0A]" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-[#0A0A0A]">
                        {professional.user.firstName}{' '}
                        {professional.user.lastName}
                      </h4>
                      {!canDoAll && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Parcial
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-[#2B2B2B] mb-2">
                      {professional.services?.map((s) => s.name).join(' • ')}
                    </p>

                    {!canDoAll && (
                      <p className="text-xs text-[#71717A]">
                        Pode realizar:{' '}
                        {availableServices.map((s) => s.name).join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 bg-[#0A0A0A] rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
