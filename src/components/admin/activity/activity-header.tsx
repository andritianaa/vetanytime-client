"use client";

import { Search } from 'lucide-react';

import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface ActivityHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleFilterChange: () => void;
  onRefresh: () => void;
}

export function ActivityHeader({
  searchQuery,
  setSearchQuery,
  handleFilterChange,
  onRefresh,
}: ActivityHeaderProps) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Admin Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Client Activity</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Client Activity Log
          </h2>
          <p className="text-muted-foreground">
            Monitor and analyze client actions across the platform
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleFilterChange();
            }}
            className="w-64"
          />
          <Button variant="outline" size="icon" onClick={onRefresh}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
