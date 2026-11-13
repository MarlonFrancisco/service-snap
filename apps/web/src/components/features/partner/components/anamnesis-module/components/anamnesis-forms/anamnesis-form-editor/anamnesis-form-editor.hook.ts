'use client';

import { useAnamnesisMutations } from '@/hooks/partner/use-anamnesis-mutations';
import type {
  IAnamnesisForm,
  TAnamnesisField,
} from '@/types/api/anamnesis.types';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  ANAMNESIS_MAX_FIELDS,
  ANAMNESIS_MAX_LABEL,
  ANAMNESIS_MAX_OPTION_LENGTH,
  ANAMNESIS_MAX_OPTIONS,
  createFieldId,
  describeField,
  getSaveFormErrorMessage,
  isChoiceType,
  parseOptions,
} from '../../../anamnesis-module.helpers';
import type { TAnamnesisQuestionDraft } from '../../anamnesis-question-draft';
import {
  anamnesisFormSchema,
  type TAnamnesisFormSchema,
} from './anamnesis-form-editor.schema';
import type {
  TAnamnesisFormEditorConfig,
  TAnamnesisQuestionRow,
} from './anamnesis-form-editor.types';

const EMPTY_DRAFT: TAnamnesisQuestionDraft = {
  label: '',
  type: 'boolean',
  required: false,
  optionsText: '',
};

const toFormValues = (form: IAnamnesisForm | null): TAnamnesisFormSchema => ({
  name: form?.name ?? '',
  description: form?.description ?? '',
  serviceIds: form?.serviceIds ?? [],
  isActive: form?.isActive ?? true,
  fields: form?.fields ?? [],
});

/** Campo sem `options` quando não é de escolha: a API recusaria as vazias. */
const toField = (field: TAnamnesisField): TAnamnesisField => ({
  id: field.id,
  label: field.label.trim(),
  type: field.type,
  required: field.required,
  ...(isChoiceType(field.type) && { options: field.options ?? [] }),
});

const validateDraft = (
  draft: TAnamnesisQuestionDraft,
): { error?: string; label?: string; options?: string[] } => {
  const label = draft.label.trim();
  const options = isChoiceType(draft.type)
    ? parseOptions(draft.optionsText)
    : undefined;

  if (!label) return { error: 'Escreva a pergunta' };
  if (label.length > ANAMNESIS_MAX_LABEL) {
    return { error: `Use até ${ANAMNESIS_MAX_LABEL} caracteres` };
  }
  if (options && options.length === 0) {
    return { error: 'Escreva as opções, separadas por vírgula' };
  }
  if (options && options.length > ANAMNESIS_MAX_OPTIONS) {
    return { error: `Use até ${ANAMNESIS_MAX_OPTIONS} opções` };
  }
  if (options?.some((option) => option.length > ANAMNESIS_MAX_OPTION_LENGTH)) {
    return {
      error: `Cada opção pode ter até ${ANAMNESIS_MAX_OPTION_LENGTH} caracteres`,
    };
  }

  return { label, options };
};

export const useAnamnesisFormEditor = ({
  form: savedForm,
  storeId,
  serviceOptions,
  onSaved,
}: TAnamnesisFormEditorConfig) => {
  const form = useForm<TAnamnesisFormSchema>({
    resolver: zodResolver(anamnesisFormSchema),
    defaultValues: toFormValues(savedForm),
  });
  // `id` é da pergunta: a chave da lista fica em `key`
  const { fields, append, update, remove } = useFieldArray({
    control: form.control,
    name: 'fields',
    keyName: 'key',
  });
  const [draft, setDraft] = useState<TAnamnesisQuestionDraft>(EMPTY_DRAFT);
  const [draftError, setDraftError] = useState<string>();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { createFormMutation, updateFormMutation } = useAnamnesisMutations({
    storeId,
  });
  const isSaving = createFormMutation.isPending || updateFormMutation.isPending;

  const serviceIds = form.watch('serviceIds');
  const isActive = form.watch('isActive');
  const name = form.watch('name');
  const isSubmitted = form.formState.isSubmitted;

  const handleDraftChange = useCallback(
    (changes: Partial<TAnamnesisQuestionDraft>) => {
      setDraft((current) => ({ ...current, ...changes }));
      setDraftError(undefined);
    },
    [],
  );

  const resetDraft = useCallback(() => {
    setDraft(EMPTY_DRAFT);
    setDraftError(undefined);
    setEditingIndex(null);
  }, []);

  const handleDraftSubmit = useCallback(() => {
    const { error, label, options } = validateDraft(draft);

    if (error || !label) {
      setDraftError(error);
      return;
    }

    const changes = {
      label,
      type: draft.type,
      required: draft.required,
      ...(options && { options }),
    };
    const current = editingIndex === null ? undefined : fields[editingIndex];

    if (editingIndex !== null && current) {
      update(editingIndex, { id: current.id, ...changes });
    } else {
      if (fields.length >= ANAMNESIS_MAX_FIELDS) {
        setDraftError(`Use até ${ANAMNESIS_MAX_FIELDS} perguntas`);
        return;
      }
      append({
        id: createFieldId(
          label,
          fields.map(({ id }) => id),
        ),
        ...changes,
      });
    }

    resetDraft();
    if (isSubmitted) void form.trigger('fields');
  }, [
    draft,
    editingIndex,
    fields,
    update,
    append,
    resetDraft,
    isSubmitted,
    form,
  ]);

  const handleEditQuestion = useCallback(
    (index: number) => {
      const field = fields[index];

      if (!field) return;
      setEditingIndex(index);
      setDraftError(undefined);
      setDraft({
        label: field.label,
        type: field.type,
        required: field.required,
        optionsText: (field.options ?? []).join(', '),
      });
    },
    [fields],
  );

  const handleRemoveQuestion = useCallback(
    (index: number) => {
      remove(index);
      if (editingIndex === index) resetDraft();
      else if (editingIndex !== null && editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
    },
    [remove, editingIndex, resetDraft],
  );

  const handleServiceToggle = useCallback(
    (serviceId: string) => {
      form.setValue(
        'serviceIds',
        serviceIds.includes(serviceId)
          ? serviceIds.filter((id) => id !== serviceId)
          : [...serviceIds, serviceId],
        { shouldDirty: true },
      );
    },
    [form, serviceIds],
  );

  const handleSave = (event?: FormEvent<HTMLFormElement>) => {
    // Pergunta escrita e não adicionada se perderia ao salvar
    if (draft.label.trim()) {
      event?.preventDefault();
      setDraftError(
        editingIndex === null
          ? 'Adicione a pergunta antes de salvar a ficha'
          : 'Salve a pergunta antes de salvar a ficha',
      );
      return;
    }

    void form.handleSubmit(
      (values) => {
        const payload = {
          name: values.name.trim(),
          fields: values.fields.map(toField),
          // Serviço que saiu da loja não volta para a ficha
          serviceIds: values.serviceIds.filter((id) =>
            serviceOptions.some((service) => service.id === id),
          ),
        };
        const description = values.description.trim();
        const callbacks = {
          onSuccess: (saved: IAnamnesisForm) => {
            toast.success('Ficha salva');
            onSaved(saved);
          },
          onError: (error: unknown) =>
            toast.error(getSaveFormErrorMessage(error)),
        };

        if (savedForm) {
          updateFormMutation.mutate(
            {
              formId: savedForm.id,
              changes: { ...payload, description, isActive: values.isActive },
            },
            callbacks,
          );
          return;
        }

        createFormMutation.mutate(
          { ...payload, ...(description && { description }) },
          callbacks,
        );
      },
      () => toast.error('Confira os campos destacados'),
    )(event);
  };

  const questions: TAnamnesisQuestionRow[] = fields.map((field, index) => ({
    key: field.key,
    label: field.label,
    meta: describeField(field),
    optionsLabel: field.options?.length
      ? `Opções: ${field.options.join(' · ')}`
      : null,
    isEditing: editingIndex === index,
  }));

  return {
    form,
    title: name.trim() || savedForm?.name || 'Nova ficha',
    version: savedForm?.version ?? null,
    isActive,
    onActiveChange: (value: boolean) =>
      form.setValue('isActive', value, { shouldDirty: true }),
    services: serviceOptions.map((service) => ({
      ...service,
      isSelected: serviceIds.includes(service.id),
    })),
    onServiceToggle: handleServiceToggle,
    questions,
    questionsError: form.formState.errors.fields?.message,
    onEditQuestion: handleEditQuestion,
    onRemoveQuestion: handleRemoveQuestion,
    draft: {
      draft,
      onChange: handleDraftChange,
      isEditing: editingIndex !== null,
      needsOptions: isChoiceType(draft.type),
      error: draftError,
      onSubmit: handleDraftSubmit,
      onCancelEdit: resetDraft,
    },
    versionNote: savedForm
      ? `Mudar as perguntas cria a versão ${savedForm.version + 1}. Fichas já respondidas continuam com as perguntas da época.`
      : 'Fichas já respondidas guardam as perguntas da época: mudar depois cria uma nova versão.',
    isSaving,
    handleSave,
  };
};
