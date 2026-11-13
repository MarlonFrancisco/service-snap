'use client';

import { useAnamnesisFormsQuery } from '@/hooks/partner/use-anamnesis-query';
import type { IAnamnesisForm } from '@/types/api/anamnesis.types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAnamnesisAccess } from '../../anamnesis-module.hook';
import type {
  TAnamnesisFormListItem,
  TAnamnesisFormSelection,
} from './anamnesis-forms.types';

const NEW_FORM = 'new';

/** Tela de fichas: lista da loja e a ficha aberta no editor. */
export const useAnamnesisForms = () => {
  const { storeId, serviceOptions, memberRole, isManagement, storeState } =
    useAnamnesisAccess();
  const [selection, setSelection] = useState<TAnamnesisFormSelection>(null);

  // Só gestão edita; o papel chega com a lista de lojas
  const hasNoAccess = storeState === 'ready' && !!memberRole && !isManagement;
  const { forms, isLoadingForms, isFormsError, isFetchingForms, refetchForms } =
    useAnamnesisFormsQuery({
      storeId,
      enabled: storeState === 'ready' && !hasNoAccess,
    });

  // Ficha de outra loja não vale aqui
  useEffect(() => {
    setSelection(null);
  }, [storeId]);

  const selectedId = selection ?? forms[0]?.id ?? NEW_FORM;
  const selectedForm =
    selectedId === NEW_FORM
      ? null
      : forms.find(({ id }) => id === selectedId) ?? null;

  const items = useMemo<TAnamnesisFormListItem[]>(
    () =>
      forms.map((form) => ({
        id: form.id,
        name: form.name,
        meta: `Versão ${form.version} · ${form.fields.length} ${form.fields.length === 1 ? 'pergunta' : 'perguntas'}`,
        isActive: form.isActive,
        isSelected: form.id === selectedForm?.id,
      })),
    [forms, selectedForm?.id],
  );

  const handleSaved = useCallback((form: IAnamnesisForm) => {
    setSelection(form.id);
  }, []);

  return {
    storeId,
    storeState,
    hasNoAccess,
    serviceOptions,
    items,
    selectedForm,
    isCreating: !selectedForm,
    // Salvar troca o `updatedAt`: o editor recomeça com a versão nova
    editorKey: selectedForm
      ? `${selectedForm.id}-${selectedForm.updatedAt}`
      : NEW_FORM,
    isLoading: isLoadingForms,
    isError: isFormsError,
    isRetrying: isFetchingForms,
    handleRetry: () => void refetchForms(),
    handleSelect: setSelection,
    handleNewForm: () => setSelection(NEW_FORM),
    handleSaved,
  };
};
