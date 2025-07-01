"use client";

import { Info, UserCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import type { Activity } from "@/types/activity";
import type { Client } from "@/types/schema";
import type { Session } from "@/types/session";
import type { Actions } from "@prisma/client";

interface ActivityTableProps {
  activities: Array<Activity & { client: Client }> | undefined;
  isLoading: boolean;
  onViewDetails: (activity: Activity & { client: Client }) => void;
  onViewSessionDetails: (session: Session) => void;
  getActionBadgeVariant: (action: Actions) => string;
  getActionName: (action: string) => string;
  formatDate: (date: Date | string) => string;
}

export function ActivityTable({
  activities,
  isLoading,
  onViewDetails,
  onViewSessionDetails,
  getActionBadgeVariant,
  getActionName,
  formatDate,
}: ActivityTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
            <p className="mt-4 text-muted-foreground">
              Loading activity data...
            </p>
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Date & Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="w-[200px]">Client</TableHead>
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
                        variant={
                          getActionBadgeVariant(activity.action) as
                            | "default"
                            | "destructive"
                            | "outline"
                            | "secondary"
                            | null
                            | undefined
                        }
                      >
                        {getActionName(activity.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {activity.client.username || activity.client.email}
                        </span>
                      </div>
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
                                    onViewSessionDetails(activity.session!);
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
                        onClick={() => onViewDetails(activity)}
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
          <div className="py-24 text-center">
            <p className="text-muted-foreground">
              No activities found matching your filters.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
