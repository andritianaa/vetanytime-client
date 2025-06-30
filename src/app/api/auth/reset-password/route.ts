import { NextRequest, NextResponse } from 'next/server';

import { hashPassword } from '@/lib/auth';
import { getLoginRateLimiter, getRateLimitKey } from '@/lib/rate-limit';
import { resetPasswordSchema, validateInput } from '@/lib/validation';
import { prisma } from '@/prisma';

export async function POST(req: NextRequest) {
  try {
    // Extract client information
    const clientAgent = req.headers.get("client-agent") || "";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "0.0.0.0";

    // Check rate limiting to prevent brute forcing reset tokens
    const rateLimitKey = getRateLimitKey(ip, 'reset-password');
    const rateLimiter = getLoginRateLimiter();
    const rateLimitResult = rateLimiter.check(rateLimitKey);

    if (!rateLimitResult.success) {
      // Calculate minutes until reset
      const resetMinutes = Math.ceil(
        (rateLimitResult.resetTime.getTime() - Date.now()) / 60000
      );

      return NextResponse.json(
        {
          error: "Too many password reset attempts. Please try again later.",
          retryAfter: resetMinutes
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(resetMinutes * 60) // in seconds
          }
        }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const validationResult = validateInput(resetPasswordSchema, body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request. Please ensure your password meets the requirements.",
          details: validationResult.error
        },
        { status: 400 }
      );
    }

    if (!validationResult.data) {
      return NextResponse.json(
        { error: "Invalid request. Please ensure your password meets the requirements." },
        { status: 400 }
      );
    }
    const { token, password } = validationResult.data;

    // Find reset request
    const resetRequest = await prisma.passwordReset.findUnique({
      where: { token },
    });

    // Check if token exists and is valid
    if (!resetRequest || resetRequest.expires < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired password reset link. Please request a new one." },
        { status: 400 }
      );
    }

    // Find the client
    const client = await prisma.client.findUnique({
      where: { email: resetRequest.email },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Invalid or expired password reset link. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update the client's password
    await prisma.client.update({
      where: { id: client.id },
      data: { password: hashedPassword },
    });

    // Delete the token
    await prisma.passwordReset.delete({
      where: { token },
    });


    // Reset rate limit counter for this IP after successful password reset
    rateLimiter.reset(rateLimitKey);

    // Return success response
    return NextResponse.json({
      message: "Your password has been successfully reset. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      { error: "An error occurred while resetting your password. Please try again." },
      { status: 500 }
    );
  }
}