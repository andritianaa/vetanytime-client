"use client";

import {
  Bell,
  Key,
  Languages,
  PieChart,
  Shield,
  UserCircle,
} from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

/**
 * A specialized sidebar for account management pages
 */
export function AccountSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const menuItems = [
    {
      icon: UserCircle,
      label: "Profile",
      href: "/account/profile",
    },
    {
      icon: Shield,
      label: "Sessions",
      href: "/account/sessions",
    },
    {
      icon: PieChart,
      label: "Activity",
      href: "/account/activity",
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/account/notifications",
    },
    {
      icon: Key,
      label: "Security",
      href: "/account/security",
    },
    {
      icon: Languages,
      label: "Preferences",
      href: "/account/preferences",
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="font-semibold text-xl ml-4 my-4">Account Settings</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className={cn(
                      isActive(item.href) &&
                        "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    <a href={item.href}>
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 py-2 text-xs text-muted-foreground">
          Manage your account settings and preferences
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
