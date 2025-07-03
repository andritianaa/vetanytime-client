import { redirect } from 'next/navigation';

import Navbar from '@/components/navigation/nav-bar';
import { currentClient } from '@/lib/current-user';

export default async function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await currentClient();
  if (!client) return redirect("/auth/login");

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
