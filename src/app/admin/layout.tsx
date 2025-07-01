import { redirect } from 'next/navigation';

import { AppSidebar } from '@/components/navigation/main-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { currentClient } from '@/lib/current-user';

export default async function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await currentClient();
  if (!client) return redirect("/auth/login");
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
