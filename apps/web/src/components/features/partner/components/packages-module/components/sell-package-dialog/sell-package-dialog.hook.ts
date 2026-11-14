'use client';

import {
  useCustomersQuery,
  useCustomersSearchTerm,
} from '@/hooks/partner/use-customers-query';
import { usePackagesMutations } from '@/hooks/partner/use-packages-mutations';
import { isApiHttpError } from '@/service/api';
import type { TSellPackage } from '@/types/api/packages.types';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import {
  getCustomerContactSummary,
  getCustomerName,
} from '../../../customers-module/customers-module.helpers';
import {
  DEFAULT_PAYMENT_METHOD,
  getPackageExpiryLabel,
  getPackageItemsLabel,
  parseMoney,
  toMoneyInput,
} from '../../packages-module.helpers';
import { useRetentionAccess } from '../../packages-module.hook';
import {
  sellPackageSchema,
  type TSellPackageSchema,
} from './sell-package-dialog.schema';
import type {
  TSellCustomerOption,
  TSellPackageSummaryRow,
  TUseSellPackageDialogConfig,
} from './sell-package-dialog.types';

const SEARCH_LIMIT = 5;

const getSellError = (error: unknown) => {
  if (isApiHttpError(error) && error.status === 409) {
    return 'Este pacote está pausado. Ative de novo para vender.';
  }
  if (isApiHttpError(error) && error.status === 400) {
    return 'Confira o cliente e os valores: precisa de telefone ou e-mail válido.';
  }
  if (isApiHttpError(error) && error.status === 403) {
    return 'Você não tem acesso para vender pacotes nesta loja.';
  }

  return 'Não foi possível vender o pacote. Tente de novo.';
};

const getEmptyValues = (price: number): TSellPackageSchema => ({
  customerMode: 'existing',
  customerId: '',
  newCustomer: { firstName: '', lastName: '', telephone: '', email: '' },
  pricePaid: toMoneyInput(price),
  payLater: false,
  paymentMethod: DEFAULT_PAYMENT_METHOD,
  paymentAmount: toMoneyInput(price),
});

const toSale = (values: TSellPackageSchema): TSellPackage => {
  const pricePaid = parseMoney(values.pricePaid) ?? 0;
  const amount = parseMoney(values.paymentAmount) ?? 0;
  const { firstName, lastName, telephone, email } = values.newCustomer;

  return {
    ...(values.customerMode === 'existing'
      ? { customerId: values.customerId }
      : {
          customer: {
            firstName,
            ...(lastName && { lastName }),
            ...(telephone && { telephone }),
            ...(email && { email }),
          },
        }),
    pricePaid,
    payments:
      values.payLater || pricePaid === 0
        ? []
        : [{ method: values.paymentMethod, amount }],
  };
};

export const useSellPackageDialog = ({
  storeId,
  servicePackage,
  onOpenChange,
}: TUseSellPackageDialogConfig) => {
  const isOpen = !!servicePackage;
  const { country, formatMoney, timeZone } = useRetentionAccess();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<TSellCustomerOption | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const debouncedSearch = useCustomersSearchTerm(search);
  const { sellPackageMutation } = usePackagesMutations({ storeId });
  const isSubmitting = sellPackageMutation.isPending;

  const form = useForm<TSellPackageSchema>({
    resolver: zodResolver(sellPackageSchema),
    defaultValues: getEmptyValues(servicePackage?.price ?? 0),
  });
  const [customerMode, payLater, pricePaid] = useWatch({
    control: form.control,
    name: ['customerMode', 'payLater', 'pricePaid'],
  });

  // Cada abertura começa limpa, com o preço de tabela
  useEffect(() => {
    if (!servicePackage) return;

    form.reset(getEmptyValues(servicePackage.price));
    setSearch('');
    setSelected(null);
    setSubmitError(null);
  }, [servicePackage, form]);

  // O valor recebido acompanha o cobrado até a pessoa mexer nele
  useEffect(() => {
    if (!form.getFieldState('paymentAmount').isDirty) {
      form.setValue('paymentAmount', pricePaid);
    }
  }, [pricePaid, form]);

  const {
    customers,
    isLoadingCustomers,
    isFetchingCustomers,
    isCustomersError,
  } = useCustomersQuery({
    storeId,
    page: 1,
    limit: SEARCH_LIMIT,
    search: debouncedSearch,
    enabled: isOpen && customerMode === 'existing',
  });

  // O escolhido continua na lista mesmo quando a busca muda
  const customerOptions = useMemo<TSellCustomerOption[]>(() => {
    const options = customers.map((customer) => ({
      id: customer.id,
      name: getCustomerName(customer),
      contact: getCustomerContactSummary(customer, country),
    }));

    return selected && !options.some((option) => option.id === selected.id)
      ? [selected, ...options]
      : options;
  }, [customers, country, selected]);

  const summary = useMemo<TSellPackageSummaryRow[]>(
    () =>
      servicePackage
        ? [
            { label: 'Serviços', value: getPackageItemsLabel(servicePackage) },
            {
              label: 'Vale até',
              value: getPackageExpiryLabel(
                servicePackage.validityDays,
                timeZone,
              ),
            },
            {
              label: 'Preço de tabela',
              value: formatMoney(servicePackage.price),
            },
          ]
        : [],
    [servicePackage, timeZone, formatMoney],
  );

  const handleSelectCustomer = useCallback(
    (option: TSellCustomerOption) => {
      setSelected(option);
      form.setValue('customerId', option.id, { shouldValidate: true });
    },
    [form],
  );

  const handleCustomerModeChange = useCallback(
    (mode: TSellPackageSchema['customerMode']) => {
      form.setValue('customerMode', mode);
      form.clearErrors(['customerId', 'newCustomer']);
    },
    [form],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isSubmitting) return;
      onOpenChange(nextOpen);
    },
    [onOpenChange, isSubmitting],
  );

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    setSubmitError(null);
    if (!servicePackage) return;

    void form.handleSubmit((values) => {
      sellPackageMutation.mutate(
        { packageId: servicePackage.id, sale: toSale(values) },
        {
          onSuccess: () => {
            toast.success('Pacote vendido');
            onOpenChange(false);
          },
          onError: (error) => setSubmitError(getSellError(error)),
        },
      );
    })(event);
  };

  const price = parseMoney(pricePaid) ?? 0;

  return {
    form,
    isOpen,
    title: servicePackage ? `Vender ${servicePackage.name}` : 'Vender pacote',
    summary,
    customerMode,
    handleCustomerModeChange,
    search,
    setSearch,
    customerOptions,
    emptySearchMessage: search.trim()
      ? 'Nenhum cliente encontrado. Use Cliente novo para cadastrar.'
      : 'A loja ainda não tem clientes. Use Cliente novo.',
    selectedCustomer: selected,
    handleSelectCustomer,
    isSearching:
      isLoadingCustomers || (isFetchingCustomers && !customers.length),
    isSearchError: isCustomersError,
    customerError: form.formState.errors.customerId?.message,
    isPaymentDisabled: payLater || price === 0,
    submitError,
    isSubmitting,
    handleOpenChange,
    handleSubmit,
  };
};
