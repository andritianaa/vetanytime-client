"use client";

import { Badge } from '@/components/ui/badge';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { Activity } from "@/types/activity";
import type { Client } from "@/types/schema";
import type { Actions } from "@prisma/client";

interface ActivityDetailsDialogProps {
  activity: (Activity & { client: Client }) | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  getActionBadgeVariant: (
    action: Actions
  ) => "default" | "secondary" | "destructive" | "outline" | null | undefined;
  getActionName: (action: string) => string;
  formatDate: (date: Date | string) => string;
}

export function ActivityDetailsDialog({
  activity,
  isOpen,
  setIsOpen,
  getActionBadgeVariant,
  getActionName,
  formatDate,
}: ActivityDetailsDialogProps) {
  if (!activity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Activity Details</DialogTitle>
          <DialogDescription>
            Detailed information about this client activity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Badge variant={getActionBadgeVariant(activity.action)}>
                {getActionName(activity.action)}
              </Badge>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date and Time</Label>
              <p className="text-sm">{formatDate(activity.createdAt)}</p>
            </div>
            <div>
              <Label>Client</Label>
              <p className="text-sm">
                {activity.client.username || activity.client.email}
              </p>
            </div>
          </div>

          {activity.session && (
            <div>
              <Label>Session Information</Label>
              <div className="text-sm mt-1 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Device:</span>
                  <span>
                    {activity.session.deviceType} {activity.session.deviceOs}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Browser:</span>
                  <span>{activity.session.browser || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IP Address:</span>
                  <span>{activity.session.ip}</span>
                </div>
                {activity.session.country && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{activity.session.country}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activity.metadata && (
            <div>
              <Label>Additional Details</Label>
              <ScrollArea className="h-[200px] rounded-md border p-4 mt-1">
                <pre className="text-xs">
                  {JSON.stringify(activity.metadata, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
