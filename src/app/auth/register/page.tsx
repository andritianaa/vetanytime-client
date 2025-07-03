"use client";

import { AlertTriangle, Check, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { checkEmailAvailability, checkUsernameAvalability } from '@/actions/user.ations';
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

// Client-side registration schema
const registerSchema = z.object({
  username: z
    .string()
    .min(3, {
      message: "Le nom d'utilisateur doit comporter au moins 3 caractères.",
    })
    .max(30, {
      message: "Le nom d'utilisateur ne peut pas dépasser 30 caractères.",
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

  // Username availability state
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);

  // Email availability state
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);

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
    if (password.length >= 8) strength += 10;
    if (password.length >= 12) strength += 10;
    if (password.length >= 16) strength += 10;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    if (/(.)\1\1\1/.test(password)) strength -= 10;

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

  // Email availability check
  useEffect(() => {
    const checkEmail = async () => {
      const email = form.watch("email");
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailCheckLoading(true);
        try {
          const response = await checkEmailAvailability(email);
          setEmailAvailable(response);
        } catch (error) {
          console.error("Error checking email:", error);
          setEmailAvailable(null);
        } finally {
          setEmailCheckLoading(false);
        }
      } else {
        setEmailAvailable(null);
      }
    };

    const timeout = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeout);
  }, [form.watch("email")]);

  // Form submission
  async function onSubmit(values: RegisterFormValues) {
    // Check availability before submitting
    if (usernameAvailable === false) {
      form.setError("username", {
        type: "manual",
        message: "Ce nom d'utilisateur est déjà pris.",
      });
      return;
    }

    if (emailAvailable === false) {
      form.setError("email", {
        type: "manual",
        message: "Cette adresse e-mail est déjà utilisée.",
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
        } else if (data.fieldErrors) {
          // Handle field-specific errors from server
          Object.entries(data.fieldErrors).forEach(([field, messages]) => {
            if (field in values) {
              form.setError(field as keyof RegisterFormValues, {
                type: "manual",
                message: Array.isArray(messages)
                  ? messages[0]
                  : (messages as string),
              });
            }
          });
          setRegisterError("Veuillez corriger les erreurs dans le formulaire.");
        } else {
          // Generic error
          setRegisterError(
            data.error || "L'inscription a échoué. Veuillez réessayer."
          );
        }
      }
    } catch (error) {
      setRegisterError(
        "Une erreur s'est produite. Veuillez réessayer plus tard."
      );
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return "bg-red-500";
    if (passwordStrength < 60) return "bg-amber-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 30) return "Faible";
    if (passwordStrength < 60) return "Moyen";
    return "Fort";
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
                <FormLabel>Nom d'utilisateur*</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="Entrez votre nom d'utilisateur"
                      {...field}
                      disabled={isLoading || !!retryAfter}
                      className="pr-10"
                    />
                  </FormControl>
                  {usernameCheckLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  )}
                  {usernameAvailable !== null &&
                    !usernameCheckLoading &&
                    field.value.length >= 3 && (
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
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="Entrez votre adresse e-mail"
                      {...field}
                      type="email"
                      autoComplete="email"
                      disabled={isLoading || !!retryAfter}
                      className="pr-10"
                    />
                  </FormControl>
                  {emailCheckLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  )}
                  {emailAvailable !== null &&
                    !emailCheckLoading &&
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value) && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {emailAvailable ? (
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe*</FormLabel>
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
                  <div className="space-y-2">
                    <Progress value={passwordStrength} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span
                        className={`${
                          passwordStrength < 30
                            ? "text-red-500"
                            : passwordStrength < 60
                            ? "text-amber-500"
                            : "text-green-500"
                        }`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                      <span className="text-muted-foreground">
                        {passwordStrength}%
                      </span>
                    </div>
                  </div>
                )}
                <FormDescription>
                  Le mot de passe doit comporter au moins 8 caractères et
                  inclure des majuscules, des minuscules et des chiffres.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading ||
              !!retryAfter ||
              usernameAvailable === false ||
              emailAvailable === false ||
              usernameCheckLoading ||
              emailCheckLoading
            }
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
