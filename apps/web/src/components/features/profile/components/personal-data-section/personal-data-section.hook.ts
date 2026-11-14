'use client';

import { useUsersMutations } from '@/hooks/use-mutations/use-users-mutations';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { formatProfilePhone } from './personal-data-section.helpers';
import { PersonalNameSchema } from './personal-data-section.schema';
import type { TPersonalNameForm } from './personal-data-section.types';

export const usePersonalDataSection = () => {
  const { user } = useUserQuery();
  const { updateProfile, isUpdatingProfile } = useUsersMutations();

  const values = useMemo<TPersonalNameForm>(
    () => ({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    }),
    [user?.firstName, user?.lastName],
  );

  // `values` acompanha o cache: depois de salvar, o formulário volta a "limpo"
  const form = useForm<TPersonalNameForm>({
    resolver: zodResolver(PersonalNameSchema),
    values,
  });

  const handleSaveName = form.handleSubmit((data) => {
    updateProfile(data);
  });

  return {
    register: form.register,
    errors: form.formState.errors,
    isNameDirty: form.formState.isDirty,
    isUpdatingProfile,
    handleSaveName,
    telephone: formatProfilePhone(user?.telephone),
  };
};
