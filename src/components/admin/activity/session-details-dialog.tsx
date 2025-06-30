"use client";

import { CalendarClock, Globe, Info, Laptop } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import type { Session } from "@/types/session";

interface SessionDetailsDialogProps {
  session: Session | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  formatDate: (date: Date | string) => string;
}

export function SessionDetailsDialog({
  session,
  isOpen,
  setIsOpen,
  formatDate,
}: SessionDetailsDialogProps) {
  if (!session) return null;

  // Calculate session duration
  const getSessionDuration = () => {
    const created = new Date(session.createdAt);
    const lastActive = new Date(session.lastActive);
    const diffTime = Math.abs(lastActive.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h ${diffMinutes}m`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Info className="h-5 w-5" />
            Session Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          <div className="space-y-6 p-2">
            {/* Session Overview */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-muted-foreground" />
                Session Overview
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="font-medium">Session ID</div>
                  <div className="font-mono text-xs break-all">
                    {session.id}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Auth Type</div>
                  <div>{session.authType}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Created</div>
                  <div>{formatDate(session.createdAt)}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Last Active</div>
                  <div>{formatDate(session.lastActive)}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Session Duration</div>
                  <div>{getSessionDuration()}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Status</div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        new Date(session.lastActive).getTime() >
                        Date.now() - 5 * 60 * 1000
                          ? "bg-green-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <span>
                      {new Date(session.lastActive).getTime() >
                      Date.now() - 5 * 60 * 1000
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Device Information */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Laptop className="h-5 w-5 text-muted-foreground" />
                Device Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="font-medium">Device Type</div>
                  <div>{session.deviceType}</div>
                </div>
                {session.deviceModel && (
                  <div className="space-y-1">
                    <div className="font-medium">Device Model</div>
                    <div>{session.deviceModel}</div>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="font-medium">Operating System</div>
                  <div>{session.deviceOs || "Unknown"}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Browser</div>
                  <div>
                    {session.browser || "Unknown"}{" "}
                    {session.browserVersion && `v${session.browserVersion}`}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Location Information */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                Location Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="font-medium">IP Address</div>
                  <div>{session.ip}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Country</div>
                  <div className="flex items-center gap-2">
                    {session.country && session.country !== "Unknown" && (
                      <img
                        src={`https://flagcdn.com/16x12/${session.country.toLowerCase()}.png`}
                        width="16"
                        height="12"
                        alt={session.country}
                        className="rounded-sm"
                      />
                    )}
                    <span>{session.country || "Unknown"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
