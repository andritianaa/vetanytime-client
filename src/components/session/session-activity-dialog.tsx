"use client";

import { ActivityManagement } from '@/components/activity/activity-management';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import type { Session } from "@/types/session";

interface SessionActivityDialogProps {
  session: Session | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionActivityDialog({
  session,
  isOpen,
  onOpenChange,
}: SessionActivityDialogProps) {
  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col p-6">
        <div className="flex-1 overflow-auto -mx-6 px-6">
          <ActivityManagement sessionId={session.id} sessionInfo={session} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
