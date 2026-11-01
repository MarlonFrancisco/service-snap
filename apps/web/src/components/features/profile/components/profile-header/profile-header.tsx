'use client';

import { Avatar, AvatarFallback, AvatarImage, cn } from '@repo/ui';
import { Camera } from 'lucide-react';
import { PROFILE_FOCUS_CLASS } from '../../profile.styles';
import { useProfileHeader } from './profile-header.hook';

export const ProfileHeader = () => {
  const {
    user,
    fullName,
    initials,
    avatarUrl,
    memberSince,
    isUpdatingAvatar,
    fileInputRef,
    handlePhotoUpload,
    handleOpenFilePicker,
  } = useProfileHeader();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3.5 pt-2 md:gap-5 md:pt-6">
      <div className="relative size-[68px] shrink-0 md:size-[88px]">
        <Avatar className="size-full">
          <AvatarImage src={avatarUrl} alt="" />
          <AvatarFallback className="bg-[#0B0B0F] text-xl font-extrabold text-white md:text-[26px]">
            {initials}
          </AvatarFallback>
        </Avatar>

        <button
          type="button"
          onClick={handleOpenFilePicker}
          disabled={isUpdatingAvatar}
          aria-label="Alterar foto do perfil"
          aria-busy={isUpdatingAvatar}
          className={cn(
            'absolute -right-2.5 -bottom-2.5 grid size-11 place-items-center rounded-full border-[3px] border-white bg-[#F4F3F7] text-[#0B0B0F] transition-colors hover:bg-[#EBE9F0] disabled:cursor-not-allowed disabled:opacity-50 md:-right-1.5 md:-bottom-1.5',
            PROFILE_FOCUS_CLASS,
          )}
        >
          {isUpdatingAvatar ? (
            <span
              aria-hidden
              className="size-[18px] animate-spin rounded-full border-2 border-[#0B0B0F] border-t-transparent"
            />
          ) : (
            <Camera className="size-[18px]" strokeWidth={2} aria-hidden />
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </div>

      <div className="min-w-0 pl-1.5 md:pl-0">
        <h1 className="text-[22px] font-extrabold tracking-[-0.025em] md:text-[32px] md:tracking-[-0.03em]">
          {fullName}
        </h1>
        <p className="mt-0.5 text-[13px] text-[#5F5C6E] [overflow-wrap:anywhere] md:mt-1 md:text-sm">
          Membro desde {memberSince}
          {user.email && (
            <span className="hidden md:inline"> · {user.email}</span>
          )}
        </p>
      </div>
    </div>
  );
};
