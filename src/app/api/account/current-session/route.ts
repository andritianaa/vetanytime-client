import { NextRequest, NextResponse } from 'next/server';

import { updateSessionActivity } from '@/actions/session.actions';
import { currentSession } from '@/lib/current-user';
import { Logger } from '@/lib/error-logger';

/**
 * GET /api/account/current-session
 * Returns the ID of the current session and updates last activity timestamp
 */
export async function GET(req: NextRequest) {
    try {
        const session = await currentSession();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Update last active timestamp 
        await updateSessionActivity();

        return NextResponse.json({
            currentSessionId: session.id,
            userId: session.userId,
        });
    }
    catch (error) {
        await Logger.error("Failed to get current session", {
            message: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            { error: "Failed to get current session" },
            { status: 500 }
        );
    }
}