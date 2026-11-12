import { CustomerProfile } from '@/components/features/partner/components/customers-module';

// O App Router exige export default na página
export default async function PartnerCustomerPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return <CustomerProfile userId={userId} />;
}
