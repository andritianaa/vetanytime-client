"use client";

import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SessionsTitleSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleFilterChange: () => void;
  refreshData: () => void;
}

export function SessionsTitleSearch({
  searchQuery,
  setSearchQuery,
  handleFilterChange,
  refreshData,
}: SessionsTitleSearchProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Active Client Sessions
        </h2>
        <p className="text-muted-foreground">
          Monitor all active sessions across your platform
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleFilterChange();
          }}
          className="w-64"
        />
        <Button variant="outline" size="icon" onClick={refreshData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
