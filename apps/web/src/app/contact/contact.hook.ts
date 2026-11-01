import { type ChangeEvent, type FormEvent, useState } from 'react';
import { buildContactMailto } from './contact.helpers';
import type { TContactForm } from './contact.types';

const INITIAL_FORM: TContactForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export const useContact = () => {
  const [form, setForm] = useState(INITIAL_FORM);

  const handleFieldChange =
    (field: keyof TContactForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.location.href = buildContactMailto(form);
  };

  return { form, handleFieldChange, handleSubmit };
};
