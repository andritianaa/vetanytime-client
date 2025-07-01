import { redirect } from 'next/navigation';

import { currentClient } from '@/lib/current-user';

export default async function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await currentClient();
  if (!client) return redirect("/auth/login");

  return <>{children}</>;
}
