import {
  formatDay,
  getCustomerContactLines,
  getCustomerName,
} from '@/components/features/partner/components/customers-module/customers-module.helpers';
import { invalidateCustomers } from '@/hooks/partner/use-customers-mutations';
import {
  useCustomersQuery,
  useCustomersSearchTerm,
} from '@/hooks/partner/use-customers-query';
import { useAvailabilityQuery } from '@/hooks/use-query/use-availability-query';
import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import { useAnalytics } from '@/providers/analytics.provider';
import { isApiHttpError } from '@/service/api';
import { ScheduleService } from '@/service/partner/schedule';
import { usePartnerStore } from '@/store';
import { useAgendaStore } from '@/store/admin/agenda';
import type {
  IAppointment,
  ICreateAppointment,
} from '@/types/api/schedule.types';
import type { IService } from '@/types/api/service.types';
import type { IProfessional } from '@/types/api/users.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatStorePrice } from '@repo/shared/formatters';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  addMinutesToTime,
  formatServiceDuration,
  formatTotalDuration,
  getCreateAppointmentErrorMessage,
  getTodayKey,
} from './add-appointment.helpers';
import {
  ADD_APPOINTMENT_EMPTY_VALUES,
  addAppointmentSchema,
  type TAddAppointmentSchema,
} from './add-appointment.schema';
import type {
  TAppointmentSummaryData,
  TCustomerMode,
  TCustomerOption,
  TProfessionalOption,
  TServiceOption,
  TTimeOption,
} from './add-appointment.types';

const EMPTY_PROFESSIONALS: IProfessional[] = [];
const EMPTY_SERVICES: IService[] = [];
const CUSTOMER_RESULTS_LIMIT = 5;
const EMPTY_LABEL = '—';

const getProfessionalName = (professional: IProfessional) =>
  [professional.user?.firstName, professional.user?.lastName]
    .filter(Boolean)
    .join(' ') || 'Profissional';

/** Sem a lista de serviços do profissional, quem decide é a API. */
const performsAll = (professional: IProfessional, serviceIds: string[]) =>
  !professional.services ||
  serviceIds.every((id) =>
    professional.services?.some((service) => service.id === id),
  );

export const useAddAppointmentMutations = ({
  storeId,
  onCreated,
}: {
  storeId: string;
  onCreated: () => void;
}) => {
  const analytics = useAnalytics();
  const queryClient = useQueryClient();

  const { mutate: createAppointment, isPending: isCreatingAppointment } =
    useMutation({
      mutationFn: (data: Partial<ICreateAppointment>) =>
        ScheduleService.create(storeId, data),
      onSuccess: (data: IAppointment[]) => {
        void queryClient.invalidateQueries({
          queryKey: CACHE_QUERY_KEYS.schedules(storeId),
        });
        void queryClient.invalidateQueries({
          queryKey: [`partner/schedules/${storeId}/availability`],
        });
        void invalidateCustomers(queryClient, storeId);
        analytics.track('appointment_created', {
          store_id: storeId,
          service_ids: data.map((appointment) => appointment.service?.id),
          value: data.reduce(
            (total, appointment) =>
              total + (appointment.price ?? appointment.service?.price ?? 0),
            0,
          ),
          source: 'partner',
        });
        toast.success('Agendamento criado com sucesso');
        onCreated();
      },
      onError: (error) => {
        const httpStatus = isApiHttpError(error) ? error.status : undefined;
        analytics.track('appointment_create_failed', {
          store_id: storeId,
          reason: httpStatus === 409 ? 'conflict' : 'other',
          http_status: httpStatus,
        });
      },
    });

  return { createAppointment, isCreatingAppointment };
};

export const useAddAppointment = () => {
  const form = useForm<TAddAppointmentSchema>({
    resolver: zodResolver(addAppointmentSchema),
    defaultValues: ADD_APPOINTMENT_EMPTY_VALUES,
  });
  const { setValue, reset, watch } = form;
  const errors = form.formState.errors;
  const isSubmitted = form.formState.isSubmitted;

  const isOpen = useAgendaStore((state) => state.isAddAppointmentOpen);
  const selectedAppointment = useAgendaStore(
    (state) => state.selectedAppointment,
  );
  const setIsAddAppointmentOpen = useAgendaStore(
    (state) => state.setIsAddAppointmentOpen,
  );

  const storeId = usePartnerStore((state) => state.activeStore.id);
  const currency = usePartnerStore((state) => state.activeStore.currency);
  const country = usePartnerStore((state) => state.activeStore.country);
  const storeMembers = usePartnerStore(
    (state) => state.activeStore.storeMembers ?? EMPTY_PROFESSIONALS,
  );
  const storeServices = usePartnerStore(
    (state) => state.activeStore.services ?? EMPTY_SERVICES,
  );
  const { stores } = useStoresQuery();
  const isProfessionalRole =
    stores.find((store) => store.id === storeId)?.memberRole === 'professional';

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [pickedCustomer, setPickedCustomer] = useState<TCustomerOption | null>(
    null,
  );
  // Horário que veio do clique na grade: confere uma vez com os oferecidos
  const prefilledTimeRef = useRef<string | null>(null);

  const customerMode = watch('customerMode');
  const customerId = watch('customerId');
  const newCustomer = watch('newCustomer');
  const serviceIds = watch('serviceIds');
  const storeMemberId = watch('storeMemberId');
  const date = watch('date');
  const startTime = watch('startTime');
  const isFitIn = watch('isFitIn');
  const fitInTime = watch('fitInTime');

  const formatMoney = useCallback(
    (value: number) => formatStorePrice(value, currency, country),
    [currency, country],
  );

  const handleClose = useCallback(() => {
    setIsAddAppointmentOpen({ isAddAppointmentOpen: false });
  }, [setIsAddAppointmentOpen]);

  const { createAppointment, isCreatingAppointment } =
    useAddAppointmentMutations({ storeId, onCreated: handleClose });

  // Cada abertura parte do slot clicado, do cliente da ficha ou do zero
  useEffect(() => {
    if (!isOpen) return;

    const prefill = selectedAppointment;
    const prefilledUser = prefill?.user?.id ? prefill.user : null;

    reset({
      ...ADD_APPOINTMENT_EMPTY_VALUES,
      customerId: prefilledUser?.id ?? '',
      storeMemberId: prefill?.storeMember?.id ?? '',
      date: prefill?.date || getTodayKey(),
      startTime: prefill?.startTime ?? '',
    });
    prefilledTimeRef.current = prefill?.startTime || null;
    setPickedCustomer(
      prefilledUser
        ? {
            id: prefilledUser.id,
            name: getCustomerName(prefilledUser),
            contact: Object.values(
              getCustomerContactLines(prefilledUser, country),
            ).join(' · '),
          }
        : null,
    );
    setCustomerSearch('');
    setSubmitError(null);
  }, [isOpen, selectedAppointment, reset, country]);

  // ----- Cliente -----
  const debouncedSearch = useCustomersSearchTerm(customerSearch);
  const {
    customers,
    isLoadingCustomers,
    isFetchingCustomers,
    isCustomersError,
    isCustomersForbidden,
  } = useCustomersQuery({
    storeId,
    page: 1,
    limit: CUSTOMER_RESULTS_LIMIT,
    search: debouncedSearch,
    enabled: isOpen && customerMode === 'store' && !isProfessionalRole,
  });
  const canUseStoreCustomers = !isProfessionalRole && !isCustomersForbidden;

  // Sem acesso à lista (profissional), só dá para cadastrar o contato
  useEffect(() => {
    if (isOpen && !canUseStoreCustomers && customerMode === 'store') {
      setValue('customerMode', 'new');
      setValue('customerId', '');
    }
  }, [isOpen, canUseStoreCustomers, customerMode, setValue]);

  const customerOptions = useMemo<TCustomerOption[]>(() => {
    const options = customers.map((customer) => ({
      id: customer.id,
      name: getCustomerName(customer),
      contact: Object.values(getCustomerContactLines(customer, country)).join(
        ' · ',
      ),
    }));

    // O escolhido continua visível mesmo fora do resultado da busca
    if (pickedCustomer && !options.some(({ id }) => id === pickedCustomer.id)) {
      return [pickedCustomer, ...options];
    }

    return options;
  }, [customers, country, pickedCustomer]);

  const handleCustomerModeChange = useCallback(
    (mode: TCustomerMode) => {
      setValue('customerMode', mode, { shouldValidate: isSubmitted });
      setSubmitError(null);
    },
    [setValue, isSubmitted],
  );

  const handleCustomerSelect = useCallback(
    (id: string) => {
      const option = customerOptions.find((item) => item.id === id) ?? null;
      setPickedCustomer(option);
      setValue('customerId', id, { shouldValidate: isSubmitted });
      setSubmitError(null);
    },
    [customerOptions, setValue, isSubmitted],
  );

  // ----- Serviços e profissional -----
  const activeServices = useMemo(
    () => storeServices.filter((service) => service.isActive !== false),
    [storeServices],
  );
  const selectedServices = useMemo(
    () => activeServices.filter((service) => serviceIds.includes(service.id)),
    [activeServices, serviceIds],
  );
  const totalDuration = selectedServices.reduce(
    (total, service) => total + service.duration,
    0,
  );
  const totalPrice = selectedServices.reduce(
    (total, service) => total + Number(service.price ?? 0),
    0,
  );

  const serviceOptions = useMemo<TServiceOption[]>(
    () =>
      activeServices.map((service) => ({
        id: service.id,
        name: service.name,
        durationLabel: formatServiceDuration(service.duration),
        priceLabel: formatMoney(Number(service.price ?? 0)),
        isSelected: serviceIds.includes(service.id),
      })),
    [activeServices, serviceIds, formatMoney],
  );

  const eligibleMembers = useMemo(
    () =>
      storeMembers.filter(
        (member) =>
          member.isActive !== false && performsAll(member, serviceIds),
      ),
    [storeMembers, serviceIds],
  );
  const professionalOptions = useMemo<TProfessionalOption[]>(
    () =>
      eligibleMembers.map((member) => ({
        id: member.id,
        name: getProfessionalName(member),
      })),
    [eligibleMembers],
  );

  // Quem não faz todos os serviços sai; se sobrar um só, já fica escolhido
  useEffect(() => {
    if (!isOpen) return;

    const isEligible = eligibleMembers.some(({ id }) => id === storeMemberId);

    if (storeMemberId && !isEligible) {
      setValue('storeMemberId', '');
    } else if (
      !storeMemberId &&
      serviceIds.length > 0 &&
      eligibleMembers.length === 1 &&
      eligibleMembers[0]
    ) {
      setValue('storeMemberId', eligibleMembers[0].id, {
        shouldValidate: isSubmitted,
      });
    }
  }, [
    isOpen,
    eligibleMembers,
    storeMemberId,
    serviceIds.length,
    setValue,
    isSubmitted,
  ]);

  const handleServiceToggle = useCallback(
    (serviceId: string) => {
      const next = serviceIds.includes(serviceId)
        ? serviceIds.filter((id) => id !== serviceId)
        : [...serviceIds, serviceId];

      setValue('serviceIds', next, { shouldValidate: isSubmitted });
      setSubmitError(null);
    },
    [serviceIds, setValue, isSubmitted],
  );

  const handleProfessionalChange = useCallback(
    (memberId: string) => {
      setValue('storeMemberId', memberId, { shouldValidate: isSubmitted });
      setSubmitError(null);
    },
    [setValue, isSubmitted],
  );

  // ----- Horário -----
  const canLoadSlots =
    isOpen && serviceIds.length > 0 && !!storeMemberId && !!date;
  const { slots, isLoadingSlots, isSlotsError } = useAvailabilityQuery({
    storeId: canLoadSlots ? storeId : undefined,
    date,
    serviceIds,
    memberId: storeMemberId,
  });

  const availableTimes = useMemo(
    () =>
      (slots ?? [])
        .filter(
          (slot) =>
            slot.available &&
            (!slot.storeMemberId || slot.storeMemberId === storeMemberId),
        )
        .map((slot) => slot.time),
    [slots, storeMemberId],
  );
  const areSlotsReady = canLoadSlots && !isLoadingSlots && !!slots;

  // Horário que não é mais oferecido sai; o da grade vira encaixe, que foi
  // a escolha explícita de quem clicou
  useEffect(() => {
    if (!areSlotsReady) return;

    const prefilled = prefilledTimeRef.current;

    if (prefilled && startTime === prefilled) {
      prefilledTimeRef.current = null;

      if (!availableTimes.includes(prefilled)) {
        setValue('startTime', '');
        setValue('isFitIn', true);
        setValue('fitInTime', prefilled);
      }
      return;
    }

    if (!isFitIn && startTime && !availableTimes.includes(startTime)) {
      setValue('startTime', '');
    }
  }, [areSlotsReady, availableTimes, startTime, isFitIn, setValue]);

  const timeOptions = useMemo<TTimeOption[]>(
    () =>
      availableTimes.map((time) => ({
        time,
        isSelected: !isFitIn && time === startTime,
      })),
    [availableTimes, isFitIn, startTime],
  );

  const handleTimeSelect = useCallback(
    (time: string) => {
      prefilledTimeRef.current = null;
      setValue('isFitIn', false);
      setValue('startTime', time, { shouldValidate: isSubmitted });
      setSubmitError(null);
    },
    [setValue, isSubmitted],
  );

  const handleFitInToggle = useCallback(() => {
    prefilledTimeRef.current = null;
    const next = !isFitIn;

    setValue('isFitIn', next, { shouldValidate: isSubmitted });
    if (next && !fitInTime) {
      setValue('fitInTime', startTime);
    }
    setSubmitError(null);
  }, [isFitIn, fitInTime, startTime, setValue, isSubmitted]);

  const handleDateChange = useCallback(
    (value: string) => {
      setValue('date', value, { shouldValidate: isSubmitted });
      setSubmitError(null);
    },
    [setValue, isSubmitted],
  );

  // ----- Resumo -----
  const chosenTime = isFitIn ? fitInTime : startTime;
  const professional = storeMembers.find(({ id }) => id === storeMemberId);

  const summary: TAppointmentSummaryData = {
    customerName:
      customerMode === 'store'
        ? (pickedCustomer && pickedCustomer.id === customerId
            ? pickedCustomer.name
            : '') || EMPTY_LABEL
        : [newCustomer.firstName, newCustomer.lastName]
            .map((part) => part.trim())
            .filter(Boolean)
            .join(' ') || EMPTY_LABEL,
    customerContact:
      customerMode === 'store'
        ? (pickedCustomer?.id === customerId && pickedCustomer?.contact) || ''
        : `Cliente novo${newCustomer.telephone.trim() ? ` · ${newCustomer.telephone.trim()}` : ''}`,
    services: selectedServices.map((service) => ({
      id: service.id,
      name: service.name,
      priceLabel: formatMoney(Number(service.price ?? 0)),
    })),
    professionalName: professional
      ? getProfessionalName(professional)
      : EMPTY_LABEL,
    dateTimeLabel:
      [
        formatDay(date),
        chosenTime ? `${chosenTime}${isFitIn ? ' (encaixe)' : ''}` : '',
      ]
        .filter(Boolean)
        .join(' · ') || EMPTY_LABEL,
    durationLabel: totalDuration
      ? formatTotalDuration(totalDuration)
      : EMPTY_LABEL,
    totalLabel: formatMoney(totalPrice),
  };

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    setSubmitError(null);

    void form.handleSubmit(
      (data) => {
        const time = data.isFitIn ? data.fitInTime : data.startTime;
        const { firstName, lastName, telephone, email } = data.newCustomer;

        createAppointment(
          {
            user:
              data.customerMode === 'store'
                ? { id: data.customerId }
                : {
                    firstName,
                    telephone,
                    ...(lastName && { lastName }),
                    ...(email && { email }),
                  },
            services: selectedServices.map(({ id, duration }) => ({
              id,
              duration,
            })),
            storeMember: { id: data.storeMemberId },
            date: data.date,
            startTime: time,
            endTime: addMinutesToTime(time, totalDuration),
            status: 'scheduled',
            ...(data.notes.trim() && { notes: data.notes.trim() }),
          },
          {
            onError: (error) => {
              const message = getCreateAppointmentErrorMessage(error);
              setSubmitError(message);
              toast.error(message);
            },
          },
        );
      },
      () => toast.error('Confira os campos destacados'),
    )(event);
  };

  return {
    form,
    isOpen,
    handleClose,
    handleSubmit,
    isCreatingAppointment,
    submitError,
    customer: {
      mode: customerMode,
      canUseStoreCustomers,
      onModeChange: handleCustomerModeChange,
      search: customerSearch,
      onSearchChange: setCustomerSearch,
      options: customerOptions,
      selectedId: customerId,
      onSelect: handleCustomerSelect,
      isSearching:
        isLoadingCustomers || (isFetchingCustomers && !customers.length),
      isSearchError: isCustomersError && !isCustomersForbidden,
      error: errors.customerId?.message,
    },
    services: {
      options: serviceOptions,
      onToggle: handleServiceToggle,
      error: errors.serviceIds?.message,
    },
    professionals: {
      options: professionalOptions,
      value: storeMemberId,
      onChange: handleProfessionalChange,
      hasNoneForServices:
        serviceIds.length > 0 && professionalOptions.length === 0,
      error: errors.storeMemberId?.message,
    },
    schedule: {
      date,
      onDateChange: handleDateChange,
      dateError: errors.date?.message,
      options: timeOptions,
      onSelect: handleTimeSelect,
      isFitIn,
      onFitInToggle: handleFitInToggle,
      fitInTime,
      onFitInTimeChange: (value: string) =>
        setValue('fitInTime', value, { shouldValidate: isSubmitted }),
      canLoad: canLoadSlots,
      isLoading: canLoadSlots && isLoadingSlots,
      isError: isSlotsError,
      timeError: errors.startTime?.message,
      fitInError: errors.fitInTime?.message,
    },
    summary,
  };
};
