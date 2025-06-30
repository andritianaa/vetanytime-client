"use client";

import { Info } from 'lucide-react';
import { useState } from 'react';

import { ActivityDetailsDialog } from '@/components/admin/activity/activity-details-dialog';
import { SessionDetailsDialog } from '@/components/admin/activity/session-details-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import type { Activity } from "@/types/activity";
import type { Session } from "@/types/session";
import type { Actions } from "@prisma/client";

interface ClientActivitiesProps {
  clientId: string;
  activities: Activity[];
}

export function ClientActivities({
  clientId,
  activities,
}: ClientActivitiesProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isSessionDetailsOpen, setIsSessionDetailsOpen] = useState(false);

  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Get readable action name
  const getActionName = (action: string) => {
    return action
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Get badge color for action type
  const getActionBadgeVariant = (action: Actions) => {
    switch (action) {
      case "LOGIN_SUCCESS":
      case "CLIENT_SIGNUP":
      case "PLAN_UPGRADE":
        return "default"; // Primary color
      case "EDIT_THEME":
      case "EDIT_IMAGE":
      case "EDIT_LANGAGE":
      case "EDIT_PASSWORD":
      case "PROFILE_UPDATE":
      case "SESSION_TERMINATED":
        return "secondary"; // Secondary color
      case "RESET_PASSWORD":
      case "FORGOT_PASSWORD":
      case "SESSIONS_TERMINATED":
        return "outline"; // Outline style
      case "LOGIN_FAILURE":
      case "DELETE_ACCOUNT":
        return "destructive"; // Destructive color
      default:
        return "secondary";
    }
  };

  // Handle view details
  const handleViewDetails = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDetailsOpen(true);
  };

  // Handle view session details
  const handleViewSessionDetails = (session: Session) => {
    setSelectedSession(session);
    setIsSessionDetailsOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Client Activity Log</CardTitle>
          <CardDescription>
            Recent activities performed by this client
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Date & Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="w-[140px]">Session</TableHead>
                    <TableHead className="text-right w-[100px]">
                      Details
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-mono text-xs">
                        {formatDate(activity.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getActionBadgeVariant(
                            activity.action as Actions
                          )}
                        >
                          {getActionName(activity.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {activity.session ? (
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground overflow-hidden whitespace-nowrap text-ellipsis max-w-[100px]">
                              {activity.session.deviceType}{" "}
                              {activity.session.browser &&
                                `- ${activity.session.browser}`}
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewSessionDetails(
                                        activity.session!
                                      );
                                    }}
                                  >
                                    <Info className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>View session details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No session data
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(activity)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                No activities found for this client.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedActivity && (
        <ActivityDetailsDialog
          activity={{ ...selectedActivity, client: { id: clientId } as any }}
          isOpen={isDetailsOpen}
          setIsOpen={setIsDetailsOpen}
          getActionBadgeVariant={getActionBadgeVariant}
          getActionName={getActionName}
          formatDate={formatDate}
        />
      )}

      <SessionDetailsDialog
        session={selectedSession}
        isOpen={isSessionDetailsOpen}
        setIsOpen={setIsSessionDetailsOpen}
        formatDate={formatDate}
      />
    </div>
  );
}
