import { LRUCache } from 'lru-cache';

// Interface for our rate limit configuration
interface RateLimitOptions {
    // Number of requests allowed in the window
    requestLimit: number;
    // Time window in seconds
    windowMs: number;
}

// Interface for our rate limit response
interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    resetTime: Date;
    isBlocked: boolean;
}

// Class to handle rate limiting
export class RateLimiter {
    private cache: LRUCache<string, { count: number; resetTime: number; blocked: boolean }>;
    private requestLimit: number;
    private windowMs: number;

    constructor(options: RateLimitOptions) {
        this.requestLimit = options.requestLimit;
        this.windowMs = options.windowMs * 1000; // Convert to milliseconds

        this.cache = new LRUCache({
            max: 5000, // Maximum number of items to store
            ttl: this.windowMs, // Time to live in milliseconds
            updateAgeOnGet: false, // Don't reset TTL on get
        });
    }

    public check(key: string): RateLimitResult {
        const now = Date.now();
        const record = this.cache.get(key) || { count: 0, resetTime: now + this.windowMs, blocked: false };

        // If the record has expired, reset it
        if (record.resetTime < now) {
            record.count = 0;
            record.resetTime = now + this.windowMs;
            record.blocked = false;
        }

        // Check if the key is blocked due to too many failed attempts
        if (record.blocked) {
            return {
                success: false,
                limit: this.requestLimit,
                remaining: 0,
                resetTime: new Date(record.resetTime),
                isBlocked: true,
            };
        }

        // Check if we've exceeded the limit
        const isRateLimited = record.count >= this.requestLimit;

        // If we've exceeded the limit, block this key for the remainder of the window
        if (isRateLimited && !record.blocked) {
            record.blocked = true;
            // For security, we double the block time after exceeding the limit
            record.resetTime = now + this.windowMs * 2;
        } else if (!isRateLimited) {
            // Increment the counter for this key
            record.count += 1;
        }

        // Store the updated record
        this.cache.set(key, record);

        return {
            success: !isRateLimited,
            limit: this.requestLimit,
            remaining: Math.max(0, this.requestLimit - record.count),
            resetTime: new Date(record.resetTime),
            isBlocked: record.blocked,
        };
    }

    public reset(key: string): void {
        this.cache.delete(key);
    }

    // Method to block a key immediately (e.g., after suspicious activity)
    public block(key: string, durationMs?: number): void {
        const now = Date.now();
        const blockDuration = durationMs || this.windowMs * 2;

        this.cache.set(key, {
            count: this.requestLimit,
            resetTime: now + blockDuration,
            blocked: true,
        });
    }
}

// Singleton instance for login rate limiting
let loginRateLimiter: RateLimiter;

// Factory function to get or create the login rate limiter
export function getLoginRateLimiter(): RateLimiter {
    if (!loginRateLimiter) {
        loginRateLimiter = new RateLimiter({
            requestLimit: 5, // 5 login attempts
            windowMs: 15 * 60, // 15 minutes
        });
    }
    return loginRateLimiter;
}

// Helper to generate a rate limit key from an IP and identifier (like email)
export function getRateLimitKey(ip: string, identifier?: string): string {
    if (identifier) {
        // Hash or obfuscate the identifier if needed for privacy
        return `${ip}:${identifier}`;
    }
    return ip;
}