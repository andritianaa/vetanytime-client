"use client";

import { Bell, ChevronsUpDown, CreditCard, Lock, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useClient } from '@/hooks/use-user';

export function NavClient({
  variant = "full",
}: {
  variant?: "full" | "avatar";
}) {
  const { client, isLoading } = useClient();

  if (isLoading && !client) {
    return (
      <Skeleton className={`h-12 ${variant === "full" ? "w-full" : "w-12"}`} />
    );
  }
  if (client) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {variant === "full" ? (
            <div className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left  outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8  [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-12 text-sm group-data-[collapsible=icon]:!p-0">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={client.image} alt={client.username} />
                <AvatarFallback className="rounded-lg">
                  {client.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {client.username}
                </span>
                <span className="truncate text-xs">{client.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </div>
          ) : (
            <Button variant={"outline"} className="size-10">
              <Avatar className="size-6 rounded-full">
                <AvatarImage
                  src={client.image || "/placeholder.svg"}
                  alt={client.username}
                />
                <AvatarFallback className="rounded-full">
                  {client.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={client.image} alt={client.username} />
                <AvatarFallback className="rounded-lg">
                  {" "}
                  {client.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {client.username}
                </span>
                <span className="truncate text-xs">{client.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href={"/account/security"}>
              <DropdownMenuItem>
                <Lock />
                Security
              </DropdownMenuItem>
            </Link>
            <Link href={"/account/settings"}>
              <DropdownMenuItem>
                <Settings />
                Settings
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <CreditCard />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell />
              Notifications
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-500 hover:text-red-600 dark:text-red-400">
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return null;
}
