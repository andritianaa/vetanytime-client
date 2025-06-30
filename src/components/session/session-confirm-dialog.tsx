"use client";

import { Loader2, LogOut, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';

import { isCurrentSession } from './session-utils';

import type { Session } from "@/types/session";
interface SessionConfirmDialogProps {
  session: Session | null;
  currentSessionId?: string;
  isOpen: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function SessionConfirmDialog({
  session,
  currentSessionId,
  isOpen,
  isLoading,
  onOpenChange,
  onConfirm,
}: SessionConfirmDialogProps) {
  if (!session) return null;

  const isCurrent = isCurrentSession(session.id, currentSessionId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCurrent ? (
              <>
                <LogOut className="h-5 w-5 text-destructive" />
                Log out from this device?
              </>
            ) : (
              <>
                <Trash className="h-5 w-5 text-destructive" />
                Terminate session?
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isCurrent
              ? "You will be logged out from this device and redirected to the login page."
              : `This will immediately terminate the session on ${
                  session.deviceType || "the device"
                }.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
