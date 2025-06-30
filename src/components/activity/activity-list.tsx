"use client";

import { Clock, ExternalLink } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { Activity } from "@/types/activity";
interface ActivityListProps {
  activities: Activity[];
  isLoading: boolean;
  formatDate: (date: Date | string) => string;
  getActionName: (action: string) => string;
  getActionDescription: (action: string) => string;
  getActionBadgeVariant: (action: string) => string;
  setSelectedActivity: (activity: Activity) => void;
  setIsDetailsOpen: (isOpen: boolean) => void;
}

export function ActivityList({
  activities,
  isLoading,
  formatDate,
  getActionName,
  getActionDescription,
  getActionBadgeVariant,
  setSelectedActivity,
  setIsDetailsOpen,
}: ActivityListProps) {
  if (isLoading) {
    return (
      <div className="py-4 text-center">Loading your activity data...</div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">
            No activities found matching your filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {activities.map((activity) => (
        <Card key={activity.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <CardTitle className="flex items-center gap-2">
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
                </CardTitle>
                <CardDescription>
                  {getActionDescription(activity.action)}
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedActivity(activity);
                  setIsDetailsOpen(true);
                }}
              >
                Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground flex justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(activity.createdAt)}
              </div>
              {activity.session && (
                <div className="flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  {activity.session.deviceType} -{" "}
                  {activity.session.browser || "Unknown browser"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
