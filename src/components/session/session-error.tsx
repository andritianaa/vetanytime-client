"use client";

import { RefreshCw, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface SessionErrorProps {
  message?: string;
  onRetry: () => void;
}

export function SessionError({ message, onRetry }: SessionErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8 text-center">
      <div className="rounded-full bg-red-100 p-3/20">
        <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-xl font-medium">Failed to load sessions</h3>
      <p className="text-muted-foreground max-w-md">
        {message ||
          "An unexpected error occurred. Please try refreshing the page."}
      </p>
      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
