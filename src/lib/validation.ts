import { z } from 'zod';

// Username validation schema
export const usernameSchema = z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(30, { message: "Username cannot exceed 30 characters" })
    .regex(/^[a-zA-Z0-9_.-]+$/, {
        message: "Username can only contain letters, numbers, underscores, dots, and hyphens"
    });

// Email validation schema with strict requirements
export const emailSchema = z
    .string()
    .email({ message: "Please enter a valid email address" })
    .refine((email) => {
        // Additional email validation rules
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }, { message: "Please enter a valid email address" });

// Password validation schema with strong requirements
export const passwordSchema = z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(100, { message: "Password cannot exceed 100 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" });

// Login validation schema
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, { message: "Password is required" }),
    remember: z.boolean().optional().default(false),
});

// Registration validation schema
export const registerSchema = z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
});

// Password reset request schema
export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

// Password reset schema
export const resetPasswordSchema = z
    .object({
        token: z.string().min(1, { message: "Token is required" }),
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

// Email change schema
export const emailChangeSchema = z.object({
    newEmail: emailSchema,
});

// Common validation function
export function validateInput<T>(schema: z.ZodType<T>, data: unknown): {
    success: boolean;
    data?: T;
    error?: string | Record<string, string[]>;
} {
    try {
        const validatedData = schema.parse(data);
        return { success: true, data: validatedData };
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Format Zod errors into a more usable structure
            const formattedErrors: Record<string, string[]> = {};

            error.errors.forEach((err) => {
                const path = err.path.join('.');
                if (!formattedErrors[path]) {
                    formattedErrors[path] = [];
                }
                formattedErrors[path].push(err.message);
            });

            return { success: false, error: formattedErrors };
        }

        return { success: false, error: "Validation failed" };
    }
}