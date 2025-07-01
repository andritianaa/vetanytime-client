import { NextRequest, NextResponse } from 'next/server';

import { currentSession } from '@/lib/current-user';
import { prisma } from '@/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {

    try {
        // Check authentication and admin permissions
        const session = await currentSession()
        if (
            !session ||
            !session.user ||
            !session.user.permissions.some((role) => ["ADMIN", "SUPERADMIN", "MODERATOR"].includes(role))
        ) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        // Get query parameters
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get("query") || ""
        const clientId = searchParams.get("clientId")
        const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
        const page = Number.parseInt(searchParams.get("page") || "1", 10)
        const skip = (page - 1) * limit

        // If clientId is provided, fetch that specific client
        if (clientId) {
            const client = await prisma.client.findUnique({
                where: { id: clientId },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    fullname: true,
                    image: true,
                },
            })

            if (!client) {
                return NextResponse.json({ error: "Client not found" }, { status: 404 })
            }

            return NextResponse.json({
                clients: [client],
                pagination: {
                    total: 1,
                    pages: 1,
                    page: 1,
                    limit: 1,
                },
            })
        }

        // If no clientId but query is provided, search clients
        let whereCondition: Prisma.ClientWhereInput = {}

        if (query) {
            whereCondition = {
                OR: [
                    { username: { contains: query, mode: Prisma.QueryMode.insensitive } },
                    { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
                    { fullname: { contains: query, mode: Prisma.QueryMode.insensitive } },
                ],
            }
        }

        // Search clients
        const clients = await prisma.client.findMany({
            where: whereCondition,

            take: limit,
            skip: skip,
            include: {
                ClientSession: true,
                Media: true,
            },
            orderBy: {
                username: "asc",
            },
        })

        // Get total count for pagination
        const totalCount = await prisma.client.count({ where: whereCondition })

        return NextResponse.json({
            clients,
            pagination: {
                total: totalCount,
                pages: Math.ceil(totalCount / limit),
                page,
                limit,
            },
        })
    } catch (error) {
        console.error("Error searching clients:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
