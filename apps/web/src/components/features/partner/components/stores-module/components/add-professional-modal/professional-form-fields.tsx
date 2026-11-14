import {
  PARTNER_FOCUS_CLASS,
  PARTNER_PORTAL_CLASS,
} from '@/components/features/partner/partner.styles';
import {
  cn,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import {
  STORES_CHIP_CLASS,
  STORES_CHIP_REMOVE_CLASS,
  STORES_FIELD_CLASS,
  STORES_FIELDSET_CLASS,
  STORES_HINT_CLASS,
  STORES_LABEL_CLASS,
  STORES_SELECT_TRIGGER_CLASS,
} from '../../stores-module.styles';
import {
  OWNER_ROLE_LOCKED_DESCRIPTION,
  TEAM_ROLE_OPTIONS,
} from '../../utils/stores-module.constants';
import type {
  TProfessionalFormFieldsConfig,
  TProfessionalIdentityFieldsConfig,
  TProfessionalRoleFieldConfig,
  TProfessionalServicesFieldConfig,
} from './add-professional-modal.types';
import type { TProfessionalFormSchema } from './add-professional.schema';

const SERVICES_SELECT_ID = 'professional-services';

export const ProfessionalIdentityFields = ({
  isEditing,
}: TProfessionalIdentityFieldsConfig) => {
  const form = useFormContext<TProfessionalFormSchema>();

  return (
    <>
      <FormField
        control={form.control}
        name="user.email"
        render={({ field }) => (
          <FormItem className="gap-1.5">
            <FormLabel className={STORES_LABEL_CLASS}>E-mail *</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="email"
                autoComplete="off"
                disabled={isEditing}
                placeholder="email@exemplo.com"
                className={STORES_FIELD_CLASS}
              />
            </FormControl>
            <FormDescription className={STORES_HINT_CLASS}>
              {isEditing
                ? 'O e-mail identifica a conta e não pode ser alterado.'
                : 'Se a pessoa ainda não tem conta, criamos e mandamos um convite. Ela entra com o código que chega no e-mail.'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {isEditing ? null : (
        <FormField
          control={form.control}
          name="user.name"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={STORES_LABEL_CLASS}>
                Nome{' '}
                <span className="font-medium text-[#5F5C6E]">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  autoComplete="off"
                  maxLength={100}
                  placeholder="Nome da pessoa"
                  className={STORES_FIELD_CLASS}
                />
              </FormControl>
              <FormDescription className={STORES_HINT_CLASS}>
                Para quem ainda não tem conta
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};

export const ProfessionalRoleField = ({
  canGrantOwner,
}: TProfessionalRoleFieldConfig) => {
  const form = useFormContext<TProfessionalFormSchema>();
  const initialRole = form.formState.defaultValues?.role;
  // Quem não é dono não mexe no papel de um sócio já existente.
  const isRoleLocked = !canGrantOwner && initialRole === 'owner';

  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <fieldset className={cn(STORES_FIELDSET_CLASS, 'gap-2')}>
          <legend className="mb-2 p-0 text-sm font-semibold">Papel *</legend>
          {TEAM_ROLE_OPTIONS.map((option) => {
            const isDisabled =
              isRoleLocked || (option.role === 'owner' && !canGrantOwner);

            return (
              <label
                key={option.role}
                className={cn(
                  'flex items-start gap-2.5 rounded-[14px] border border-[#E3E1EA] px-3.5 py-3 text-sm font-semibold',
                  isDisabled
                    ? 'cursor-not-allowed bg-[#F7F6FA] text-[#5F5C6E]'
                    : 'cursor-pointer',
                  field.value === option.role &&
                    !isDisabled &&
                    'border-[#0B0B0F]',
                )}
              >
                <input
                  type="radio"
                  name={field.name}
                  value={option.role}
                  checked={field.value === option.role}
                  disabled={isDisabled}
                  onChange={() => field.onChange(option.role)}
                  className={cn(
                    'mt-0.5 size-5 shrink-0 accent-[#0B0B0F]',
                    PARTNER_FOCUS_CLASS,
                  )}
                />
                <span>
                  {option.label}
                  <span className="block text-[13px] font-medium text-[#5F5C6E]">
                    {option.role === 'owner' && !canGrantOwner
                      ? OWNER_ROLE_LOCKED_DESCRIPTION
                      : option.description}
                  </span>
                </span>
              </label>
            );
          })}
          {isRoleLocked ? (
            <p className={STORES_HINT_CLASS}>
              Só o dono da loja muda o papel de um sócio.
            </p>
          ) : null}
        </fieldset>
      )}
    />
  );
};

export const ProfessionalServicesField = ({
  services,
  selectedServices,
  addService,
  removeService,
}: TProfessionalServicesFieldConfig) => (
  <>
    <div className="grid gap-1.5">
      <Label htmlFor={SERVICES_SELECT_ID} className={STORES_LABEL_CLASS}>
        Serviços que a pessoa faz
      </Label>
      <Select onValueChange={addService} value="default">
        <SelectTrigger
          id={SERVICES_SELECT_ID}
          className={STORES_SELECT_TRIGGER_CLASS}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={PARTNER_PORTAL_CLASS}>
          <SelectItem value="default" disabled>
            Adicionar serviço
          </SelectItem>
          {services.map((service) => (
            <SelectItem
              key={service.id}
              value={service.id}
              disabled={selectedServices.some((s) => s.id === service.id)}
            >
              {service.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {selectedServices.length > 0 ? (
      <ul className="flex flex-wrap gap-1.5">
        {selectedServices.map((service) => (
          <li key={service.id} className={STORES_CHIP_CLASS}>
            {service.name}
            <button
              type="button"
              onClick={() => removeService(service.id)}
              aria-label={`Remover ${service.name}`}
              className={STORES_CHIP_REMOVE_CLASS}
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className={STORES_HINT_CLASS}>Nenhum serviço escolhido ainda.</p>
    )}
  </>
);

/** Formulário de uma página só, usado para adicionar alguém à equipe. */
export const ProfessionalFormFields = ({
  isEditing,
  canGrantOwner,
  ...servicesConfig
}: TProfessionalFormFieldsConfig & TProfessionalRoleFieldConfig) => (
  <div className="grid gap-3.5">
    <ProfessionalIdentityFields isEditing={isEditing} />
    <ProfessionalRoleField canGrantOwner={canGrantOwner} />
    <ProfessionalServicesField {...servicesConfig} />
  </div>
);
