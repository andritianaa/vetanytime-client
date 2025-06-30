"use client";

import {
    AlertCircle, Building2, CheckCircle, Clients, CreditCard, ExternalLink
} from 'lucide-react';
import { clientouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface MetaAccount {
  id: string;
  name: string;
  currency: string;
  accountStatus: string;
  businessName?: string;
  category?: string;
  spendCap?: number;
  balance?: number;
}

interface MetaClient {
  id: string;
  name: string;
  email?: string;
}

export default function MetaOnboardingPage() {
  const router = clientouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [metaClient, setMetaClient] = useState<MetaClient | null>(null);
  const [metaAccounts, setMetaAccounts] = useState<MetaAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"connect" | "select" | "complete">(
    "connect"
  );

  // Vérifier si l'utilisateur revient du callback OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (error) {
      setError("Connexion annulée ou échouée");
      return;
    }

    if (code) {
      handleOAuthCallback(code);
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    setIsLoadingAccounts(true);
    try {
      const response = await fetch("/api/meta/oauth/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la connexion");
      }

      setMetaClient(data.client);
      setMetaAccounts(data.accounts);
      setStep("select");

      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error("OAuth callback error:", error);
      setError(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const initiateMetaConnection = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch("/api/meta/oauth/initiate");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'initialisation");
      }

      // Rediriger vers Meta OAuth
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Meta connection error:", error);
      setError(error instanceof Error ? error.message : "Erreur inconnue");
      setIsConnecting(false);
    }
  };

  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  };

  const saveSelectedAccounts = async () => {
    if (selectedAccounts.length === 0) {
      toast.error("Veuillez sélectionner au moins un compte");
      return;
    }

    setIsLoadingAccounts(true);
    try {
      const response = await fetch("/api/meta/accounts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountIds: selectedAccounts }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      setStep("complete");
      toast.success("Comptes Meta connectés avec succès !");
    } catch (error) {
      console.error("Save accounts error:", error);
      setError(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const continueToNextStep = () => {
    router.push("/onboarding/ready");
  };

  if (step === "connect") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Building2 className="mx-auto h-12 w-12 text-primary" />
            <h1 className="text-2xl font-bold">Connecter Meta Business</h1>
            <p className="text-muted-foreground">
              Liez votre compte Meta Business pour analyser vos campagnes
              publicitaires
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Autorisation Meta
              </CardTitle>
              <CardDescription>
                Nous aurons accès en lecture seule à vos données publicitaires
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Lecture des campagnes et statistiques
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Accès aux comptes publicitaires
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Données sécurisées et chiffrées
                </div>
              </div>

              <Separator />

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={initiateMetaConnection}
                disabled={isConnecting}
                className="w-full"
                size="lg"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <Building2 className="mr-2 h-4 w-4" />
                    Connecter avec Meta
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "select") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-4xl space-y-6">
          <div className="text-center space-y-2">
            <Clients className="mx-auto h-12 w-12 text-primary" />
            <h1 className="text-2xl font-bold">Sélectionner vos comptes</h1>
            <p className="text-muted-foreground">
              Choisissez les comptes publicitaires que vous souhaitez analyser
            </p>
          </div>

          {metaClient && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Connecté en tant que {metaClient.name}
                </CardTitle>
                {metaClient.email && (
                  <CardDescription>{metaClient.email}</CardDescription>
                )}
              </CardHeader>
            </Card>
          )}

          {isLoadingAccounts ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-4 rounded" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {metaAccounts.map((account) => (
                  <Card
                    key={account.id}
                    className={`cursor-pointer transition-colors ${
                      selectedAccounts.includes(account.id)
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => toggleAccountSelection(account.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              selectedAccounts.includes(account.id)
                                ? "bg-primary border-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {selectedAccounts.includes(account.id) && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{account.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>ID: {account.id}</span>
                              {account.businessName && (
                                <span>• {account.businessName}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              account.accountStatus === "ACTIVE"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {account.accountStatus}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm">
                            <CreditCard className="h-4 w-4" />
                            {account.currency}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep("connect")}>
                  Retour
                </Button>
                <Button
                  onClick={saveSelectedAccounts}
                  disabled={selectedAccounts.length === 0 || isLoadingAccounts}
                >
                  {isLoadingAccounts ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Sauvegarde...
                    </>
                  ) : (
                    `Continuer (${selectedAccounts.length} sélectionné${
                      selectedAccounts.length > 1 ? "s" : ""
                    })`
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="space-y-2">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="text-2xl font-bold">Connexion réussie !</h1>
            <p className="text-muted-foreground">
              Vos comptes Meta ont été connectés avec succès. Vous pouvez
              maintenant analyser vos campagnes.
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Comptes connectés:</span>
                  <span className="font-semibold">
                    {selectedAccounts.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Utilisateur Meta:</span>
                  <span className="font-semibold">{metaClient?.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={continueToNextStep} className="w-full" size="lg">
            Continuer l'onboarding
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
