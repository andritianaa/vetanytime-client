"use client";

import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';

import type { Client } from "@/types/schema";
import type { Session } from "@/types/session";

interface TerminateSessionDialogProps {
  session: (Session & { user: Client }) | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function TerminateSessionDialog({
  session,
  isOpen,
  setIsOpen,
  onConfirm,
  isLoading,
}: TerminateSessionDialogProps) {
  if (!session) return null;

  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Terminate Client Session?</DialogTitle>
          <DialogDescription>
            This will immediately terminate the selected session for client{" "}
            <strong>{session.user.username || session.user.email}</strong>. They
            will need to log in again on that device.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Device:</span>
              <span className="text-sm">
                {session.deviceType} {session.deviceOs}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Browser:</span>
              <span className="text-sm">{session.browser || "Unknown"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Location:</span>
              <span className="text-sm">
                {session.country || "Unknown"} ({session.ip})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Last active:
              </span>
              <span className="text-sm">{formatDate(session.lastActive)}</span>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Terminate Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
