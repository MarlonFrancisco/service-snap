'use client';
import { useGoogleAuth } from './google-auth.hook';

export const GoogleAuth = () => {
  const { containerRef } = useGoogleAuth();

  return (
    <div className="flex min-h-[54px] w-full items-center justify-center">
      <div
        ref={containerRef}
        id="google-sign-in-button"
        className="flex w-full justify-center"
      />
    </div>
  );
};
