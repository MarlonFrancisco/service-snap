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
import { STAFF_ROLES } from '../../utils/stores-module.constants';
import type { TProfessionalFormFieldsConfig } from './add-professional-modal.types';
import type { TProfessionalFormSchema } from './add-professional.schema';

const SERVICES_SELECT_ID = 'professional-services';
const ASSIGNABLE_ROLES = ['manager', 'professional'] as const;

export const ProfessionalFormFields = ({
  isEditing,
  services,
  selectedServices,
  addService,
  removeService,
}: TProfessionalFormFieldsConfig) => {
  const form = useFormContext<TProfessionalFormSchema>();

  return (
    <div className="grid gap-3.5">
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
                disabled={isEditing}
                placeholder="email@exemplo.com"
                className={STORES_FIELD_CLASS}
              />
            </FormControl>
            <FormDescription className={STORES_HINT_CLASS}>
              {isEditing
                ? 'O e-mail identifica a conta e não pode ser alterado.'
                : 'O usuário precisa ter cadastro na plataforma.'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <fieldset className={cn(STORES_FIELDSET_CLASS, 'gap-2')}>
            <legend className="mb-2 p-0 text-sm font-semibold">Papel *</legend>
            {ASSIGNABLE_ROLES.map((role) => (
              <label
                key={role}
                className="flex cursor-pointer items-start gap-2.5 rounded-[14px] border border-[#E3E1EA] px-3.5 py-3 text-sm font-semibold"
              >
                <input
                  type="radio"
                  name={field.name}
                  value={role}
                  checked={field.value === role}
                  onChange={() => field.onChange(role)}
                  className={cn(
                    'mt-0.5 size-5 shrink-0 accent-[#0B0B0F]',
                    PARTNER_FOCUS_CLASS,
                  )}
                />
                <span>
                  {STAFF_ROLES[role].label}
                  <span className="block text-[13px] font-medium text-[#5F5C6E]">
                    {STAFF_ROLES[role].description}
                  </span>
                </span>
              </label>
            ))}
            {field.value === 'owner' ? (
              <p className={STORES_HINT_CLASS}>
                Papel atual: {STAFF_ROLES.owner.label}.
              </p>
            ) : null}
          </fieldset>
        )}
      />

      <div className="grid gap-1.5">
        <Label htmlFor={SERVICES_SELECT_ID} className={STORES_LABEL_CLASS}>
          Serviços do profissional
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
      ) : null}
    </div>
  );
};
