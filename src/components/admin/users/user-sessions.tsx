"use client";

import { Clock, Info, Laptop, Shield, Smartphone, Trash } from 'lucide-react';
import { useState } from 'react';

import { SessionDetailsDialog } from '@/components/admin/activity/session-details-dialog';
import { getRelativeTime } from '@/components/session/session-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import type { Session } from "@/types/session";

interface ClientSessionsProps {
  clientId: string;
  sessions: Session[];
}

export function ClientSessions({ clientId, sessions }: ClientSessionsProps) {
  const { toast } = useToast();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // Get device icon
  const getDeviceIcon = (deviceType: string) => {
    if (
      deviceType.toLowerCase().includes("mobile") ||
      deviceType.toLowerCase().includes("phone") ||
      deviceType.toLowerCase().includes("android") ||
      deviceType.toLowerCase().includes("ios")
    ) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Laptop className="h-4 w-4" />;
  };

  // Get session age in days
  const getSessionAge = (createdAt: Date | string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Handle terminate session
  const handleTerminateSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to terminate session");
      }

      toast({
        title: "Success",
        description: "Session terminated successfully",
      });
    } catch (error) {
      console.error("Error terminating session:", error);
      toast({
        title: "Error",
        description: "Failed to terminate session. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view session details
  const handleViewSessionDetails = (session: Session) => {
    setSelectedSession(session);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            All active sessions for this client across devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
            <div className="w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device & Browser</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="w-[120px]">Auth Type</TableHead>
                    <TableHead className="w-[180px]">Last Active</TableHead>
                    <TableHead className="w-[150px]">Created</TableHead>
                    <TableHead className="text-right w-[120px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => {
                    const relativeTime = getRelativeTime(session.lastActive);
                    const isActive = relativeTime === "active";
                    return (
                      <TableRow key={session.id}>
                        <TableCell>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="flex items-center gap-2 cursor-pointer">
                                {getDeviceIcon(session.deviceType)}
                                <div>
                                  <div>
                                    {session.deviceType}{" "}
                                    {session.deviceModel &&
                                      `(${session.deviceModel})`}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {session.browser}{" "}
                                    {session.browserVersion &&
                                      `v${session.browserVersion}`}
                                  </div>
                                </div>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">
                                  Device Details
                                </h4>
                                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                                  <span className="text-muted-foreground">
                                    Device:
                                  </span>
                                  <span>{session.deviceType}</span>
                                  {session.deviceModel && (
                                    <>
                                      <span className="text-muted-foreground">
                                        Model:
                                      </span>
                                      <span>{session.deviceModel}</span>
                                    </>
                                  )}
                                  <span className="text-muted-foreground">
                                    OS:
                                  </span>
                                  <span>{session.deviceOs || "Unknown"}</span>
                                  <span className="text-muted-foreground">
                                    Browser:
                                  </span>
                                  <span>
                                    {session.browser}{" "}
                                    {session.browserVersion &&
                                      `v${session.browserVersion}`}
                                  </span>
                                  <span className="text-muted-foreground">
                                    Session ID:
                                  </span>
                                  <span className="font-mono text-xs">
                                    {session.id}
                                  </span>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </TableCell>
                        <TableCell>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="cursor-pointer">
                                <div className="flex items-center gap-1">
                                  <span>{session.country || "Unknown"}</span>
                                  {session.country &&
                                    session.country !== "Unknown" && (
                                      <img
                                        src={`https://flagcdn.com/16x12/${session.country.toLowerCase()}.png`}
                                        width="16"
                                        height="12"
                                        alt={session.country}
                                        className="rounded-sm"
                                      />
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {session.ip}
                                </div>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">
                                  Location Details
                                </h4>
                                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                                  <span className="text-muted-foreground">
                                    IP Address:
                                  </span>
                                  <span>{session.ip}</span>
                                  <span className="text-muted-foreground">
                                    Country:
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span>{session.country || "Unknown"}</span>
                                    {session.country &&
                                      session.country !== "Unknown" && (
                                        <img
                                          src={`https://flagcdn.com/16x12/${session.country.toLowerCase()}.png`}
                                          width="16"
                                          height="12"
                                          alt={session.country}
                                          className="rounded-sm"
                                        />
                                      )}
                                  </div>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground">
                                  IP geolocation is approximate and may not
                                  reflect the client's exact location.
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{session.authType}</Badge>
                        </TableCell>
                        <TableCell>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="flex items-center gap-1.5 cursor-pointer">
                                <div
                                  className={cn(
                                    "h-2 w-2 rounded-full",
                                    isActive ? "bg-green-500" : "bg-amber-500"
                                  )}
                                />
                                <span
                                  className={cn(
                                    "font-medium",
                                    isActive ? "text-green-500" : "text-primary"
                                  )}
                                >
                                  {isActive ? "active now" : relativeTime}
                                </span>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">
                                  Activity Details
                                </h4>
                                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                                  <span className="text-muted-foreground">
                                    Last Active:
                                  </span>
                                  <span>{formatDate(session.lastActive)}</span>
                                  <span className="text-muted-foreground">
                                    Status:
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={cn(
                                        "h-2 w-2 rounded-full",
                                        isActive
                                          ? "bg-green-500"
                                          : "bg-amber-500"
                                      )}
                                    />
                                    <span>
                                      {isActive
                                        ? "Currently active"
                                        : "Inactive"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </TableCell>
                        <TableCell>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="flex items-center gap-1.5 cursor-pointer">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>
                                  {getSessionAge(session.createdAt)} days ago
                                </span>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">
                                  Session Timeline
                                </h4>
                                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                                  <span className="text-muted-foreground">
                                    Created:
                                  </span>
                                  <span>{formatDate(session.createdAt)}</span>
                                  <span className="text-muted-foreground">
                                    Age:
                                  </span>
                                  <span>
                                    {getSessionAge(session.createdAt)} days
                                  </span>
                                  <span className="text-muted-foreground">
                                    Last Active:
                                  </span>
                                  <span>{formatDate(session.lastActive)}</span>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <div className="flex justify-end gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleViewSessionDetails(session)
                                    }
                                  >
                                    <Info className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  <p>View session details</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      handleTerminateSession(session.id)
                                    }
                                    disabled={isLoading}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  <p>Terminate this session</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                No active sessions found for this client.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <SessionDetailsDialog
        session={selectedSession}
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
        formatDate={formatDate}
      />
    </div>
  );
}
