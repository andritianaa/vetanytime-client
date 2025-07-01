import { NextResponse } from 'next/server';

import { currentSession } from '@/lib/current-user';
import { prisma } from '@/prisma';

export async function GET(request: Request, context: any) {
    try {
        const { params } = context
        const clientId = params.id.toString()
        // Check authentication and admin permissions
        const session = await currentSession()
        if (
            !session ||
            !session.user ||
            !session.user.permissions.some((role) => ["ADMIN", "SUPERADMIN", "MODERATOR"].includes(role))
        ) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }


        // Get client details with sessions, activities, and media
        const client = await prisma.client.findUnique({
            where: { id: clientId },
            include: {
                ClientSession: {
                    orderBy: {
                        lastActive: "desc",
                    },
                },
                Activity: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 20,
                    include: {
                        session: true,
                    },
                },
                Media: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 12,
                },
            },
        })

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 })
        }

        return NextResponse.json(client)
    } catch (error) {
        console.error("Error fetching client details:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
