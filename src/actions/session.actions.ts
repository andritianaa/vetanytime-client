"use server";

import { cookies } from 'next/headers';

import { trackAction } from '@/actions/tracking.actions';
import { SA } from '@/lib/safe-ation';
import { prisma } from '@/prisma';
import { Actions } from '@prisma/client';

/**
 * Terminate a specific session (log out from a device)
 */
export const terminateSession = SA(async (session, sessionId: string) => {
    // Check if trying to terminate own session
    const isCurrentSession = session.id === sessionId;

    // Security: Only allow clients to terminate their own sessions
    const targetSession = await prisma.clientSession.findUnique({
        where: { id: sessionId },
        select: { userId: true },
    });

    if (!targetSession || targetSession.userId !== session.userId) {
        throw new Error("Unauthorized access");
    }

    // Delete the session from database
    await prisma.session.delete({
        where: { id: sessionId },
    });

    // Track the action
    await trackAction(Actions.SESSION_TERMINATED, {
        terminatedSessionId: sessionId,
        isCurrentSession,
    });

    return { success: true };
});

/**
 * Terminate all sessions except the current one
 */
export const terminateOtherSessions = SA(async (session) => {
    // Delete all sessions from this client except the current one
    const result = await prisma.session.deleteMany({
        where: {
            userId: session.userId,
            id: { not: session.id },
        },
    });

    // Track the action
    await trackAction(Actions.SESSIONS_TERMINATED, {
        count: result.count,
    });

    return { success: true, terminatedCount: result.count };
});

/**
 * Terminate all sessions including the current one (log out everywhere)
 */
export const terminateAllSessions = SA(async (session) => {
    // Delete all sessions from this client
    const result = await prisma.session.deleteMany({
        where: {
            userId: session.userId,
        },
    });

    // Track the action
    await trackAction(Actions.SESSIONS_TERMINATED, {
        count: result.count,
        includesCurrent: true,
    });

    // Clear cookies to log out current session
    (await cookies()).delete('auth-token');

    return { success: true, terminatedCount: result.count };
});

/**
 * Update session's last active timestamp
 */
export const updateSessionActivity = SA(async (session) => {
    await prisma.clientSession.update({
        where: { id: session.id },
        data: { lastActive: new Date() },
    });

    return { success: true };
});

/**
 * Get all active sessions for the current client
 * This is a direct server action, not using the SWR
 */
export const getClientSessions = SA(async (session) => {
    const sessions = await prisma.clientSession.findMany({
        where: {
            userId: session.userId,
        },
        orderBy: {
            lastActive: 'desc',
        },
    });

    // Add a flag to indicate the current session
    return sessions.map(s => ({
        ...s,
        isCurrentSession: s.id === session.id
    }));
});

/**
 * Admin function to terminate a client's session
 * Only clients with ADMIN role can use this function
 */
export const adminTerminateSession = SA(async (session, sessionId: string) => {
    // Check if client has admin permissions
    if (!session.user.permissions?.includes("ADMIN")) {
        throw new Error("Unauthorized access");
    }

    // Get the target session to track whose session we're terminating
    const targetSession = await prisma.clientSession.findUnique({
        where: { id: sessionId },
        select: {
            userId: true,
            deviceType: true,
            browser: true,
            ip: true,
        },
    });

    if (!targetSession) {
        throw new Error("Session not found");
    }

    // Delete the session
    await prisma.session.delete({
        where: { id: sessionId },
    });

    // Track the action
    await trackAction(Actions.ADMIN_SESSION_TERMINATED, {
        terminatedSessionId: sessionId,
        targetClientId: targetSession.userId,
        deviceInfo: {
            deviceType: targetSession.deviceType,
            browser: targetSession.browser,
            ip: targetSession.ip,
        }
    });

    return { success: true };
});

/**
 * Admin function to terminate all sessions for a specific client
 * Only clients with ADMIN role can use this function
 */
export const adminTerminateAllClientSessions = SA(async (session, userId: string) => {
    // Check if client has admin permissions
    if (!session.user.permissions?.includes("ADMIN")) {
        throw new Error("Unauthorized access");
    }

    // Delete all sessions for the specified client
    const result = await prisma.session.deleteMany({
        where: { userId },
    });

    // Track the action
    await trackAction(Actions.ADMIN_USER_SESSIONS_TERMINATED, {
        targetClientId: userId,
        count: result.count,
    });

    return { success: true, terminatedCount: result.count };
});