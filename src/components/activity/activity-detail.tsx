import { Badge } from '@/components/ui/badge';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { Activity } from "@/types/activity";

interface ActivityDetailProps {
  activity: Activity | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  formatDate: (date: Date | string) => string;
  getActionName: (action: string) => string;
  getActionDescription: (action: string) => string;
  getActionBadgeVariant: (action: string) => string;
}

export function ActivityDetail({
  activity,
  isOpen,
  setIsOpen,
  formatDate,
  getActionName,
  getActionDescription,
  getActionBadgeVariant,
}: ActivityDetailProps) {
  if (!activity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Activity Details</DialogTitle>
          <DialogDescription>
            Detailed information about this activity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Badge
                variant={
                  getActionBadgeVariant(activity.action) as
                    | "default"
                    | "secondary"
                    | "destructive"
                    | "outline"
                    | null
                    | undefined
                }
              >
                {getActionName(activity.action)}
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {getActionDescription(activity.action)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date and Time</Label>
              <p className="text-sm">{formatDate(activity.createdAt)}</p>
            </div>
            {activity.session && (
              <div>
                <Label>Session</Label>
                <p className="text-sm">
                  {activity.session.deviceType}{" "}
                  {activity.session.browser && `- ${activity.session.browser}`}
                </p>
              </div>
            )}
          </div>

          {activity.metadata && (
            <div>
              <Label>Additional Details</Label>
              <ScrollArea className="h-[200px] rounded-md border p-4 mt-1">
                <pre className="text-xs w-full">
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
