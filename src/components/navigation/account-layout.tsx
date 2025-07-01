import { redirect } from 'next/navigation';

import { AccountSidebar } from '@/components/navigation/account-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { currentClient } from '@/lib/current-user';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await currentClient();

  // If not authenticated, redirect to login
  if (!client) {
    return redirect("/auth/login");
  }

  return (
    <SidebarProvider>
      <AccountSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
