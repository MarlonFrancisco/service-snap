import { formatStorePrice } from '@/utils/helpers/price.helper';
import { Badge, Card, Separator } from '@repo/ui';
import { Calendar, Clock, MapPin, Phone, User } from 'lucide-react';
import { TBookingStep } from '../../booking.types';
import { useBookingSidebar } from './booking-sidebar.hook';

interface BookingSidebarProps {
  totalPrice: number;
  totalDuration: number;
  currentStep: TBookingStep;
}

export function BookingSidebar({
  totalPrice,
  totalDuration,
  currentStep,
}: BookingSidebarProps) {
  const { data, formatters, state, store } = useBookingSidebar(
    totalPrice,
    totalDuration,
    currentStep,
  );

  const {
    businessName,
    businessAddress,
    businessPhone,
    selectedServices,
    selectedProfessional,
    isAnyProfessional,
    selectedDate,
    selectedTime,
  } = data;

  const { formatPrice, formatDuration, formatFullDate } = formatters;
  const { showEmptyState, showProfessionalWarning, showDateTimeWarning } =
    state;

  return (
    <div
      className="space-y-4"
      role="complementary"
      aria-label="Resumo do agendamento"
    >
      {/* Informações do Estabelecimento */}
      <Card className="p-4 sm:p-5 sticky top-24 bg-white shadow-xl">
        <div className="space-y-4">
          {/* Header do estabelecimento */}
          <div>
            <h3 className="text-base sm:text-lg text-[#0A0A0A] mb-1">
              {businessName}
            </h3>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#2B2B2B] mb-2">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>{businessAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#2B2B2B]">
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span>{businessPhone}</span>
            </div>
          </div>

          <Separator />

          {/* Resumo do Agendamento */}
          <div>
            <h4 className="text-[#0A0A0A] mb-3">Resumo da Reserva</h4>

            {/* Serviços */}
            {selectedServices.length > 0 && (
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-[#2B2B2B]">
                  <span>Serviços selecionados:</span>
                </div>
                <div className="space-y-2">
                  {selectedServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm text-[#0A0A0A]">
                            {service.name}
                          </p>
                          {service.quantity > 1 && (
                            <span className="bg-[#0A0A0A] text-white px-1.5 py-0.5 rounded-full text-xs">
                              {service.quantity}x
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {service.category?.name}
                          </Badge>
                          <span className="text-xs text-[#71717A]">
                            {formatDuration(
                              service.duration * service.quantity,
                            )}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-[#0A0A0A] ml-2">
                        {formatStorePrice(
                          service.price * service.quantity,
                          store!.currency,
                          store!.country,
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {selectedServices.length > 1 && (
                  <div className="border-t border-[#E4E4E7] pt-2 flex justify-between items-center">
                    <span className="text-sm">Duração total:</span>
                    <span className="text-sm text-[#0A0A0A]">
                      {formatDuration(totalDuration)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Profissional */}
            {(selectedProfessional || isAnyProfessional) && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-[#71717A]" />
                  <span className="text-sm text-[#2B2B2B]">Profissional:</span>
                </div>
                <p className="text-sm text-[#0A0A0A] ml-6">
                  {isAnyProfessional
                    ? 'Qualquer profissional'
                    : selectedProfessional?.user.firstName +
                      ' ' +
                      selectedProfessional?.user.lastName}
                </p>
                {selectedProfessional && (
                  <p className="text-xs text-[#71717A] ml-6">
                    {selectedProfessional.services
                      ?.map((s) => s.name)
                      .join(' • ')}
                  </p>
                )}
              </div>
            )}

            {/* Data e Hora */}
            {selectedDate && selectedTime && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-[#71717A]" />
                  <span className="text-sm text-[#2B2B2B]">Agendado para:</span>
                </div>
                <div className="ml-6">
                  <p className="text-sm text-[#0A0A0A]">
                    {formatFullDate(selectedDate)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-[#71717A]" />
                    <span className="text-sm text-[#2B2B2B]">
                      {selectedTime}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Total */}
            {selectedServices.length > 0 && (
              <>
                <Separator />
                <div className="pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#0A0A0A]">Total:</span>
                    <span className="text-lg text-[#0A0A0A]">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  {currentStep !== 'checkout' && (
                    <p className="text-xs text-[#71717A] mt-1">
                      Pagamento no local
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Status do progresso */}
          {showEmptyState && (
            <div className="text-center py-6 text-[#71717A]">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-[#D4D4D8]" />
              <p className="text-sm">Selecione um serviço para começar</p>
            </div>
          )}

          {showProfessionalWarning && (
            <div className="text-center py-4 text-amber-600 bg-amber-50 rounded-lg">
              <User className="h-6 w-6 mx-auto mb-1" />
              <p className="text-sm">Escolha um profissional</p>
            </div>
          )}

          {showDateTimeWarning && (
            <div className="text-center py-4 text-[#2B2B2B] bg-[#F4F4F5] rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-1" />
              <p className="text-sm">Selecione data e horário</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
