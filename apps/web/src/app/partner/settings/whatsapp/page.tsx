import {
  WhatsappSettingsModule,
  PlanFeatureGate,
} from '@/components/features/partner';

export default function WhatsappSettingsPage() {
  return (
    <PlanFeatureGate module="whatsappIntegration">
      <WhatsappSettingsModule />
    </PlanFeatureGate>
  );
}
