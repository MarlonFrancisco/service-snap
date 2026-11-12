import {
  cn,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@repo/ui';
import { Search } from 'lucide-react';
import {
  ADD_APPOINTMENT_ERROR_CLASS,
  ADD_APPOINTMENT_FIELD_CLASS,
  ADD_APPOINTMENT_HINT_CLASS,
  ADD_APPOINTMENT_LABEL_CLASS,
  ADD_APPOINTMENT_LEGEND_CLASS,
  ADD_APPOINTMENT_NOTICE_CLASS,
  ADD_APPOINTMENT_OPTION_ACTIVE_CLASS,
  ADD_APPOINTMENT_OPTION_CLASS,
  ADD_APPOINTMENT_OPTION_INPUT_CLASS,
  ADD_APPOINTMENT_SEGMENT_ACTIVE_CLASS,
  ADD_APPOINTMENT_SEGMENT_CLASS,
} from '../add-appointment.styles';
import type { TAppointmentCustomerFieldConfig } from './appointment-customer-field.types';

const NEW_CUSTOMER_FIELDS = [
  {
    name: 'newCustomer.firstName',
    label: 'Nome *',
    type: 'text',
    placeholder: 'Nome',
  },
  {
    name: 'newCustomer.lastName',
    label: 'Sobrenome',
    type: 'text',
    placeholder: 'Sobrenome',
  },
  {
    name: 'newCustomer.telephone',
    label: 'Telefone *',
    type: 'tel',
    placeholder: '(00) 00000-0000',
  },
  {
    name: 'newCustomer.email',
    label: 'E-mail (opcional)',
    type: 'email',
    placeholder: 'email@exemplo.com',
  },
] as const;

export const AppointmentCustomerField = ({
  control,
  mode,
  canUseStoreCustomers,
  onModeChange,
  search,
  onSearchChange,
  options,
  selectedId,
  onSelect,
  isSearching,
  isSearchError,
  error,
}: TAppointmentCustomerFieldConfig) => {
  const renderResults = () => {
    if (isSearching) {
      return (
        <p className={ADD_APPOINTMENT_NOTICE_CLASS}>Buscando clientes...</p>
      );
    }
    if (isSearchError) {
      return (
        <p role="alert" className={ADD_APPOINTMENT_NOTICE_CLASS}>
          Não foi possível buscar os clientes. Tente de novo ou use Cliente
          novo.
        </p>
      );
    }
    if (options.length === 0) {
      return (
        <p className={ADD_APPOINTMENT_NOTICE_CLASS}>
          {search.trim()
            ? 'Nenhum cliente encontrado. Use Cliente novo para cadastrar.'
            : 'A loja ainda não tem clientes. Use Cliente novo.'}
        </p>
      );
    }

    return (
      <div
        role="radiogroup"
        aria-label="Resultados da busca"
        aria-invalid={!!error || undefined}
        className="grid gap-2"
      >
        {options.map((option) => {
          const isSelected = option.id === selectedId;

          return (
            <label
              key={option.id}
              className={cn(
                ADD_APPOINTMENT_OPTION_CLASS,
                isSelected && ADD_APPOINTMENT_OPTION_ACTIVE_CLASS,
              )}
            >
              <input
                type="radio"
                name="appointment-customer"
                value={option.id}
                checked={isSelected}
                onChange={() => onSelect(option.id)}
                className={ADD_APPOINTMENT_OPTION_INPUT_CLASS}
              />
              <span className="min-w-0">
                <b className="block text-sm font-bold break-words">
                  {option.name}
                </b>
                <span className="mt-0.5 block text-[13px] font-medium break-all text-[#5F5C6E]">
                  {option.contact}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    );
  };

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="sr-only">Cliente</legend>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <span aria-hidden="true" className={ADD_APPOINTMENT_LEGEND_CLASS}>
          Cliente *
        </span>
        <div
          role="group"
          aria-label="Tipo de cliente"
          className="inline-flex gap-1 rounded-full border border-[#E3E1EA] p-1"
        >
          <button
            type="button"
            aria-pressed={mode === 'store'}
            disabled={!canUseStoreCustomers}
            onClick={() => onModeChange('store')}
            className={cn(
              ADD_APPOINTMENT_SEGMENT_CLASS,
              mode === 'store' && ADD_APPOINTMENT_SEGMENT_ACTIVE_CLASS,
            )}
          >
            Cliente da loja
          </button>
          <button
            type="button"
            aria-pressed={mode === 'new'}
            onClick={() => onModeChange('new')}
            className={cn(
              ADD_APPOINTMENT_SEGMENT_CLASS,
              mode === 'new' && ADD_APPOINTMENT_SEGMENT_ACTIVE_CLASS,
            )}
          >
            Cliente novo
          </button>
        </div>
      </div>

      {mode === 'store' ? (
        <div className="grid gap-2">
          <label className="relative block">
            <span className="sr-only">Buscar cliente</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-4 left-4 size-[18px] stroke-2 text-[#5F5C6E]"
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar cliente por nome, telefone ou e-mail"
              className={cn(ADD_APPOINTMENT_FIELD_CLASS, 'pl-11')}
            />
          </label>
          {renderResults()}
          {error ? (
            <p role="alert" className={ADD_APPOINTMENT_ERROR_CLASS}>
              {error}
            </p>
          ) : null}
        </div>
      ) : (
        <>
          {!canUseStoreCustomers ? (
            <p className={cn(ADD_APPOINTMENT_NOTICE_CLASS, 'mb-3')}>
              A lista de clientes é só do dono e do gerente. Informe o contato
              do cliente.
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {NEW_CUSTOMER_FIELDS.map((item) => (
              <FormField
                key={item.name}
                control={control}
                name={item.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={ADD_APPOINTMENT_LABEL_CLASS}>
                      {item.label}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type={item.type}
                        placeholder={item.placeholder}
                        autoComplete="off"
                        className={ADD_APPOINTMENT_FIELD_CLASS}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          <p className={cn(ADD_APPOINTMENT_HINT_CLASS, 'mt-1.5')}>
            Não precisa ter conta no ServiceSnap.
          </p>
        </>
      )}
    </fieldset>
  );
};
