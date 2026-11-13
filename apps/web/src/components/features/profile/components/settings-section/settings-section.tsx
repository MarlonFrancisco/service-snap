'use client';

import { PrivacySection } from '@/components/features/privacy';
import { Shield } from 'lucide-react';
import {
  PROFILE_SECTION_LEAD_CLASS,
  PROFILE_SECTION_TITLE_CLASS,
} from '../../profile.styles';

export const SettingsSection = () => (
  <section>
    <h2 className={PROFILE_SECTION_TITLE_CLASS}>Privacidade e dados</h2>
    <p className={PROFILE_SECTION_LEAD_CLASS}>
      Gerencie suas informações pessoais
    </p>

    <PrivacySection />

    <div className="mt-4 flex items-start gap-3.5 rounded-[14px] bg-[#F7F6FA] p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white">
        <Shield className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <h3 className="text-[15px] font-bold">Seus dados estão seguros</h3>
        <p className="mt-0.5 text-sm leading-normal text-[#5F5C6E]">
          Protegemos suas informações e nunca as compartilhamos sem sua
          permissão.
        </p>
      </div>
    </div>
  </section>
);
