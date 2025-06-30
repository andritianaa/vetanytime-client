"use client";

import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { Session } from "@/types/session";
interface ActivityHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleFilterChange: () => void;
  mutate: () => void;
  sessionInfo?: Session;
}

export function ActivityHeader({
  searchQuery,
  setSearchQuery,
  handleFilterChange,
  mutate,
  sessionInfo,
}: ActivityHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0 mt-2 mb-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {sessionInfo
            ? `Session Activities - ${
                sessionInfo.browser || "Unknown browser"
              } on ${sessionInfo.deviceType}`
            : "Account Activity"}
        </h2>
        <p className="text-muted-foreground">
          {sessionInfo
            ? `Viewing activities for this session (${sessionInfo.ip})`
            : "View your recent account activities and security events"}
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
        <Button variant="outline" size="icon" onClick={() => mutate()}>
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
