"use client";

import { AlertTriangle, Check, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { checkUsernameAvalability } from '@/actions/user.ations';
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

// Client-side registration schema - should align with server validation
const registerSchema = z.object({
  username: z
    .string()
    .min(3, {
      message: "Le nom d'utilisateur doit comporter au moins 3 caractères.",
    })
    .max(30, {
      message: "Le nom d'utilisateur ne peut pas dépasser 30 caractères.",
    })
    .regex(/^[a-zA-Z0-9_.-]+$/, {
      message:
        "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres, des underscores (_), des points (.) et des tirets (-).",
    }),
  email: z
    .string()
    .email({ message: "Veuillez entrer une adresse e-mail valide." }),
  password: z
    .string()
    .min(8, {
      message: "Le mot de passe doit comporter au moins 8 caractères.",
    })
    .max(100, {
      message: "Le mot de passe ne peut pas dépasser 100 caractères.",
    })
    .regex(/[A-Z]/, {
      message: "Le mot de passe doit contenir au moins une lettre majuscule.",
    })
    .regex(/[a-z]/, {
      message: "Le mot de passe doit contenir au moins une lettre minuscule.",
    })
    .regex(/[0-9]/, {
      message: "Le mot de passe doit contenir au moins un chiffre.",
    }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
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

  // Username availability check
  useEffect(() => {
    const checkUsername = async () => {
      const username = form.watch("username");

      if (
        username &&
        username.length >= 3 &&
        /^[a-zA-Z0-9_.-]+$/.test(username)
      ) {
        setUsernameCheckLoading(true);
        try {
          const response = await checkUsernameAvalability(username);
          setUsernameAvailable(response);
        } catch (error) {
          console.error("Error checking username:", error);
          setUsernameAvailable(null);
        } finally {
          setUsernameCheckLoading(false);
        }
      } else {
        setUsernameAvailable(null);
      }
    };

    const timeout = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeout);
  }, [form.watch("username")]);

  // Form submission
  async function onSubmit(values: RegisterFormValues) {
    if (!usernameAvailable) {
      form.setError("username", {
        type: "manual",
        message: "This username is already taken.",
      });
      return;
    }

    setIsLoading(true);
    setRegisterError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          username: values.username,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        document.cookie = `auth-token=${
          data.token
        }; path=/; expires=${expirationDate.toUTCString()}; SameSite=Strict; Secure`;

        toast({
          title: "Inscription réussie",
          description:
            "Votre compte a été créé. Veuillez vérifier votre adresse e-mail.",
        });

        router.push("/explore");
      } else {
        // Handle rate limiting
        if (response.status === 429 && data.retryAfter) {
          setRetryAfter(data.retryAfter);
          setRegisterError(
            `Trop de tentatives d'inscription. Veuillez réessayer dans ${data.retryAfter} minutes.`
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
          setRegisterError("Please correct the errors in the form.");
        } else {
          // Generic error
          setRegisterError(
            data.error || "Registration failed. Please try again."
          );
        }
      }
    } catch (error) {
      setRegisterError("An error occurred. Please try again later.");
      console.error("Registration error:", error);
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

  return (
    <AuthLayout
      title="Créer un compte"
      description="Ravi de vous accueillir ! Veuillez entrer vos identifiants pour continuer."
    >
      {registerError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{registerError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom*</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="Entrez votre nom"
                      {...field}
                      disabled={isLoading || !!retryAfter}
                      className="pr-10"
                    />
                  </FormControl>
                  {usernameCheckLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  )}
                  {usernameAvailable !== null && !usernameCheckLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameAvailable ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Entrez votre addresse e-mail"
                    {...field}
                    type="email"
                    autoComplete="email"
                    disabled={isLoading || !!retryAfter}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
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
                      <span>Faible</span>
                      <span>Fort</span>
                    </div>
                  </>
                )}
                <FormDescription className="flex items-center gap-1">
                  Le mot de passe doit comporter au moins 8 caractères et
                  inclure des majuscules, des minuscules, des chiffres et des
                  caractères spéciaux.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !!retryAfter}
          >
            {isLoading ? "Inscription..." : "S'inscrire"}
          </Button>

          {retryAfter && (
            <p className="text-sm text-center text-muted-foreground">
              Trop de tentatives. Veuillez réessayer dans {retryAfter} minutes.
            </p>
          )}
        </form>
      </Form>
      <Button
        className="w-full bg-white text-black mt-4"
        variant={"outline"}
        disabled={isLoading || !!retryAfter}
      >
        <Image
          src={"/media/logo-google.png"}
          width={36}
          height={36}
          alt="logo google"
          className="size-6"
        />
        {isLoading ? "Connexion..." : "S'inscrire avec Google"}
      </Button>
      <div className="mt-4 text-sm text-center">
        Déjà inscrit ?{" "}
        <Link href="/auth/login" className="text-primary hover:underline">
          Se connecter
        </Link>
      </div>
    </AuthLayout>
  );
}
