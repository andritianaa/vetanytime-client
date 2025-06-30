import { NextResponse } from 'next/server';

import { currentSession } from '@/lib/current-client';
import { Logger } from '@/lib/error-logger';
import { prisma } from '@/prisma';
import { Roles } from '@prisma/client';

/**
 * POST /api/admin/errors/:id/resolve
 * Marks an error as resolved with optional resolution notes
 */
export async function POST(request: Request, context: any) {
    try {
        const { params } = context
        const id = params.id.toString()
        const session = await currentSession();

        // Check if client is admin
        if (!session || !session.client.permissions?.includes(Roles.ADMIN)) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }


        // Parse request body
        const { resolution } = await request.json();

        // Check if error exists
        const errorLog = await prisma.errorLog.findUnique({
            where: { id },
        });

        if (!errorLog) {
            return NextResponse.json({ error: "Error log not found" }, { status: 404 });
        }

        // Update error log as resolved
        const updatedErrorLog = await prisma.errorLog.update({
            where: { id },
            data: {
                resolved: true,
                resolution: resolution || "Marked as resolved by admin",
            },
        });

        // Log this administrative action
        await Logger.info(`Error ${id} marked as resolved by admin`, {
            clientId: session.clientId,
            id: id,
            resolution: updatedErrorLog.resolution!,
        });

        return NextResponse.json({
            success: true,
            errorLog: updatedErrorLog,
        });
    }
    catch (error) {
        return NextResponse.json(
            { error: "Failed to resolve error log" },
            { status: 500 }
        );
    }
}