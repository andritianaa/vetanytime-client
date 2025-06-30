import { redirect } from 'next/navigation';

import { OnboardingSidebar } from '@/components/onboarding/sidebar';
import { currentClient } from '@/lib/current-client';

export default async function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await currentClient();
  if (!client) return redirect("/auth/login");
  else if (client.onboarding == 1) return redirect("/onboarding/meta");
  else if (client.onboarding == 2) return redirect("/onboarding/goal");
  else if (client.onboarding == 3) return redirect("/onboarding/ready");
  else if (client.onboarding == 4) return redirect("/explore");
  return (
    <div className="flex h-screen bg-white">
      <OnboardingSidebar currentStep={client.onboarding} />
      <div className="flex w-full">{children}</div>
    </div>
  );
}
