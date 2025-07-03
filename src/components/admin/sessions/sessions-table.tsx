"use client";

import { Clock, Fingerprint, Laptop, Shield, Smartphone, Trash } from 'lucide-react';

import { getRelativeTime } from '@/components/session/session-utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import type { Client } from "@/types/schema";
import type { Session } from "@/types/session";

interface SessionsTableProps {
  sessions: Array<Session & { user: Client }> | undefined;
  isLoading: boolean;
  onTerminateSession: (session: Session & { user: Client }) => void;
}

export function SessionsTable({
  sessions,
  isLoading,
  onTerminateSession,
}: SessionsTableProps) {
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

  // Get auth type badge color
  const getAuthTypeBadge = (authType: string) => {
    switch (authType.toLowerCase()) {
      case "google":
        return <Badge className="bg-red-500">Google</Badge>;
      case "facebook":
        return <Badge className="bg-blue-600">Facebook</Badge>;
      case "apple":
        return <Badge className="bg-gray-800">Apple</Badge>;
      case "github":
        return <Badge className="bg-gray-900">GitHub</Badge>;
      case "classic":
      default:
        return <Badge variant="outline">Email</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
            <p className="mt-4 text-muted-foreground">
              Loading session data...
            </p>
          </div>
        ) : sessions && sessions.length > 0 ? (
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Client</TableHead>
                  <TableHead>Device & Browser</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[120px]">Auth Type</TableHead>
                  <TableHead className="w-[180px]">Last Active</TableHead>
                  <TableHead className="w-[150px]">Created</TableHead>
                  <TableHead className="text-right w-[100px]">
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
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={session.user.image || "/placeholder.svg"}
                                />
                                <AvatarFallback>
                                  {session.user.username
                                    ?.slice(0, 2)
                                    .toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {session.user.username || session.user.email}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <span>
                                    ID: {session.clientId.substring(0, 8)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-fit">
                            <div className="flex justify-between gap-4">
                              <Avatar>
                                <AvatarImage
                                  src={session.user.image || "/placeholder.svg"}
                                />
                                <AvatarFallback>
                                  {session.user.username
                                    ?.slice(0, 2)
                                    .toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <h4 className="text-sm font-semibold">
                                  {session.user.username || session.user.email}
                                </h4>
                                {session.user.fullname && (
                                  <p className="text-sm">
                                    {session.user.fullname}
                                  </p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  {session.user.email}
                                </p>
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {session.user.permissions ? (
                                    session.user.permissions.map((role) => (
                                      <Badge
                                        key={role}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {role}
                                      </Badge>
                                    ))
                                  ) : (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      No roles
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center pt-2">
                                  <Fingerprint className="mr-2 h-4 w-4 opacity-70" />
                                  <span className="text-xs text-muted-foreground">
                                    {session.clientId}
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
                        {getAuthTypeBadge(session.authType)}
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
                                      isActive ? "bg-green-500" : "bg-amber-500"
                                    )}
                                  />
                                  <span>
                                    {isActive ? "Currently active" : "Inactive"}
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onTerminateSession(session)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p>Terminate this session</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-24 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No sessions found matching your filters.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
