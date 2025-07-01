import { NextRequest, NextResponse } from 'next/server';

import { currentSession } from '@/lib/current-user';
import { Logger } from '@/lib/error-logger';
import { prisma } from '@/prisma';
import { Roles } from '@prisma/client';

/**
 * GET /api/admin/errors
 * Admin endpoint to get error logs with filtering and pagination
 */
export async function GET(req: NextRequest) {
    try {
        const session = await currentSession();

        // Check if client is admin
        if (!session || !session.user.permissions?.includes(Roles.ADMIN)) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        // Parse query parameters
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "25");
        const searchQuery = url.searchParams.get("search") || "";
        const levels = url.searchParams.getAll("level");
        const tags = url.searchParams.getAll("tag");
        const environment = url.searchParams.get("environment");
        const resolvedString = url.searchParams.get("resolved");
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");
        const sortBy = url.searchParams.get("sortBy") || "createdAt";
        const sortDirection = (url.searchParams.get("sortDirection") as "asc" | "desc") || "desc";

        // Parse resolved status
        let resolved: boolean | undefined = undefined;
        if (resolvedString !== null) {
            resolved = resolvedString === "true";
        }

        // Build the where clause
        const where: any = {};

        // Apply filter by level
        if (levels.length > 0) {
            where.level = { in: levels };
        }

        // Apply filter by tags
        if (tags.length > 0) {
            where.tags = { hasSome: tags };
        }

        // Apply filter by environment
        if (environment) {
            where.environment = environment;
        }

        // Apply filter by resolved status
        if (resolved !== undefined) {
            where.resolved = resolved;
        }

        // Apply search if provided
        if (searchQuery) {
            where.OR = [
                { message: { contains: searchQuery, mode: 'insensitive' } },
                { stack: { contains: searchQuery, mode: 'insensitive' } },
                { path: { contains: searchQuery, mode: 'insensitive' } },
                { additionalData: { contains: searchQuery, mode: 'insensitive' } },
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
        const totalCount = await prisma.errorLog.count({
            where,
        });

        // Fetch errors with pagination and sorting
        const errors = await prisma.errorLog.findMany({
            where,
            orderBy: {
                [sortBy]: sortDirection,
            },
            skip,
            take: limit,
        });

        return NextResponse.json({
            errors,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        });
    }
    catch (error) {
        await Logger.error("Admin failed to fetch error logs", {
            message: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            { error: "Failed to fetch error logs" },
            { status: 500 }
        );
    }
}