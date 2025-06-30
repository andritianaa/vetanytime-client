import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { sendResetEmail } from '@/lib/mail';
import { getLoginRateLimiter, getRateLimitKey } from '@/lib/rate-limit';
import { forgotPasswordSchema, validateInput } from '@/lib/validation';
import { prisma } from '@/prisma';

export async function POST(req: NextRequest) {
  try {
    // Extract client information
    const clientAgent = req.headers.get("client-agent") || "";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "0.0.0.0";

    // Check rate limiting for password reset to prevent enumeration and abuse
    const rateLimitKey = getRateLimitKey(ip, 'forgot-password');
    const rateLimiter = getLoginRateLimiter();
    const rateLimitResult = rateLimiter.check(rateLimitKey);

    if (!rateLimitResult.success && process.env.NODE_ENV != 'development') {
      // Calculate minutes until reset
      const resetMinutes = Math.ceil(
        (rateLimitResult.resetTime.getTime() - Date.now()) / 60000
      );

      return NextResponse.json(
        {
          message: "If the provided email exists in our system, a password reset link will be sent.",
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
    const validationResult = validateInput(forgotPasswordSchema, body);

    if (!validationResult.success) {
      // Don't reveal validation errors, return generic message
      return NextResponse.json({
        message: "If the provided email exists in our system, a password reset link will be sent.",
      });
    }

    if (!validationResult.data) {
      return NextResponse.json(
        { error: "Invalid request. Please ensure your password meets the requirements." },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Find client without revealing if it exists
    const client = await prisma.client.findUnique({ where: { email } });

    // Generate and send reset token only if client exists, but don't reveal this in the response
    if (client) {
      // Generate a token with high entropy
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 3600000); // 1 hour expiration

      // Delete any existing tokens for this email
      await prisma.passwordReset.deleteMany({
        where: { email },
      });

      // Create new reset record
      await prisma.passwordReset.create({
        data: {
          email,
          token,
          expires,
        },
      });


      // Send the reset email
      await sendResetEmail(email, token);
    } else {
      // Simulate the delay of sending an email for timing attack prevention
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 500));
    }

    // Return the same message regardless of whether the client exists
    return NextResponse.json({
      message: "If the provided email exists in our system, a password reset link will be sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      { message: "If the provided email exists in our system, a password reset link will be sent." },
      { status: 200 } // Still return 200 to prevent enumeration
    );
  }
}