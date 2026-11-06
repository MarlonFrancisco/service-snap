import { useAnalytics } from '@/providers/analytics.provider';
import { type ChangeEvent, type FormEvent, useCallback, useState } from 'react';
import { buildContactMailto } from './contact.helpers';
import type { TContactForm } from './contact.types';

const INITIAL_FORM: TContactForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export const useContact = () => {
  const analytics = useAnalytics();
  const [form, setForm] = useState(INITIAL_FORM);

  const handleFieldChange =
    (field: keyof TContactForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Só o formato do contato: nome, e-mail e texto nunca vão para o analytics.
    analytics.track('generate_lead', {
      method: 'mailto',
      has_subject: Boolean(form.subject.trim()),
      message_length: form.message.trim().length,
    });
    window.location.href = buildContactMailto(form);
  };

  const handleEmailClick = useCallback(() => {
    analytics.track('contact_email_clicked', { page: 'contact' });
  }, [analytics]);

  const handleSocialClick = useCallback(
    (network: string) => {
      analytics.track('social_link_clicked', { network, page: 'contact' });
    },
    [analytics],
  );

  return {
    form,
    handleFieldChange,
    handleSubmit,
    handleEmailClick,
    handleSocialClick,
  };
};
