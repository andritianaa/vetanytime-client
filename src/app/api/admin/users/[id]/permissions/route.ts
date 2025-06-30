import { NextResponse } from 'next/server';
import { z } from 'zod';

import { currentSession } from '@/lib/current-client';
import { prisma } from '@/prisma';
import { Roles } from '@prisma/client';

// Define validation schema for request body
const PermissionsSchema = z.object({
    permissions: z.array(z.string()),
})

export async function PATCH(request: Request, context: any) {
    const { params } = context
    const clientId = params.id.toString()

    try {
        // Check authentication and admin permissions
        const session = await currentSession()
        if (!session || !session.client || !session.client.permissions.some((role) => ["ADMIN", "SUPERADMIN"].includes(role))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }


        // Parse and validate request body
        const body = await request.json()
        const validationResult = PermissionsSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Invalid request body",
                    details: validationResult.error.errors,
                },
                { status: 400 },
            )
        }

        const { permissions } = validationResult.data

        // Update client permissions
        const updatedClient = await prisma.client.update({
            where: { id: clientId },
            data: {
                permissions: permissions as Roles[],
            },
            select: {
                id: true,
                username: true,
                email: true,
                permissions: true,
            },
        })


        return NextResponse.json(updatedClient)
    } catch (error) {
        console.error("Error updating client permissions:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
