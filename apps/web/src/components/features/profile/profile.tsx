'use client';

import { ReferralShareCard } from '@/components/features/referral/referral-share-card';
import { Footer, Header, MobileTabBar } from '@/components/layout';
import { BookingsSection } from './components/bookings-section';
import { FavoritesSection } from './components/favorites-section';
import { PersonalDataSection } from './components/personal-data-section';
import { ProfileHeader } from './components/profile-header';
import { ProfileTabs } from './components/profile-tabs';
import { SettingsSection } from './components/settings-section';
import { WaitlistSection } from './components/waitlist-section';
import { useProfile } from './profile.hook';
import { ProfileSkeleton } from './profile.skeleton';
import type { TProfilePageConfig } from './profile.types';

export const Profile = ({ initialTab }: TProfilePageConfig) => {
  const { activeTab, isPendingUser, bookingsCount, favoritesCount } =
    useProfile(initialTab);

  if (isPendingUser) {
    return <ProfileSkeleton />;
  }

  return (
    <Header>
      <main className="mx-auto w-full max-w-[82.5rem] px-5 max-md:min-h-[calc(100dvh-9rem)] md:px-10">
        <ProfileHeader />

        <ProfileTabs
          activeTab={activeTab}
          bookingsCount={bookingsCount}
          favoritesCount={favoritesCount}
        />

        <div className="grid grid-cols-1 items-start gap-9 pt-6 pb-8 md:gap-10 md:pt-8 md:pb-0 min-[1021px]:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            {activeTab === 'bookings' && (
              <>
                <BookingsSection />
                <WaitlistSection />
              </>
            )}
            {activeTab === 'favorites' && <FavoritesSection />}
            {activeTab === 'settings' && <SettingsSection />}
            {activeTab === 'personal' && <PersonalDataSection />}
          </div>

          <ReferralShareCard variant="client" />
        </div>
      </main>

      <Footer compact />
      <MobileTabBar />
    </Header>
  );
};
