import { randomBytes } from 'crypto';
// src/app/api/auth/resend-verification/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { currentClient } from '@/lib/current-client';
import { sendEmailVerification } from '@/lib/mail';
import { prisma } from '@/prisma';

export async function POST(req: NextRequest) {
    try {
        // Get the current client
        const client = await currentClient();

        if (!client) {
            return NextResponse.json(
                { error: "You must be logged in to request email verification" },
                { status: 401 }
            );
        }

        // Don't send if already verified
        if (client.isEmailVerified) {
            return NextResponse.json(
                { error: "Your email is already verified" },
                { status: 400 }
            );
        }

        // Check if client wants to update their email
        const { newEmail } = await req.json();
        let email = client.email;

        if (newEmail && newEmail !== client.email) {
            // Check if new email is already in use
            const existingClient = await prisma.client.findUnique({
                where: { email: newEmail },
            });

            if (existingClient) {
                return NextResponse.json(
                    { error: "This email is already in use" },
                    { status: 400 }
                );
            }

            // Update the client's email
            await prisma.client.update({
                where: { id: client.id },
                data: { email: newEmail },
            });

            email = newEmail;
        }

        // Generate a new verification token
        const token = randomBytes(32).toString('hex');
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 24); // Token valid for 24 hours

        // Save the new token
        await prisma.client.update({
            where: { id: client.id },
            data: {
                verificationToken: token,
                verificationTokenExpires: tokenExpires,
            },
        });

        // Send the verification email
        await sendEmailVerification(email, client.username, token);

        // TODO : Log the activity
        // await trackAction(
        //   {
        //     clientId: client.id,
        //     action: Actions.VERIFICATION_EMAIL_SENT,
        //     metadata: { email }
        //   }
        // );

        return NextResponse.json({
            success: true,
            message: "Verification email sent successfully"
        });
    } catch (error) {
        console.error("Error sending verification email:", error);
        return NextResponse.json(
            { error: "An error occurred while sending the verification email" },
            { status: 500 }
        );
    }
}