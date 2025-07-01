import { NextRequest, NextResponse } from 'next/server';

import { generateToken, verifyPassword } from '@/lib/auth';
import { getDeviceInfo } from '@/lib/device';
import { Logger } from '@/lib/error-logger';
import {
    checkSecurityRules, trackFailedAttempt, trackSuccessfulAuth
} from '@/lib/security-monitor';
import { loginSchema, validateInput } from '@/lib/validation';
import { prisma } from '@/prisma';
import { Actions } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    // Extract client information
    const clientAgent = req.headers.get("client-agent") || "";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "0.0.0.0";

    // Parse request body
    const body = await req.json();

    // Validate input data
    const validationResult = validateInput(loginSchema, body);
    if (!validationResult.success || !validationResult.data) {
      // Log validation failure without details for security
      await Logger.info("Login validation failed", {
        ip,
        clientAgent: clientAgent.substring(0, 50),
        tags: ["auth", "validation-error"],
      });

      return NextResponse.json(
        { error: "Invalid login credentials" },
        { status: 400 }
      );
    }

    const { email, password, remember } = validationResult.data;

    // Perform enhanced security checks
    // Using just the email prefix to avoid storing full emails in logs
    const emailPrefix = email.split('@')[0].slice(0, 3);

    const securityCheck = await checkSecurityRules({
      ip,
      action: 'login',
      identifierHint: emailPrefix,
      clientAgent,
    });

    if (!securityCheck.allow && process.env.NODE_ENV != 'development') {
      // Return generic error with retry information if available
      if (securityCheck.retryAfter) {
        return NextResponse.json(
          {
            error: "Too many login attempts. Please try again later.",
            retryAfter: securityCheck.retryAfter
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(securityCheck.retryAfter * 60) // in seconds
            }
          }
        );
      }

      return NextResponse.json(
        { error: "Access denied for security reasons." },
        { status: 403 }
      );
    }

    // Find client by email but don't leak that we found or didn't find the client
    const client = await prisma.client.findUnique({
      where: { email },
    });

    // If client not found or password is invalid, track the failure
    if (!client) {
      await trackFailedAttempt({
        ip,
        action: 'login',
        identifierHint: emailPrefix,
        clientAgent,
        failReason: 'client_not_found',
      });

      // Generic message to client - doesn't reveal if email exists
      return NextResponse.json(
        { error: "Invalid login credentials" },
        { status: 400 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, client.password);
    if (!isValid) {
      await trackFailedAttempt({
        ip,
        action: 'login',
        identifierHint: emailPrefix,
        clientAgent,
        failReason: 'invalid_password',
      });

      // Generic message to client
      return NextResponse.json(
        { error: "Invalid login credentials" },
        { status: 400 }
      );
    }

    // If we reach here, authentication was successful

    // Track successful authentication
    await trackSuccessfulAuth({
      ip,
      action: 'login',
      clientId: client.id,
      clientAgent,
    });

    // Generate token for session
    const token = generateToken(client.id);

    // Get device info for tracking
    const deviceInfo = await getDeviceInfo(clientAgent, ip);

    // Create new session
    const session = await prisma.clientSession.create({
      data: {
        token,
        userId: client.id,
        ...deviceInfo,
      },
    });

    // Record login activity
    await prisma.activity.create({
      data: {
        userId: client.id,
        sessionId: session.id,
        action: Actions.LOGIN_SUCCESS,
        metadata: {
          ip,
          deviceType: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          rememberMe: !!remember,
        },
      },
    });

    // Return success response
    return NextResponse.json({
      token,
      client: {
        id: client.id,
        email: client.email,
        isEmailVerified: client.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    // Log the error for internal tracking
    await Logger.error("Login error", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      tags: ["auth", "login", "error"],
    });

    return NextResponse.json(
      { error: "An error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}