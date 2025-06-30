// src/app/verify-email/page.tsx
import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

import { verifyEmail } from '@/actions/email-verification';
import { Button } from '@/components/ui/button';
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  // Si aucun token n'est fourni, afficher une erreur
  if (!token) {
    return <ErrorView message="Verification token is missing" />;
  }

  try {
    // Vérifier le token directement sur le serveur
    const client = await verifyEmail(token);

    // Si la vérification réussit, afficher un message de succès
    if (client) {
      return <SuccessView username={client.username} />;
    }
  } catch (error) {
    // Si une erreur se produit, afficher l'erreur
    return (
      <ErrorView
        message={
          error instanceof Error ? error.message : "Failed to verify email"
        }
      />
    );
  }

  // Gérer le cas improbable où ni succès ni erreur n'est retourné
  return <ErrorView message="An unexpected error occurred" />;
}

// Composant d'affichage de succès
function SuccessView({ username }: { username: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-xl flex justify-center items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            Email verified!
          </CardTitle>
          <CardDescription>
            Your email has been successfully verified
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground">
            Thank you for verifying your email address, {username}. You now
            have full access to all features.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/explore">Go to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Composant d'affichage d'erreur
function ErrorView({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-xl flex justify-center items-center gap-2">
            <XCircle className="h-6 w-6 text-destructive" />
            Verification Failed
          </CardTitle>
          <CardDescription>
            We couldn't verify your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground mb-4">
            {message || "The verification link may be invalid or expired."}
          </p>
          <p className="text-sm text-muted-foreground">
            Please log in to request a new verification link.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/auth/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
