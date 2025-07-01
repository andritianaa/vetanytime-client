"use client";

import { RefreshCw, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ClientsTitleSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleFilterChange: () => void;
  refreshData: () => void;
}

export function ClientsTitleSearch({
  searchQuery,
  setSearchQuery,
  handleFilterChange,
  refreshData,
}: ClientsTitleSearchProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0 px-6 pt-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Client Management</h2>
        <p className="text-muted-foreground">
          Manage clients, permissions, and account settings
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search clients..."
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
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>
    </div>
  );
}
