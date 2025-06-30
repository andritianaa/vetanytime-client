import { NextRequest, NextResponse } from 'next/server';

import { currentSession } from '@/lib/current-user';
import { Logger } from '@/lib/error-logger';
import { prisma } from '@/prisma';
import { Actions } from '@prisma/client';

/**
 * GET /api/admin/activity
 * Admin endpoint to get activity logs for all clients with advanced filtering
 */
export async function GET(req: NextRequest) {
    try {
        const session = await currentSession();

        // Check if client is admin
        if (!session) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        // Parse query parameters
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "25");
        const searchQuery = url.searchParams.get("search") || "";
        const actionsParam = url.searchParams.getAll("action");
        const clientId = url.searchParams.get("clientId");
        const sessionId = url.searchParams.get("sessionId");
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");
        const sortBy = url.searchParams.get("sortBy") || "createdAt";
        const sortDirection = (url.searchParams.get("sortDirection") as "asc" | "desc") || "desc";

        // Build the where clause
        const where: any = {};

        // Apply action filters if provided
        if (actionsParam.length > 0) {
            where.action = {
                in: actionsParam as Actions[],
            };
        }

        // Filter by client ID if provided
        if (clientId) {
            where.clientId = clientId;
        }

        // Filter by session ID if provided
        if (sessionId) {
            where.sessionId = sessionId;
        }

        // Apply search if provided - search across multiple fields
        if (searchQuery) {
            where.OR = [
                { action: { contains: searchQuery, mode: 'insensitive' } },
                { metadata: { path: "$", string_contains: searchQuery } },
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
        const totalCount = await prisma.activity.count({
            where,
        });

        // Fetch activities with pagination, sorting and include relations
        const activities = await prisma.activity.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        fullname: true,
                        image: true,
                    },
                },
                session: {
                    select: {
                        id: true,
                        deviceType: true,
                        deviceOs: true,
                        browser: true,
                        ip: true,
                        country: true,
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
            activities,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        });
    }
    catch (error) {
        await Logger.error("Admin failed to fetch activity logs", {
            message: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            { error: "Failed to fetch activity logs" },
            { status: 500 }
        );
    }
}