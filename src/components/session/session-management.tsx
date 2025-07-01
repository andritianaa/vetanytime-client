"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';

import { terminateAllSessions, terminateSession } from '@/actions/session.actions';
import { useToast } from '@/hooks/use-toast';
import { fetcher } from '@/lib/utils';

import { SessionActivityDialog } from './session-activity-dialog';
import { SessionConfirmDialog } from './session-confirm-dialog';
import { SessionError } from './session-error';
import { SessionHeader } from './session-header';
import { SessionList } from './session-list';
import { SessionLoading } from './session-loading';
import { SessionTerminateAllDialog } from './session-terminate-all-dialog';

import type { Session } from "@/types/session";
export function SessionManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isTerminateAllOpen, setIsTerminateAllOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [activitySession, setActivitySession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: sessions,
    error,
    isLoading: isLoadingSessions,
    mutate,
  } = useSWR<Session[]>("/api/account/sessions", fetcher, {
    refreshInterval: 60000, // Auto refresh every minute
  });

  // Get current session (the session used to view this page)
  const { data: currentSession } = useSWR<{ currentSessionId: string }>(
    "/api/account/current-session",
    fetcher
  );

  const handleTerminateSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      await terminateSession(sessionId);

      // If current session is terminated, redirect to login
      if (currentSession && currentSession.currentSessionId === sessionId) {
        toast({
          title: "Session terminated",
          description: "You've been logged out from this device.",
        });
        router.push("/auth/login");
        return;
      }

      toast({
        title: "Session terminated",
        description: "The selected session has been terminated successfully.",
      });

      mutate(); // Refresh the sessions list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to terminate session. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
      setIsConfirmOpen(false);
    }
  };

  const handleTerminateAllSessions = async () => {
    setIsLoading(true);
    try {
      await terminateAllSessions();
      toast({
        title: "All sessions terminated",
        description: "You've been logged out from all devices.",
      });
      router.push("/auth/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to terminate all sessions. Please try again.",
        variant: "error",
      });
      setIsLoading(false);
      setIsTerminateAllOpen(false);
    }
  };

  const handleSessionTerminate = (session: Session) => {
    setSelectedSession(session);
    setIsConfirmOpen(true);
  };

  const handleViewActivity = (session: Session) => {
    setActivitySession(session);
    setIsActivityDialogOpen(true);
  };

  if (error) {
    return <SessionError message={error.message} onRetry={() => mutate()} />;
  }

  return (
    <>
      <SessionHeader
        onRefresh={() => mutate()}
        onLogoutAll={() => setIsTerminateAllOpen(true)}
      />

      {isLoadingSessions ? (
        <SessionLoading />
      ) : (
        <SessionList
          sessions={sessions || []}
          currentSessionId={currentSession?.currentSessionId}
          onTerminate={handleSessionTerminate}
          onViewActivity={handleViewActivity}
        />
      )}

      <SessionConfirmDialog
        session={selectedSession}
        currentSessionId={currentSession?.currentSessionId}
        isOpen={isConfirmOpen}
        isLoading={isLoading}
        onOpenChange={setIsConfirmOpen}
        onConfirm={() =>
          selectedSession && handleTerminateSession(selectedSession.id)
        }
      />

      <SessionTerminateAllDialog
        isOpen={isTerminateAllOpen}
        isLoading={isLoading}
        onOpenChange={setIsTerminateAllOpen}
        onConfirm={handleTerminateAllSessions}
      />

      <SessionActivityDialog
        session={activitySession}
        isOpen={isActivityDialogOpen}
        onOpenChange={setIsActivityDialogOpen}
      />
    </>
  );
}
