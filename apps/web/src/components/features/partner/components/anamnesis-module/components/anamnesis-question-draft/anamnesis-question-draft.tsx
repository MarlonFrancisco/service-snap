import {
  cn,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { Plus } from 'lucide-react';
import { ANAMNESIS_FIELD_TYPES } from '@/types/api/anamnesis.types';
import type { TAnamnesisFieldType } from '@/types/api/anamnesis.types';
import { PARTNER_PORTAL_CLASS } from '../../../../partner.styles';
import {
  CUSTOMERS_BUTTON_CLASS,
  CUSTOMERS_BUTTON_ICON_CLASS,
  CUSTOMERS_SMALL_BUTTON_CLASS,
} from '../../../customers-module/customers-module.styles';
import {
  ANAMNESIS_FIELD_TYPE_LABELS,
  ANAMNESIS_MAX_LABEL,
} from '../../anamnesis-module.helpers';
import {
  ANAMNESIS_CHECK_INPUT_CLASS,
  ANAMNESIS_ERROR_CLASS,
  ANAMNESIS_FIELD_CLASS,
  ANAMNESIS_HINT_CLASS,
  ANAMNESIS_LABEL_CLASS,
  ANAMNESIS_SELECT_CLASS,
} from '../../anamnesis-module.styles';
import type { TAnamnesisQuestionDraftConfig } from './anamnesis-question-draft.types';

/** "Nova pergunta": texto, tipo, obrigatória e, se for escolha, as opções. */
export const AnamnesisQuestionDraft = ({
  draft,
  onChange,
  isEditing,
  needsOptions,
  error,
  onSubmit,
  onCancelEdit,
}: TAnamnesisQuestionDraftConfig) => (
  <div
    role="group"
    aria-labelledby="anamnesis-draft-title"
    className="grid gap-3.5"
  >
    <span id="anamnesis-draft-title" className="sr-only">
      {isEditing ? 'Editar pergunta' : 'Nova pergunta'}
    </span>
    <div className="grid items-end gap-3.5 md:grid-cols-[2fr_1fr_auto]">
      <label className={ANAMNESIS_LABEL_CLASS}>
        {isEditing ? 'Editar pergunta' : 'Nova pergunta'}
        <Input
          value={draft.label}
          onChange={(event) => onChange({ label: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onSubmit();
            }
          }}
          maxLength={ANAMNESIS_MAX_LABEL}
          placeholder="Ex.: Tem diabetes?"
          aria-invalid={!!error || undefined}
          aria-describedby={error ? 'anamnesis-draft-error' : undefined}
          className={ANAMNESIS_FIELD_CLASS}
        />
      </label>
      <div className="grid content-start gap-1.5">
        <span id="anamnesis-draft-type-label" className="text-sm font-semibold">
          Tipo
        </span>
        <Select
          value={draft.type}
          onValueChange={(value) =>
            onChange({ type: value as TAnamnesisFieldType })
          }
        >
          <SelectTrigger
            aria-labelledby="anamnesis-draft-type-label"
            className={ANAMNESIS_SELECT_CLASS}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={PARTNER_PORTAL_CLASS}>
            {ANAMNESIS_FIELD_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {ANAMNESIS_FIELD_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <label className="flex min-h-[50px] cursor-pointer items-center gap-2.5 text-sm font-medium">
        <input
          type="checkbox"
          checked={draft.required}
          onChange={(event) => onChange({ required: event.target.checked })}
          className={cn(ANAMNESIS_CHECK_INPUT_CLASS, 'mt-0')}
        />
        Obrigatória
      </label>
    </div>

    {needsOptions ? (
      <label className={ANAMNESIS_LABEL_CLASS}>
        <span>
          Opções{' '}
          <span className={ANAMNESIS_HINT_CLASS}>Separe por vírgula</span>
        </span>
        <Input
          value={draft.optionsText}
          onChange={(event) => onChange({ optionsText: event.target.value })}
          placeholder="Ex.: Anticoagulante, Isotretinoína, Outro"
          className={ANAMNESIS_FIELD_CLASS}
        />
      </label>
    ) : null}

    {error ? (
      <p
        id="anamnesis-draft-error"
        role="alert"
        className={ANAMNESIS_ERROR_CLASS}
      >
        {error}
      </p>
    ) : null}

    <div className="flex flex-wrap gap-2.5">
      <button
        type="button"
        onClick={onSubmit}
        className={cn(CUSTOMERS_BUTTON_CLASS, CUSTOMERS_SMALL_BUTTON_CLASS)}
      >
        {isEditing ? null : (
          <Plus aria-hidden="true" className={CUSTOMERS_BUTTON_ICON_CLASS} />
        )}
        {isEditing ? 'Salvar pergunta' : 'Adicionar pergunta'}
      </button>
      {isEditing ? (
        <button
          type="button"
          onClick={onCancelEdit}
          className={cn(CUSTOMERS_BUTTON_CLASS, CUSTOMERS_SMALL_BUTTON_CLASS)}
        >
          Cancelar edição
        </button>
      ) : null}
    </div>
  </div>
);
