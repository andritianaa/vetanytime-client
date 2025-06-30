// src/lib/security-monitor.ts
import { Logger } from '@/lib/error-logger';
import { getLoginRateLimiter, getRateLimitKey } from '@/lib/rate-limit';

interface SecurityCheckOptions {
    ip: string;
    action: 'login' | 'register' | 'reset-password' | 'forgot-password';
    identifierHint?: string; // Partial identity hint like email prefix or username prefix
    clientAgent?: string;
}

interface SecurityCheckResult {
    allow: boolean;
    reason?: string;
    retryAfter?: number; // in minutes
}

/**
 * Security check function that combines rate limiting and other security measures
 * This provides a more comprehensive approach than just rate limiting
 */
export async function checkSecurityRules(options: SecurityCheckOptions): Promise<SecurityCheckResult> {
    const { ip, action, identifierHint, clientAgent = '' } = options;

    // Generate a key for rate limiting
    const rateLimitKey = identifierHint
        ? getRateLimitKey(ip, `${action}-${identifierHint}`)
        : getRateLimitKey(ip, action);

    // Get rate limiter for this action
    const rateLimiter = getLoginRateLimiter();

    // Check current rate limit status
    const rateLimitResult = rateLimiter.check(rateLimitKey);

    // If rate limited, return early with retry info
    if (!rateLimitResult.success) {
        const retryAfterMinutes = Math.ceil(
            (rateLimitResult.resetTime.getTime() - Date.now()) / 60000
        );

        // Log suspicious activity if needed
        if (rateLimitResult.isBlocked) {
            await Logger.warn(`Blocked ${action} attempt due to rate limiting`, {
                ip,
                action,
                identifierHint: identifierHint ? `${identifierHint.substring(0, 3)}***` : undefined,
                clientAgent: clientAgent ? clientAgent.substring(0, 50) : undefined,
                retryAfter: retryAfterMinutes,
                tags: ['security', 'rate-limit', 'block'],
            });
        }

        return {
            allow: false,
            reason: 'rate_limit_exceeded',
            retryAfter: retryAfterMinutes
        };
    }

    // Check for additional security rules

    // 1. Suspicious client agent patterns
    const suspiciousAgentPatterns = [
        /bot/i,
        /crawl/i,
        /spider/i,
        /curl/i,
        /wget/i,
        /^$/,  // Empty client agent
        /python/i,
        /http/i
    ];

    const isSuspiciousAgent = clientAgent &&
        suspiciousAgentPatterns.some(pattern => pattern.test(clientAgent));

    if (isSuspiciousAgent) {
        // Block and log suspicious client agent
        rateLimiter.block(rateLimitKey, 3600000); // 1 hour block

        await Logger.warn(`Blocked ${action} attempt due to suspicious client agent`, {
            ip,
            action,
            clientAgent: clientAgent ? clientAgent.substring(0, 100) : undefined,
            tags: ['security', 'suspicious-agent', 'block'],
        });

        return {
            allow: false,
            reason: 'suspicious_client_agent',
            retryAfter: 60 // 1 hour in minutes
        };
    }

    // 2. Known malicious IP check (in a real implementation, this would use a blocklist service)
    // This is just a placeholder for demonstration
    const knownMaliciousIPs = [
        '0.0.0.0', // Example placeholder
    ];

    if (knownMaliciousIPs.includes(ip)) {
        // Permanently block known bad actors
        rateLimiter.block(rateLimitKey, 86400000); // 24 hour block

        await Logger.warn(`Blocked ${action} attempt from known malicious IP`, {
            ip,
            action,
            tags: ['security', 'malicious-ip', 'block'],
        });

        return {
            allow: false,
            reason: 'blocked_ip',
            retryAfter: 1440 // 24 hours in minutes
        };
    }

    // 3. Check for multiple failed attempts across different accounts
    // This can indicate a password spraying attack
    // In a real implementation, you would maintain a shared memory store or database table for this

    // All checks passed, allow the request
    return {
        allow: true
    };
}

/**
 * Track failed authentication attempts for potential threat detection
 */
export async function trackFailedAttempt(options: {
    ip: string;
    action: 'login' | 'register' | 'reset-password';
    identifierHint?: string;
    clientAgent?: string;
    failReason?: string;
}): Promise<void> {
    const { ip, action, identifierHint, clientAgent, failReason } = options;

    // Log the failed attempt
    await Logger.info(`Failed ${action} attempt`, {
        ip,
        action,
        identifierHint: identifierHint ? `${identifierHint.substring(0, 3)}***` : undefined,
        clientAgent: clientAgent ? clientAgent.substring(0, 50) : undefined,
        failReason,
        tags: ['security', 'auth-failure'],
    });

    // Generate a key for tracking failures for this IP address
    const ipKey = getRateLimitKey(ip, 'failures');

    // Get rate limiter
    const rateLimiter = getLoginRateLimiter();

    // Check if this IP is already at the threshold
    const result = rateLimiter.check(ipKey);

    // If we're approaching the limit (80% of max attempts), start being more aggressive
    if (result.remaining <= 2) { // Assuming a limit of 10, this would trigger at 8 attempts
        // Increase blocking duration based on number of failures
        const blockDuration = 15 * 60 * 1000; // 15 minutes

        await Logger.warn(`Multiple failed ${action} attempts detected`, {
            ip,
            action,
            remainingAttempts: result.remaining,
            tags: ['security', 'brute-force-suspect'],
        });

        // If no attempts remaining, block the IP from all authentication actions
        if (result.remaining === 0) {
            // Block for all auth actions
            rateLimiter.block(getRateLimitKey(ip, 'login'), blockDuration);
            rateLimiter.block(getRateLimitKey(ip, 'register'), blockDuration);
            rateLimiter.block(getRateLimitKey(ip, 'reset-password'), blockDuration);
            rateLimiter.block(getRateLimitKey(ip, 'forgot-password'), blockDuration);

            await Logger.warn(`Blocked IP due to multiple failed attempts`, {
                ip,
                action,
                blockDuration: blockDuration / 60000, // in minutes
                tags: ['security', 'brute-force-block'],
            });
        }
    }
}

/**
 * Track successful authentication for security monitoring
 */
export async function trackSuccessfulAuth(options: {
    ip: string;
    action: 'login' | 'register' | 'reset-password';
    clientId: string;
    clientAgent?: string;
}): Promise<void> {
    const { ip, action, clientId, clientAgent } = options;

    // Log the successful attempt
    await Logger.info(`Successful ${action}`, {
        ip,
        action,
        clientId,
        clientAgent: clientAgent ? clientAgent.substring(0, 50) : undefined,
        tags: ['security', 'auth-success'],
    });

    // Reset any rate limit counters for this IP to prevent false positives
    const rateLimiter = getLoginRateLimiter();
    const ipKey = getRateLimitKey(ip, 'failures');
    rateLimiter.reset(ipKey);
}

/**
 * Validate the client's password against known breached password databases
 * In a production environment, this would call an API like "Have I Been Pwned"
 */
export async function checkPasswordBreached(password: string): Promise<boolean> {
    // In a real implementation, you would:
    // 1. Hash the password using SHA-1
    // 2. Take the first 5 characters of the hash
    // 3. Send this prefix to the HIBP API
    // 4. Check if the remainder of the hash appears in the response

    // This is a simplified implementation for demonstration
    // It just checks against our local list of common passwords

    // Import the isCommonPassword function
    const { isCommonPassword } = await import('@/utils/password-utils');
    return isCommonPassword(password);
}