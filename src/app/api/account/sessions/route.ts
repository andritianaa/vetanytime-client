import { NextRequest, NextResponse } from 'next/server';

import { currentSession } from '@/lib/current-client';
import { Logger } from '@/lib/error-logger';
import { prisma } from '@/prisma';

/**
 * GET /api/account/sessions
 * Returns all active sessions for the current client
 */
export async function GET(req: NextRequest) {
    try {
        const session = await currentSession();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const sessions = await prisma.session.findMany({
            where: {
                clientId: session.clientId,
            },
            orderBy: {
                lastActive: 'desc',
            },
        });

        return NextResponse.json(sessions);
    }
    catch (error) {
        await Logger.error("Failed to fetch client sessions", {
            message: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            { error: "Failed to fetch sessions" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/account/sessions/:id
 * Terminates a specific session
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await currentSession();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const sessionId = url.searchParams.get("id");

        if (!sessionId) {
            return NextResponse.json(
                { error: "Session ID is required" },
                { status: 400 }
            );
        }

        // Security check - only allow clients to terminate their own sessions
        const targetSession = await prisma.session.findUnique({
            where: { id: sessionId },
            select: { clientId: true },
        });

        if (!targetSession || targetSession.clientId !== session.clientId) {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 403 }
            );
        }

        // Delete the session
        await prisma.session.delete({
            where: { id: sessionId },
        });

        return NextResponse.json({ success: true });
    }
    catch (error) {
        await Logger.error("Failed to terminate session", {
            message: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            { error: "Failed to terminate session" },
            { status: 500 }
        );
    }
}