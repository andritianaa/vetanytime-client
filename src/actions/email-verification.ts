// src/actions/email-verification.ts
"use server";

import { randomBytes } from 'crypto';

import { trackAction } from '@/actions/tracking.actions';
import { sendEmailVerification } from '@/lib/mail';
import { SA } from '@/lib/safe-ation';
import { prisma } from '@/prisma';
import { Actions } from '@prisma/client';

/**
 * Generates and sends a verification email to a newly registered client
 */
export const sendVerificationEmail = async (clientId: string, email: string, username: string) => {
    // Generate a verification token
    const token = randomBytes(32).toString('hex');
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24); // Token valid for 24 hours

    // Save the token to the client
    await prisma.client.update({
        where: { id: clientId },
        data: {
            verificationToken: token,
            verificationTokenExpires: tokenExpires,
        },
    });

    // Send the verification email
    await sendEmailVerification(email, username, token);

    // Log the action
    await prisma.activity.create({
        data: {
            userId: clientId,
            action: Actions.VERIFICATION_EMAIL_SENT,
            metadata: { email },
        },
    });
};

/**
 * Verifies a client's email using a token
 * Cette fonction est utilisée directement par le Server Component
 */
export const verifyEmail = async (token: string) => {
    // Find client with this verification token that hasn't expired
    const client = await prisma.client.findFirst({
        where: {
            verificationToken: token,
            verificationTokenExpires: {
                gte: new Date(),
            },
        },
    });

    if (!client) {
        throw new Error("Invalid or expired verification token");
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

    // Log the activity
    await prisma.activity.create({
        data: {
            userId: client.id,
            action: Actions.EMAIL_VERIFIED,
            metadata: { email: client.email },
        },
    });

    return client;
};

/**
 * Resends a verification email to the client
 */
export const resendVerificationEmail = SA(async (session, newEmail?: string) => {
    // Don't send if already verified
    if (session.user.isEmailVerified) {
        throw new Error("Your email is already verified");
    }

    let email = session.user.email;

    // If a new email is provided, update the client's email
    if (newEmail && newEmail !== email) {
        // Check if new email is already in use
        const existingClient = await prisma.client.findUnique({
            where: { email: newEmail },
        });

        if (existingClient) {
            throw new Error("This email is already in use");
        }

        // Update the client's email
        await prisma.client.update({
            where: { id: session.user.id },
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
        where: { id: session.user.id },
        data: {
            verificationToken: token,
            verificationTokenExpires: tokenExpires,
        },
    });

    // Send the verification email
    await sendEmailVerification(email, session.user.username, token);

    // Log the activity
    await trackAction(Actions.VERIFICATION_EMAIL_SENT, { email });

    return { success: true };
});