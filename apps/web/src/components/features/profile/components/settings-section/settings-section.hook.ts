import { useUsersMutations } from '@/hooks/use-mutations/use-users-mutations';
import { useAnalytics } from '@/providers/analytics.provider';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

export const useSettingsSection = () => {
  const { deleteUser, isDeletingUser } = useUsersMutations();
  const [isOpenDisabledAccountAlert, setIsOpenDisabledAccountAlert] =
    useState(false);
  const router = useRouter();
  const analytics = useAnalytics();

  const handleDeleteAccount = useCallback(() => {
    deleteUser(undefined, {
      onSuccess: () => {
        analytics.track('account_deleted', {});
        analytics.reset();
        router.push('/');
      },
      onSettled: () => {
        setIsOpenDisabledAccountAlert(false);
      },
    });
  }, [analytics, deleteUser, router]);

  return {
    handleDeleteAccount,
    setIsOpenDisabledAccountAlert,
    isOpenDisabledAccountAlert,
    isDeletingUser,
  };
};
