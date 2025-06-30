"use client";

import { motion } from 'framer-motion';
import { ActivityIcon, Clock, LogOut, Trash } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import {
    formatDate, getDeviceIcon, getRelativeTime, isCurrentSession, item
} from './session-utils';

import type { Session } from "@/types/session";
interface SessionCardProps {
  session: Session;
  currentSessionId?: string;
  onTerminate: (session: Session) => void;
  onViewActivity: (session: Session) => void;
}

export function SessionCard({
  session,
  currentSessionId,
  onTerminate,
  onViewActivity,
}: SessionCardProps) {
  const isCurrent = isCurrentSession(session.id, currentSessionId);
  const relativeTime = getRelativeTime(session.lastActive);
  const isActive = relativeTime === "active";

  return (
    <motion.div variants={item}>
      <Card
        className={cn(
          "overflow-hidden transition-all duration-200 hover:shadow-md",
          isCurrent
            ? "border-primary border-2 bg-primary/5 dark:bg-primary/10"
            : ""
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-muted p-1.5">
                {getDeviceIcon(session.deviceType)}
              </div>
              <CardTitle className="text-lg flex items-center gap-2">
                {session.browser || "Unknown browser"} on {session.deviceType}
                {isCurrent && (
                  <Badge
                    variant="outline"
                    className="ml-auto border-primary text-primary"
                  >
                    Current
                  </Badge>
                )}
              </CardTitle>
            </div>
            {isCurrent && !session.browser && (
              <Badge
                variant="outline"
                className="border-primary text-primary font-medium"
              >
                Current
              </Badge>
            )}
          </div>
          <CardDescription className="mt-1">
            {session.deviceOs}{" "}
            {session.deviceModel && `- ${session.deviceModel}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">IP Address:</span>
              <span className="font-medium">{session.ip}</span>
            </div>
            {session.country && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span>{session.country}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{formatDate(session.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Last active:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5">
                      <Clock
                        className={cn(
                          "h-3.5 w-3.5",
                          isActive ? "text-green-500" : "text-muted-foreground"
                        )}
                      />
                      <span
                        className={cn(
                          "font-medium",
                          isActive ? "text-green-500" : "text-primary"
                        )}
                      >
                        {isActive ? "active" : relativeTime}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>{formatDate(session.lastActive)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-4 pb-2 flex flex-col gap-2">
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onViewActivity(session)}
            >
              <ActivityIcon className="h-4 w-4 mr-2" />
              View Activity
            </Button>
            <Button
              variant={isCurrent ? "default" : "destructive"}
              size="sm"
              className="flex-1"
              onClick={() => onTerminate(session)}
            >
              {isCurrent ? (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  Terminate
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
