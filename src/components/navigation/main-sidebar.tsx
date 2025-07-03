"use client";

import { Frame, Hospital, Map, PawPrint, PieChart, UserCog } from 'lucide-react';
import * as React from 'react';

import { Logo } from '@/components/logo';
import {
    Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar';

import { NavFooter } from './nav-footer';
import { NavMain } from './nav-main';
import { NavClient } from './nav-user';

const data = {
  navMain: [
    {
      title: "Administration",
      url: "/admin/users",
      icon: UserCog,
      isActive: true,
      items: [
        {
          title: "Clients",
          url: "/admin/users",
        },
        {
          title: "Contenus",
          url: "/admin/contenu",
        },
        {
          title: "Sessions",
          url: "/admin/sessions",
        },
        {
          title: "Activités",
          url: "/admin/activity",
        },
        {
          title: "Erreurs",
          url: "/admin/errors",
        },
      ],
    },
    {
      title: "Veterinaires",
      url: "#",
      icon: Hospital,
      isActive: true,
      items: [
        {
          title: "Liste",
          url: "#",
        },
        {
          title: "Nouveaux",
          url: "#",
        },
      ],
    },
    {
      title: "Animaux",
      url: "#",
      icon: PawPrint,
      isActive: true,
      items: [
        {
          title: "Races",
          url: "#",
        },
        {
          title: "Liste",
          url: "#",
        },
        {
          title: "Nouveaux",
          url: "#",
        },
      ],
    },
    // {
    //   title: "Documentation",
    //   url: "#",
    //   icon: BookOpen,
    //   items: [
    //     {
    //       title: "Introduction",
    //       url: "#",
    //     },
    //     {
    //       title: "Get Started",
    //       url: "#",
    //     },
    //     {
    //       title: "Tutorials",
    //       url: "#",
    //     },
    //     {
    //       title: "Changelog",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "General",
    //       url: "#",
    //     },
    //     {
    //       title: "Team",
    //       url: "#",
    //     },
    //     {
    //       title: "Billing",
    //       url: "#",
    //     },
    //     {
    //       title: "Limits",
    //       url: "#",
    //     },
    //   ],
    // },
  ],

  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" collapsible={"icon"} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg ">
                  <Logo className="size-4" color="white" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Vetanytime</span>
                  <span className="truncate text-xs">Administration</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavSecondary projects={data.projects} /> */}
        <NavFooter className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavClient />
      </SidebarFooter>
    </Sidebar>
  );
}
