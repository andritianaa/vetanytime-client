import { NextRequest, NextResponse } from 'next/server';

import { currentClient } from '@/lib/current-user';
import { prisma } from '@/prisma';

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json();
        const client = await currentClient()
        if (!token) {
            return NextResponse.json(
                { error: "Verification token is required" },
                { status: 401 }
            );
        }

        if (!client) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 403 }
            );
        }

        console.log('client ==> ', client)
        console.log('token ==> ', token)

        if (token != client?.verificationToken) {
            return NextResponse.json(
                { error: "Invalid or expired verification token" },
                { status: 400 }
            );
        }

        // Mark the client as verified and clear the token
        await prisma.client.update({
            where: { id: client.id },
            data: {
                isEmailVerified: true,
                verificationToken: null,
                verificationTokenExpires: null,
            },
        });

        // TODO : Log the activity
        // await trackAction(client.id, Actions.EMAIL_VERIFIED, { email: client.email });

        return NextResponse.json({
            success: true,
            message: "Email verified successfully"
        });
    } catch (error) {
        console.error("Error verifying email:", error);
        return NextResponse.json(
            { error: "An error occurred while verifying your email" },
            { status: 500 }
        );
    }
}