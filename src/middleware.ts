import { NextResponse } from 'next/server';

import { getLoginRateLimiter, getRateLimitKey } from './lib/rate-limit';

import type { NextRequest } from 'next/server';
// Paths that should be rate-limited
const RATE_LIMITED_PATHS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
];

// Middleware function
export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Only apply rate limiting to specific API routes
    if (RATE_LIMITED_PATHS.some(route => path.startsWith(route))) {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            '0.0.0.0';

        // Generate a key based on the IP and path
        const rateLimitKey = getRateLimitKey(ip, path);

        // Get rate limiter
        const rateLimiter = getLoginRateLimiter();

        // Check rate limit
        const rateLimitResult = rateLimiter.check(rateLimitKey);

        if (!rateLimitResult.success) {
            // Calculate retry-after time in seconds
            const retryAfterSeconds = Math.ceil(
                (rateLimitResult.resetTime.getTime() - Date.now()) / 1000
            );

            // Return rate limit response
            return new NextResponse(
                JSON.stringify({
                    error: 'Too many requests',
                    retryAfter: Math.ceil(retryAfterSeconds / 60), // in minutes
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': String(retryAfterSeconds),
                        'X-RateLimit-Limit': String(rateLimitResult.limit),
                        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                        'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetTime.getTime() / 1000)),
                    },
                }
            );
        }
    }

    // Continue to the route handler if rate limit is not exceeded
    return NextResponse.next();
}

// Define which routes this middleware should run on
export const config = {
    matcher: [
        '/api/auth/:path*',
    ],
};