import {
  WhatsappSettings,
  PlanFeatureGate,
} from '@/components/features/partner';

export default function WhatsappSettingsPage() {
  return (
    <PlanFeatureGate module="whatsappReminders">
      <WhatsappSettings />
    </PlanFeatureGate>
  );
}
