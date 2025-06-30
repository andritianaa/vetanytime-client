import { NextResponse } from 'next/server';

import { trackAction } from '@/actions/tracking.actions';
import { currentSession } from '@/lib/current-client';
import { Logger } from '@/lib/error-logger';
import { prisma } from '@/prisma';
import { Actions } from '@prisma/client';

export async function GET() {
    try {
        const media = await prisma.media.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(media);
    } catch (error) {
        console.error("Error fetching media:", error);
        return NextResponse.json(
            { error: "Failed to fetch media" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url, type } = body;

        const session = await currentSession()

        if (!url || !type) {
            return NextResponse.json(
                { error: "URL and type are required" },
                { status: 400 }
            );
        }

        const media = await prisma.media.create({
            data: {
                url,
                type,
                clientId: session?.client.id
            },
        });

        if (session) {
            trackAction(Actions.UPLOADED_IMAGE, {
                url,
                type,
                clientId: session?.client.id,
                id: media.id
            })
        }

        return NextResponse.json(media);
    } catch (error) {
        Logger.error("Error on image upload", {
            message: error instanceof Error ? error.message : String(error),
        });
        return NextResponse.json(
            { error: "Failed to create media" },
            { status: 500 }
        );
    }
}
