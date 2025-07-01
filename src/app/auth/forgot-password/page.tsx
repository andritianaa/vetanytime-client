"use client";

import { AlertTriangle, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthLayout } from "../components/auth-layout";

// Client-side validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.status === 429 && data.retryAfter) {
        setRetryAfter(data.retryAfter);
        setError(
          `Too many password reset requests. Please try again in ${data.retryAfter} minutes.`
        );
      } else {
        // Always show success message even if email doesn't exist
        // This prevents email enumeration
        setEmailSent(true);
        toast({
          title: "Email sent",
          description:
            "If this email exists in our system, a password reset link has been sent.",
        });
      }
    } catch (error) {
      console.error("error ==> ", error);
      // Show generic message to prevent email enumeration
      setEmailSent(true);
      toast({
        title: "Email sent",
        description:
          "If this email exists in our system, a password reset link has been sent.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Mot de passe oublié"
      description="Entrez votre e-mail pour réinitialiser votre mot de passe"
    >
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {emailSent ? (
        <div className="space-y-4">
          <Alert
            variant="default"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <Info className="h-4 w-4" />
            <AlertDescription>
              Si l'adresse e-mail que vous avez saisie est associée à un compte,
              vous recevrez bientôt un lien de réinitialisation du mot de passe.
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground">
            Vous ne voyez pas l'e-mail&nbsp;? Vérifiez votre dossier spam ou
            assurez-vous d'avoir saisi la bonne adresse e-mail.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setEmailSent(false)}
          >
            Essayer une autre adresse e-mail
          </Button>
        </div>
      ) : (
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
                      placeholder="example@email.com"
                      type="email"
                      {...field}
                      disabled={isLoading || !!retryAfter}
                    />
                  </FormControl>
                  <FormDescription>
                    Entrez l'adresse e-mail associée à votre compte, et nous
                    vous enverrons un lien pour réinitialiser votre mot de
                    passe.
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
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>

            {retryAfter && (
              <p className="text-sm text-center text-muted-foreground">
                Trop de tentatives. Veuillez réessayer dans {retryAfter}{" "}
                minutes.
              </p>
            )}
          </form>
        </Form>
      )}

      <div className="mt-4 text-sm">
        <Link href="/auth/login" className="text-primary hover:underline">
          Retour à la page de connexion
        </Link>
      </div>
    </AuthLayout>
  );
}
