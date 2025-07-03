import { NextRequest, NextResponse } from 'next/server';

import { sendVerificationEmail } from '@/actions/email-verification';
import { generateToken, hashPassword } from '@/lib/auth';
import { getDeviceInfo } from '@/lib/device';
import { Logger } from '@/lib/error-logger';
import { sendWelcomeEmail } from '@/lib/mail';
import {
    checkSecurityRules, trackFailedAttempt, trackSuccessfulAuth
} from '@/lib/security-monitor';
import { registerSchema, validateInput } from '@/lib/validation';
import { prisma } from '@/prisma';

export async function POST(req: NextRequest) {
  try {
    // Extract client information
    const clientAgent = req.headers.get("client-agent") || ""
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "0.0.0.0"

    // Perform enhanced security checks for registration
    const securityCheck = await checkSecurityRules({
      ip,
      action: "register",
      clientAgent,
    })

    const body = await req.json()

    if (!securityCheck.allow && process.env.NODE_ENV != "development") {
      if (securityCheck.retryAfter) {
        return NextResponse.json(
          {
            error: "Too many registration attempts. Please try again later.",
            retryAfter: securityCheck.retryAfter,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(securityCheck.retryAfter * 60),
            },
          },
        )
      }
      return NextResponse.json({ error: "Access denied for security reasons." }, { status: 403 })
    }

    // Validate input data
    const validationResult = validateInput(registerSchema, body)
    if (!validationResult.success || !validationResult.data) {
      await Logger.info("Registration validation failed", {
        ip,
        clientAgent: clientAgent.substring(0, 50),
        tags: ["auth", "validation-error", "register"],
      })

      return NextResponse.json(
        {
          error: "Validation failed",
          fieldErrors: validationResult.error,
        },
        { status: 400 },
      )
    }

    const { email, password, username } = validationResult.data

    // Check for existing email and username separately for better error messages
    const existingClientEmail = await prisma.client.findUnique({
      where: { email },
    })

    const existingClientUsername = await prisma.client.findUnique({
      where: { username },
    })

    // Create field-specific errors
    const fieldErrors: Record<string, string[]> = {}

    if (existingClientEmail) {
      fieldErrors.email = ["Cette adresse e-mail est déjà utilisée."]
    }

    if (existingClientUsername) {
      fieldErrors.username = ["Ce nom d'utilisateur est déjà pris."]
    }

    if (Object.keys(fieldErrors).length > 0) {
      await trackFailedAttempt({
        ip,
        action: "register",
        identifierHint: email.split("@")[0].slice(0, 3),
        clientAgent,
        failReason: existingClientEmail ? "email_exists" : "username_exists",
      })

      return NextResponse.json(
        {
          error: "Registration failed",
          fieldErrors,
        },
        { status: 400 },
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create client
    const client = await prisma.client.create({
      data: {
        email,
        username,
        password: hashedPassword,
        image: `https://api.dicebear.com/9.x/identicon/svg?seed=${email}&backgroundColor=ffffff`,
        isEmailVerified: false,
      },
    })

    try {
      // Send welcome email
      await sendWelcomeEmail(email, username)
      // Send verification email
      await sendVerificationEmail(client.id, email, username)
      // Track successful registration
      await trackSuccessfulAuth({
        ip,
        action: "register",
        clientId: client.id,
        clientAgent,
      })
    } catch (error) {
      console.log("Error sending emails:", error)
    }

    // Generate token and create session
    const token = generateToken(client.id)
    const deviceInfo = await getDeviceInfo(clientAgent, ip)

    await prisma.clientSession.create({
      data: {
        token,
        userId: client.id,
        ...deviceInfo,
      },
    })

    return NextResponse.json({
      message: "Client created successfully",
      clientId: client.id,
      token,
      client: {
        id: client.id,
        email: client.email,
        isEmailVerified: false,
      },
    })
  } catch (error) {
    console.error("Error creating client:", error)
    await Logger.error("Registration error", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      tags: ["auth", "register", "error"],
    })

    return NextResponse.json(
      { error: "An error occurred while creating your account. Please try again." },
      { status: 500 },
    )
  }
}
