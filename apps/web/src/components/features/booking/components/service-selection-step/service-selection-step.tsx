'use client';
import { ICategory, IService } from '@/types/api/service.types';
import { formatStorePrice } from '@/utils/helpers/price.helper';
import { Badge, Button } from '@repo/ui';
import { Check, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { useGetStore } from '../../booking.hook';
import { TBookingFormData } from '../../booking.schema';
export function ServiceSelectionStep() {
  const store = useGetStore();
  const [selectedCategory, setSelectedCategory] = useState<
    ICategory | undefined
  >(undefined);
  const { watch, setValue } = useFormContext<TBookingFormData>();
  const selectedServices = watch('selectedServices');

  const services = store?.services || [];

  const categories = Array.from(
    new Map(
      services
        .filter((service) => service.category)
        .map((service) => [service.category!.id, service.category!]),
    ).values(),
  );

  const filteredServices = selectedCategory
    ? services.filter(
        (service) => service.category?.id === selectedCategory?.id,
      )
    : services;

  const getServiceQuantity = (serviceId: string) => {
    const service = selectedServices.find((s) => s.id === serviceId);
    return service ? service.quantity : 0;
  };

  const isSelected = (serviceId: string) => {
    return getServiceQuantity(serviceId) > 0;
  };

  const handleQuantityChange = (service: IService, newQuantity: number) => {
    const existingServiceIndex = selectedServices.findIndex(
      (s) => s.id === service.id,
    );
    const oldQuantity = getServiceQuantity(service.id);

    if (newQuantity <= 0) {
      // Remove service if quantity is 0 or less
      if (existingServiceIndex !== -1) {
        const newServices = selectedServices.filter((s) => s.id !== service.id);
        setValue('selectedServices', newServices);
        toast.info(`${service.name} removido`);
      }
    } else {
      if (existingServiceIndex !== -1) {
        // Update existing service quantity
        const newServices = [...selectedServices];
        newServices[existingServiceIndex]!.quantity = newQuantity;
        setValue('selectedServices', newServices);

        if (newQuantity > oldQuantity) {
          toast.success(`Quantidade atualizada`);
        }
      } else {
        // Add new service
        const newService = {
          ...service,
          quantity: newQuantity,
        };

        setValue('selectedServices', [...selectedServices, newService]);
        toast.success(`${service.name} adicionado`);
      }
    }
  };

  const handleServiceToggle = (service: IService) => {
    const currentQuantity = getServiceQuantity(service.id);
    const newQuantity = currentQuantity > 0 ? 0 : 1;
    handleQuantityChange(service, newQuantity);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}min`
      : `${hours}h`;
  };

  const formatPrice = (price: number) => {
    return formatStorePrice(price, store!.currency, store!.country);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg sm:text-2xl text-[#0A0A0A] mb-1">
          Selecione os serviços
        </h2>
        <p className="text-sm sm:text-base text-[#2B2B2B]">
          Escolha um ou mais serviços que deseja agendar
        </p>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <h3 className="text-sm text-[#2B2B2B]">Filtrar por categoria:</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory ? 'outline' : 'default'}
            size="sm"
            onClick={() => setSelectedCategory(undefined)}
            className={
              !selectedCategory
                ? 'bg-[#0A0A0A] hover:bg-[#2B2B2B] text-white'
                : 'border-[#D4D4D8] text-[#2B2B2B] hover:bg-[#F4F4F5]'
            }
          >
            Todos
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={
                selectedCategory?.id === category.id ? 'default' : 'outline'
              }
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory?.id === category.id
                  ? 'bg-[#0A0A0A] hover:bg-[#2B2B2B] text-white'
                  : 'border-[#D4D4D8] text-[#2B2B2B] hover:bg-[#F4F4F5]'
              }
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className={`cursor-pointer rounded-2xl bg-white p-3 transition-all sm:p-4 ${
              isSelected(service.id)
                ? 'shadow-md ring-1 ring-black/5'
                : 'shadow-sm hover:shadow-md'
            }`}
          >
            <div className="flex flex-col gap-3">
              {/* Header com título e check */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm sm:text-base text-[#0A0A0A]">
                      {service.name}
                    </h4>
                    {isSelected(service.id) && (
                      <div className="w-5 h-5 bg-[#0A0A0A] rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[#2B2B2B] mb-2">
                    {service.description}
                  </p>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className="bg-[#F4F4F5] text-[#2B2B2B] text-xs"
                    >
                      {service.category?.name}
                    </Badge>
                    <span className="text-xs sm:text-sm text-[#71717A]">
                      {formatDuration(service.duration)}
                    </span>
                  </div>
                </div>

                {/* Preço - sempre visível */}
                <div className="text-right flex-shrink-0">
                  <div className="text-base sm:text-lg text-[#0A0A0A]">
                    {formatPrice(service.price)}
                  </div>
                </div>
              </div>

              {/* Controles de quantidade - linha separada no mobile */}
              <div className="flex justify-end">
                {isSelected(service.id) ? (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-8 h-8 sm:w-9 sm:h-9 p-0 border-[#D4D4D8] text-[#2B2B2B] hover:bg-[#F4F4F5]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuantityChange(
                          service,
                          getServiceQuantity(service.id) - 1,
                        );
                      }}
                    >
                      <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>

                    <span className="mx-1 sm:mx-2 min-w-[20px] sm:min-w-[24px] text-center text-sm sm:text-base text-[#0A0A0A] font-medium">
                      {getServiceQuantity(service.id)}
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-8 h-8 sm:w-9 sm:h-9 p-0 border-black text-black hover:bg-[#F4F4F5]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuantityChange(
                          service,
                          getServiceQuantity(service.id) + 1,
                        );
                      }}
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#D4D4D8] text-[#2B2B2B] hover:bg-[#F4F4F5] h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServiceToggle(service);
                    }}
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Adicionar
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
