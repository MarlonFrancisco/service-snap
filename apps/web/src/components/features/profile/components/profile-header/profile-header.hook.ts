import { useUsersMutations } from '@/hooks/use-mutations/use-users-mutations';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

const MEMBER_SINCE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export const useProfileHeader = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analytics = useAnalytics();

  // API hooks
  const { user, isPendingUser } = useUserQuery();

  const { updateAvatar, isUpdatingAvatar } = useUsersMutations();

  // Handlers
  const handlePhotoUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        const base64 = fileReader.result as string;
        updateAvatar(base64, {
          onSuccess: () => analytics.track('avatar_updated', {}),
          onError: () => analytics.track('avatar_update_failed', {}),
        });
      };
      fileReader.onerror = () => {
        toast.error('Erro ao ler arquivo');
        analytics.track('avatar_update_failed', {});
      };
    },
    [analytics, updateAvatar],
  );

  const handleOpenFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    // User data
    user,
    isPendingUser,
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    initials: user
      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
      : '',
    avatarUrl: user?.avatar
      ? `${process.env.NEXT_PUBLIC_CDN_URL}${user.avatar}`
      : undefined,
    memberSince: user
      ? MEMBER_SINCE_FORMATTER.format(new Date(user.createdAt))
      : '',

    // Photo upload state
    isUpdatingAvatar,
    fileInputRef,

    // Handlers
    handlePhotoUpload,
    handleOpenFilePicker,
  };
};
