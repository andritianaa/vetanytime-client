import { NextRequest, NextResponse } from 'next/server';

import { hashPassword, verifyPassword } from '@/lib/auth';
import { currentClient } from '@/lib/current-user';
import { prisma } from '@/prisma';

// This is a mock implementation - replace with your actual authentication logic
export async function PUT(request: NextRequest) {
    try {
        const { currentPassword, newPassword } = await request.json()
        const client = await currentClient()
        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 })
        }

        // Validate request
        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: "Current password and new password are required" }, { status: 400 })
        }

        // Verify the current password matches the client's actual password
        const isValid = await verifyPassword(currentPassword, client.password);
        if (!isValid) {
            return NextResponse.json(
                { error: "Mot de passe incorrect" },
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);

        // Update the password in your database
        await prisma.client.update({
            where: {
                id: client.id
            },
            data: {
                password: hashedPassword,
            },
        });

        // Mock implementation - in a real app, you'd verify against your database
        if (currentPassword === "wrong-password") {
            return NextResponse.json({ message: "Current password is incorrect" }, { status: 401 })
        }

        // Return success response
        return NextResponse.json({ message: "Password updated successfully" }, { status: 200 })
    } catch (error) {
        console.error("Error updating password:", error)
        return NextResponse.json({ message: "An error occurred while updating the password" }, { status: 500 })
    }
}
