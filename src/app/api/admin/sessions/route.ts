import { NextRequest, NextResponse } from 'next/server';

import { currentSession } from '@/lib/current-client';
import { Logger } from '@/lib/error-logger';
import { prisma } from '@/prisma';
import { Roles } from '@prisma/client';

/**
 * GET /api/admin/sessions
 * Admin endpoint to get all client sessions with advanced filtering
 */
export async function GET(req: NextRequest) {
    try {
        const session = await currentSession();

        // Check if client is admin
        if (!session || !session.client.permissions?.includes(Roles.ADMIN)) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        // Parse query parameters
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "25");
        const searchQuery = url.searchParams.get("search") || "";
        const deviceTypes = url.searchParams.getAll("deviceType");
        const browsers = url.searchParams.getAll("browser");
        const clientId = url.searchParams.get("clientId");
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");
        const sortBy = url.searchParams.get("sortBy") || "lastActive";
        const sortDirection = (url.searchParams.get("sortDirection") as "asc" | "desc") || "desc";

        // Build the where clause
        const where: any = {};

        // Filter by device types if provided
        if (deviceTypes.length > 0) {
            where.deviceType = { in: deviceTypes };
        }

        // Filter by browsers if provided
        if (browsers.length > 0) {
            where.browser = { in: browsers };
        }

        // Filter by client ID if provided
        if (clientId) {
            where.clientId = clientId;
        }

        // Apply search if provided - search across multiple fields
        if (searchQuery) {
            where.OR = [
                { ip: { contains: searchQuery, mode: 'insensitive' } },
                { country: { contains: searchQuery, mode: 'insensitive' } },
                { deviceOs: { contains: searchQuery, mode: 'insensitive' } },
                { deviceModel: { contains: searchQuery, mode: 'insensitive' } },
                { browser: { contains: searchQuery, mode: 'insensitive' } },
                { deviceType: { contains: searchQuery, mode: 'insensitive' } },
                {
                    client: {
                        OR: [
                            { username: { contains: searchQuery, mode: 'insensitive' } },
                            { email: { contains: searchQuery, mode: 'insensitive' } },
                            { fullname: { contains: searchQuery, mode: 'insensitive' } },
                        ]
                    }
                },
            ];
        }

        // Apply date filters if provided
        if (startDate || endDate) {
            where.createdAt = {};

            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }

            if (endDate) {
                const endDateTime = new Date(endDate);
                endDateTime.setHours(23, 59, 59, 999);
                where.createdAt.lte = endDateTime;
            }
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const totalCount = await prisma.session.count({
            where,
        });

        // Fetch sessions with pagination, sorting and include relations
        const sessions = await prisma.session.findMany({
            where,
            include: {
                client: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        fullname: true,
                        image: true,
                        permissions: true,

                    },
                },
            },
            orderBy: {
                [sortBy]: sortDirection,
            },
            skip,
            take: limit,
        });

        return NextResponse.json({
            sessions,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        });
    }
    catch (error) {
        await Logger.error("Admin failed to fetch sessions", {
            message: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            { error: "Failed to fetch sessions" },
            { status: 500 }
        );
    }
}