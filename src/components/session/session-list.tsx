"use client";

import type { Session } from "@/types/session";
import { motion } from 'framer-motion';

import { SessionCard } from './session-card';
import { SessionEmpty } from './session-empty';
import { container } from './session-utils';

interface SessionListProps {
  sessions: Session[];
  currentSessionId?: string;
  onTerminate: (session: Session) => void;
  onViewActivity: (session: Session) => void;
}

export function SessionList({
  sessions,
  currentSessionId,
  onTerminate,
  onViewActivity,
}: SessionListProps) {
  if (!sessions || sessions.length === 0) {
    return <SessionEmpty />;
  }

  return (
    <motion.div
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          currentSessionId={currentSessionId}
          onTerminate={onTerminate}
          onViewActivity={onViewActivity}
        />
      ))}
    </motion.div>
  );
}
