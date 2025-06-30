"use client";

import { LogOut, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SessionHeaderProps {
  onRefresh: () => void;
  onLogoutAll: () => void;
}

export function SessionHeader({ onRefresh, onLogoutAll }: SessionHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mt-8 mb-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Active Sessions</h2>
        <p className="text-muted-foreground mt-1">
          Manage your active sessions across different devices and browsers
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="h-9 px-3"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update session list</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          variant="destructive"
          size="sm"
          onClick={onLogoutAll}
          className="h-9"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log out all devices
        </Button>
      </div>
    </div>
  );
}
