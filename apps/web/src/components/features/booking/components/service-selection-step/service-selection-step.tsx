'use client';
import { ICategory, IService } from '@/types/api/service.types';
import { formatStorePrice } from '@/utils/helpers/price.helper';
import { cn } from '@repo/ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { useGetStore } from '../../booking.hook';
import { TBookingFormData } from '../../booking.schema';

const CHIP_CLASS =
  'h-11 rounded-full border px-4 text-[13px] font-semibold transition-colors';
const CHIP_ON_CLASS = 'border-[#0B0B0F] bg-[#0B0B0F] text-white';
const CHIP_OFF_CLASS =
  'border-[#E3E1EA] bg-white text-[#0B0B0F] hover:bg-[#F4F3F7]';
const QUANTITY_BUTTON_CLASS =
  'h-11 w-10 rounded-full text-lg text-white focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white md:h-9 md:w-9';

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
        const newServices = selectedServices.map((s) =>
          s.id === service.id ? { ...s, quantity: newQuantity } : s,
        );
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
    <div>
      <h2 className="mt-1.5 text-[22px] font-extrabold tracking-[-0.025em] text-[#0B0B0F] md:mt-0 md:text-[26px]">
        Selecione os serviços
      </h2>
      <p className="mt-1 text-sm text-[#5F5C6E] md:mt-1.5 md:text-[15px]">
        Escolha um ou mais serviços que deseja agendar
      </p>

      {/* Category Filter */}
      <div
        role="group"
        aria-label="Filtrar por categoria"
        className="mt-4 mb-1 flex flex-wrap gap-2 md:mt-5 md:mb-2"
      >
        <button
          type="button"
          aria-pressed={!selectedCategory}
          onClick={() => setSelectedCategory(undefined)}
          className={cn(
            CHIP_CLASS,
            !selectedCategory ? CHIP_ON_CLASS : CHIP_OFF_CLASS,
          )}
        >
          Todos
        </button>
        {categories.map((category) => {
          const isCategorySelected = selectedCategory?.id === category.id;

          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={isCategorySelected}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                CHIP_CLASS,
                isCategorySelected ? CHIP_ON_CLASS : CHIP_OFF_CLASS,
              )}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Services List */}
      {filteredServices.map((service) => (
        <article
          key={service.id}
          className="flex items-center justify-between gap-4 border-b border-[#EBE9F0] py-[18px] md:gap-6 md:py-5"
        >
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-[#0B0B0F] md:text-base">
              {service.name}
            </h3>
            <p className="mt-[3px] text-[13px] text-[#5F5C6E] md:text-sm">
              {service.description}
            </p>
            <p className="mt-1.5 text-sm text-[#0B0B0F] md:mt-2">
              <b className="font-extrabold">{formatPrice(service.price)}</b> ·{' '}
              {formatDuration(service.duration)}
            </p>
          </div>

          {isSelected(service.id) ? (
            <div className="flex h-11 shrink-0 items-center gap-0.5 rounded-full bg-[#0B0B0F] text-sm font-bold text-white md:gap-1.5 md:px-1">
              <button
                type="button"
                aria-label={`Remover um: ${service.name}`}
                className={QUANTITY_BUTTON_CLASS}
                onClick={() =>
                  handleQuantityChange(
                    service,
                    getServiceQuantity(service.id) - 1,
                  )
                }
              >
                −
              </button>
              <span aria-live="polite">{getServiceQuantity(service.id)}</span>
              <button
                type="button"
                aria-label={`Adicionar mais um: ${service.name}`}
                className={QUANTITY_BUTTON_CLASS}
                onClick={() =>
                  handleQuantityChange(
                    service,
                    getServiceQuantity(service.id) + 1,
                  )
                }
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label={`Adicionar ${service.name}`}
              className="h-11 shrink-0 rounded-full border border-[#0B0B0F] bg-white px-4 text-[13px] font-bold text-[#0B0B0F] transition-colors hover:bg-[#F4F3F7] md:px-5"
              onClick={() => handleServiceToggle(service)}
            >
              Adicionar
            </button>
          )}
        </article>
      ))}
    </div>
  );
}
