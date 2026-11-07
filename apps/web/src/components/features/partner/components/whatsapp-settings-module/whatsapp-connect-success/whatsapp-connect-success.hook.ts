import { useWhatsappMutation } from '@/hooks/partner';
import { useState, type FormEvent } from 'react';

export const useWhatsappConnectSuccess = (storeId: string) => {
  const { sendTest, isSendTestPending } = useWhatsappMutation();
  const [testPhone, setTestPhone] = useState('');

  const handleSendTest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const to = testPhone.trim();
    if (!to) return;
    sendTest({ storeId, payload: { to } });
  };

  return { testPhone, setTestPhone, handleSendTest, isSendTestPending };
};
