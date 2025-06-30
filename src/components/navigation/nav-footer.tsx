import { LifeBuoy, Send } from 'lucide-react';
import * as React from 'react';

import { TaskForm } from '@/components/task/task-dialog';
import {
    SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem
} from '@/components/ui/sidebar';

export function NavFooter({
  ...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm">
              <a href="#">
                <LifeBuoy />
                <span>Support</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <TaskForm>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="sm" className="cursor-pointer">
                <p>
                  <Send />
                  <span>Feedback</span>
                </p>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </TaskForm>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
