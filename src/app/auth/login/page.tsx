"use client";

import { AlertTriangle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthLayout } from "../components/auth-layout";

// Client-side login schema - should match server validation
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
  remember: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setLoginError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        document.cookie = `auth-token=${
          data.token
        }; path=/; expires=${expirationDate.toUTCString()}; SameSite=Strict; Secure`;

        toast({
          title: "Login successful",
          description: "You are now logged in.",
        });

        router.push("/explore");
      } else {
        // Handle rate limiting
        if (response.status === 429 && data.retryAfter) {
          setRetryAfter(data.retryAfter);
          setLoginError(
            `Trop de tentatives de connexion. Veuillez réessayer dans ${data.retryAfter} minutes.`
          );
        } else {
          // Generic error for all other failures to prevent enumeration
          setLoginError(
            "Identifiants de connexion invalides. Veuillez vérifier votre email et votre mot de passe."
          );
        }

        // Clear password field for security
        form.setValue("password", "");
      }
    } catch (error) {
      setLoginError("An error occurred. Please try again later.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Se connecter à Vetanytime"
      description="Ravi de vous revoir ! Veuillez entrer vos identifiants pour continuer."
    >
      {loginError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
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
                    autoComplete="current-password"
                    disabled={isLoading || !!retryAfter}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between items-center">
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0 ">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading || !!retryAfter}
                    />
                  </FormControl>
                  <FormLabel>Se souvenir de moi</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Link
              prefetch
              href="/auth/forgot-password"
              className="text-black  text-sm hover:underline"
            >
              Mot de passe oublié?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !!retryAfter}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </Button>

          {retryAfter && (
            <p className="text-sm text-center text-muted-foreground">
              Le compte est temporairement verrouillé. Veuillez réessayer dans{" "}
              {retryAfter} minutes.
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
        {isLoading ? "Signing in..." : "Se connecter avec Google"}
      </Button>
      <div className="mt-4 text-sm text-center">
        {"Pas de compte ? "}
        <Link
          href="/auth/register"
          className="text-primary hover:underline"
          prefetch
        >
          {"S'inscrire"}
        </Link>
      </div>
    </AuthLayout>
  );
}
