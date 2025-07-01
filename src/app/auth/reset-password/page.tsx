"use client";

import { AlertTriangle, Check, Info } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthLayout } from '../components/auth-layout';

// Client-side validation schema - should align with server validation
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters.",
      })
      .max(100, {
        message: "Password cannot exceed 100 characters.",
      })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter.",
      })
      .regex(/[0-9]/, {
        message: "Password must contain at least one number.",
      })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [resetSuccess, setResetSuccess] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Password strength calculation
  useEffect(() => {
    const password = form.watch("password");
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;

    // Length check (up to 30%)
    if (password.length >= 8) strength += 10;
    if (password.length >= 12) strength += 10;
    if (password.length >= 16) strength += 10;

    // Character variety checks (up to 70%)
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    if (/(.)\1\1\1/.test(password)) strength -= 10; // Penalize repeating characters

    // Ensure the value is between 0 and 100
    setPasswordStrength(Math.max(0, Math.min(100, strength)));
  }, [form.watch("password")]);

  async function onSubmit(values: ResetPasswordFormValues) {
    setIsLoading(true);
    setError(null);

    const token = searchParams.get("token");
    if (!token) {
      setError("Reset token is missing.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: values.password,
          confirmPassword: values.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess(true);
        toast({
          title: "Password reset successful",
          description:
            "Your password has been reset. You can now login with your new password.",
        });

        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        // Handle rate limiting
        if (response.status === 429 && data.retryAfter) {
          setRetryAfter(data.retryAfter);
          setError(
            `Too many password reset attempts. Please try again in ${data.retryAfter} minutes.`
          );
        } else if (data.details) {
          // Handle validation errors returned from server
          Object.entries(data.details).forEach(([field, messages]) => {
            if (field in form.formState.errors) {
              form.setError(field as any, {
                type: "manual",
                message: Array.isArray(messages)
                  ? messages[0]
                  : (messages as string),
              });
            }
          });
          setError("Please correct the errors in the form.");
        } else {
          // Handle other errors
          setError(
            data.error ||
              "Failed to reset password. The link may be invalid or expired."
          );
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again later.");
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Get color for password strength indicator
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return "bg-red-500";
    if (passwordStrength < 60) return "bg-amber-500";
    return "bg-green-500";
  };

  // Check if token is present
  useEffect(() => {
    if (!searchParams.get("token")) {
      setError(
        "Missing reset token. Please use the link from the reset email."
      );
    }
  }, [searchParams]);

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter a new password for your account"
    >
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {resetSuccess ? (
        <Alert
          variant="default"
          className="bg-green-50 text-green-700 border-green-200 mb-4"
        >
          <Check className="h-4 w-4" />
          <AlertDescription>
            Your password has been reset successfully. You will be redirected to
            the login page shortly.
          </AlertDescription>
        </Alert>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      autoComplete="new-password"
                      disabled={isLoading || !!retryAfter}
                    />
                  </FormControl>
                  {field.value && (
                    <>
                      <Progress
                        value={passwordStrength}
                        className={`h-1 w-full ${getPasswordStrengthColor()}`}
                      />
                      <div className="flex justify-between text-xs">
                        <span>Weak</span>
                        <span>Strong</span>
                      </div>
                    </>
                  )}
                  <FormDescription>
                    <div className="flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      <span>
                        Password must be at least 8 characters and include
                        uppercase, lowercase, numbers, and special characters.
                      </span>
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      autoComplete="new-password"
                      disabled={isLoading || !!retryAfter}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !!retryAfter || !searchParams.get("token")}
            >
              {isLoading ? "Resetting password..." : "Reset password"}
            </Button>

            {retryAfter && (
              <p className="text-sm text-center text-muted-foreground">
                Too many attempts. Please try again after {retryAfter} minutes.
              </p>
            )}
          </form>
        </Form>
      )}

      <div className="mt-4 text-sm text-center">
        <Button
          variant="link"
          className="p-0"
          onClick={() => router.push("/auth/login")}
        >
          Return to login
        </Button>
      </div>
    </AuthLayout>
  );
}
