import { redirect } from 'next/navigation';

import { currentClient } from '@/lib/current-client';

export default async function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await currentClient();
  if (!client) return redirect("/auth/login");
  else if (client.onboardingCurrentStep === 1) redirect("/onboarding/meta");
  else if (client.onboardingCurrentStep === 2) redirect("/onboarding/goal");
  else if (client.onboardingCurrentStep === 3) redirect("/onboarding/ready");

  return <>{children}</>;
}
