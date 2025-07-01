import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { currentSession } from '@/lib/current-user';
import { Logger } from '@/lib/error-logger';
import { prisma } from '@/prisma';
import { Actions, Prisma, Roles } from '@prisma/client';

// Define validation schema for query parameters
const QuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(25),
    search: z.string().optional(),
    action: z.array(z.nativeEnum(Actions)).optional(),
    clientId: z.string().optional(),
    sessionId: z.string().optional(),
    startDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    endDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    sortBy: z.enum(["createdAt", "action", "clientId"]).default("createdAt"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
})

// Cache TTL in seconds (5 minutes)
const CACHE_TTL = 300

/**
 * Builds the Prisma where clause based on the provided filters
 */
function buildWhereClause(params: z.infer<typeof QuerySchema>) {
    const where: Prisma.ActivityWhereInput = {}

    // Apply action filters if provided
    if (params.action && params.action.length > 0) {
        where.action = {
            in: params.action,
        }
    }

    // Filter by client ID if provided
    if (params.clientId) {
        where.userId = params.clientId
    }

    // Filter by session ID if provided
    if (params.sessionId) {
        where.sessionId = params.sessionId
    }

    // Apply search if provided - search across multiple fields
    if (params.search && params.search.trim() !== "") {
        const searchTerm = params.search.trim()
        where.OR = [
            { action: { equals: searchTerm as Actions } },
            // Use more efficient JSON search if available in your Prisma version
            { metadata: { path: ["$"], string_contains: searchTerm } },
            {
                user: {
                    OR: [
                        { username: { contains: searchTerm, mode: "insensitive" } },
                        { email: { contains: searchTerm, mode: "insensitive" } },
                        { fullname: { contains: searchTerm, mode: "insensitive" } },
                    ],
                },
            },
        ]
    }

    // Apply date filters if provided
    if (params.startDate || params.endDate) {
        where.createdAt = {}

        if (params.startDate) {
            where.createdAt.gte = new Date(`${params.startDate}T00:00:00Z`)
        }

        if (params.endDate) {
            // Set to end of day for the end date
            where.createdAt.lte = new Date(`${params.endDate}T23:59:59.999Z`)
        }
    }

    return where
}

/**
 * GET /api/admin/activity
 * Admin endpoint to get activity logs for all clients with advanced filtering
 *
 * @param req - The incoming request object
 * @returns A JSON response with activities and pagination info
 */
export async function GET(req: NextRequest) {
    try {
        // Check authentication and permissions
        const session = await currentSession()
        if (!session || !session.user.permissions?.includes(Roles.ADMIN)) {
            return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 })
        }

        // Parse and validate query parameters
        const url = new URL(req.url)
        const queryParams = {
            page: url.searchParams.get("page"),
            limit: url.searchParams.get("limit"),
            search: url.searchParams.get("search"),
            action: url.searchParams.getAll("action"),
            clientId: url.searchParams.get("clientId"),
            sessionId: url.searchParams.get("sessionId"),
            startDate: url.searchParams.get("startDate"),
            endDate: url.searchParams.get("endDate"),
            sortBy: url.searchParams.get("sortBy"),
            sortDirection: url.searchParams.get("sortDirection"),
        }

        // Validate query parameters
        const validationResult = QuerySchema.safeParse({
            page: queryParams.page,
            limit: queryParams.limit,
            search: queryParams.search || undefined,
            action: queryParams.action.length > 0 ? queryParams.action : undefined,
            clientId: queryParams.clientId || undefined,
            sessionId: queryParams.sessionId || undefined,
            startDate: queryParams.startDate || undefined,
            endDate: queryParams.endDate || undefined,
            sortBy: queryParams.sortBy || undefined,
            sortDirection: queryParams.sortDirection || undefined,
        })

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Invalid query parameters",
                    details: validationResult.error.errors,
                },
                { status: 400 },
            )
        }

        const params = validationResult.data

        // Build the where clause
        const where = buildWhereClause(params)

        // Calculate pagination
        const skip = (params.page - 1) * params.limit

        // Set cache control headers if no client-specific filters
        const headers: HeadersInit = {}
        if (!params.clientId && !params.sessionId && !params.search) {
            headers["Cache-Control"] = `public, max-age=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL * 2}`
        }

        // Use Promise.all to run queries in parallel for better performance
        const [totalCount, activities] = await Promise.all([
            // Get total count for pagination
            prisma.activity.count({ where }),

            // Fetch activities with pagination, sorting and include relations
            prisma.activity.findMany({
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
                    [params.sortBy]: params.sortDirection,
                },
                skip,
                take: params.limit,
            }),
        ])

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / params.limit)

        // Return the response with pagination info
        return NextResponse.json(
            {
                activities,
                pagination: {
                    page: params.page,
                    limit: params.limit,
                    totalCount,
                    totalPages,
                },
            },
            { headers },
        )
    } catch (error) {
        // Log the error with detailed information
        const errorMessage = error instanceof Error ? error.message : String(error)
        const errorStack = error instanceof Error ? error.stack : undefined

        await Logger.error("Admin failed to fetch activity logs", {
            message: errorMessage,
            stack: errorStack,
        })

        // Determine if it's a Prisma error
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2023") {
                return NextResponse.json({ error: "Invalid search query format" }, { status: 400 })
            }
        }

        // Return a generic error response
        return NextResponse.json({ error: "Failed to fetch activity logs", message: errorMessage }, { status: 500 })
    }
}
