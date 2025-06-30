/**
 * Utilities for password validation and security checks
 */

// Common password dictionary (abbreviated version - in production use a more comprehensive list)
const COMMON_PASSWORDS = new Set([
    "password", "123456", "12345678", "qwerty", "abc123", "monkey", "letmein",
    "trustno1", "dragon", "baseball", "football", "iloveyou", "admin", "welcome",
    "monkey", "login", "abc123", "starwars", "123123", "pokemon", "qwerty123",
    "sunshine", "password1", "ashley", "bailey", "passw0rd", "shadow", "superman",
    "qazwsx", "michael", "football", "baseball", "welcome", "jesus", "ninja",
    "mustang", "password123", "adobe123", "azerty", "photoshop", "princess",
    "000000", "654321", "matthew", "batman", "access", "master", "flower",
]);

/**
 * Check if a password is in the list of common passwords
 */
export function isCommonPassword(password: string): boolean {
    const normalizedPassword = password.toLowerCase();
    return COMMON_PASSWORDS.has(normalizedPassword);
}

/**
 * Calculate password strength on a scale of 0-100
 */
export function calculatePasswordStrength(password: string): number {
    if (!password) {
        return 0;
    }

    // Start with a base score
    let strength = 0;

    // Length-based scoring (30%)
    if (password.length >= 8) strength += 10;
    if (password.length >= 12) strength += 10;
    if (password.length >= 16) strength += 10;

    // Character variety scoring (45%)
    if (/[A-Z]/.test(password)) strength += 10; // Has uppercase
    if (/[a-z]/.test(password)) strength += 10; // Has lowercase
    if (/[0-9]/.test(password)) strength += 10; // Has number
    if (/[^A-Za-z0-9]/.test(password)) strength += 15; // Has special character

    // Complexity scoring (25%)
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/.test(password)) {
        strength += 15; // Has all character types and is at least 10 chars
    }

    // Pattern penalties
    if (/(.)\1{2,}/.test(password)) strength -= 10; // Penalize repeating characters (aaa)
    if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
        strength -= 10; // Penalize sequential letters
    }
    if (/(?:012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210)/.test(password)) {
        strength -= 10; // Penalize sequential numbers
    }

    // Common password check
    if (isCommonPassword(password)) {
        strength -= 25; // Major penalty for common passwords
    }

    // Ensure the value is between 0 and 100
    return Math.max(0, Math.min(100, strength));
}

/**
 * Get descriptive feedback about password strength
 */
export function getPasswordFeedback(password: string): { strength: number; feedback: string; color: string } {
    const strength = calculatePasswordStrength(password);
    let feedback: string;
    let color: string;

    if (strength < 20) {
        feedback = "Very weak: This password is extremely vulnerable to being cracked.";
        color = "text-red-700";
    } else if (strength < 40) {
        feedback = "Weak: This password needs significant improvement.";
        color = "text-red-500";
    } else if (strength < 60) {
        feedback = "Moderate: While better, this password could be stronger.";
        color = "text-amber-500";
    } else if (strength < 80) {
        feedback = "Strong: This is a good password.";
        color = "text-green-500";
    } else {
        feedback = "Very strong: Excellent password choice!";
        color = "text-green-700";
    }

    // Add specific improvement suggestions
    if (password.length < 12) {
        feedback += " Consider using a longer password.";
    }
    if (!/[A-Z]/.test(password)) {
        feedback += " Add uppercase letters.";
    }
    if (!/[a-z]/.test(password)) {
        feedback += " Add lowercase letters.";
    }
    if (!/[0-9]/.test(password)) {
        feedback += " Add numbers.";
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        feedback += " Add special characters.";
    }
    if (/(.)\1{2,}/.test(password)) {
        feedback += " Avoid repeating characters.";
    }
    if (isCommonPassword(password)) {
        feedback += " This is a commonly used password and should be avoided.";
    }

    return { strength, feedback, color };
}

/**
 * Check if a password has been previously breached using a hash prefix approach
 * Note: In a real implementation, this would call an API like "Have I Been Pwned"
 * This is a simplified implementation for demonstration purposes
 */
export async function checkPasswordBreached(password: string): Promise<boolean> {
    // In a real implementation, you would:
    // 1. Hash the password using SHA-1
    // 2. Take the first 5 characters of the hash
    // 3. Send this prefix to an API like HIBP
    // 4. Check if the remainder of the hash appears in the response

    // This is a stub implementation for demonstration
    return isCommonPassword(password);
}

/**
 * Generate a cryptographically secure random password
 */
export function generateStrongPassword(length = 16): string {
    if (typeof window === 'undefined') {
        // Server-side implementation
        return require('crypto').randomBytes(length)
            .toString('base64')
            .slice(0, length)
            .replace(/\+/g, '@')
            .replace(/\//g, '$');
    } else {
        // Client-side implementation
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);

        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars[array[i] % chars.length];
        }

        return password;
    }
}