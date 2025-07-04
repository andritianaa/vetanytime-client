"use client";

import { Loader2, Save, Upload, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useMediaUpload } from '@/hooks/use-media-upload';
import { useToast } from '@/hooks/use-toast';
import { useClient } from '@/hooks/use-user';
import { zodResolver } from '@hookform/resolvers/zod';

import type React from "react";
// Définir le schéma de validation
const profileFormSchema = z.object({
  fullname: z.string().optional(),
  username: z.string().min(3, {
    message: "The username must contain at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  theme: z.enum(["light", "dark", "system"]).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function EditPersonalInfoForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { client, mutate, isLoading: isClientLoading, isError } = useClient();
  const [isSaving, setIsSaving] = useState(false);
  const {
    uploadFile,
    isUploading,
    uploadProgress,
    error: uploadError,
  } = useMediaUpload();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  // Initialiser le formulaire
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullname: "",
      username: "",
      email: "",
      theme: "light",
    },
    mode: "onChange",
  });

  // Charger les données de l'utilisateur quand elles sont disponibles
  useEffect(() => {
    if (client && !isClientLoading) {
      console.log("Loading client data:", client); // Debug
      setProfileImage(client.image || null);
      form.reset({
        fullname: client.fullname || "",
        username: client.username || "",
        email: client.email || "",
        theme: "light",
      });
    }
  }, [client, isClientLoading, form]);

  // Gérer le changement d'image
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Type de fichier non supporté",
        description: "Veuillez sélectionner une image (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille de l'image ne doit pas dépasser 5MB",
        variant: "destructive",
      });
      return;
    }

    // Prévisualiser l'image
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setNewImageFile(file);
  };

  // Gérer la soumission du formulaire
  const onSubmit = async (data: ProfileFormValues) => {
    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("Form data:", data);
    console.log("Form state:", form.formState);

    setIsSaving(true);

    try {
      let imageUrl = client?.image;

      // Upload de la nouvelle image si nécessaire
      if (newImageFile) {
        console.log("Uploading new image...");
        const mediaResult = await uploadFile(newImageFile);
        if (mediaResult) {
          imageUrl = mediaResult.url;
          console.log("Image uploaded successfully:", imageUrl);
        } else {
          throw new Error("Échec de l'upload de l'image");
        }
      }

      console.log("Sending API request with:", { ...data, image: imageUrl });

      // Mettre à jour le profil
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          image: imageUrl,
        }),
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API error:", errorData);
        throw new Error(
          `Échec de la mise à jour du profil: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("API response:", result);

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });

      // Rafraîchir les données SWR
      await mutate();
      setNewImageFile(null);

      console.log("=== FORM SUBMISSION COMPLETED ===");
    } catch (error) {
      console.error("=== FORM SUBMISSION ERROR ===", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Gérer les erreurs de validation
  const onError = (errors: any) => {
    console.log("=== FORM VALIDATION ERRORS ===", errors);
    toast({
      title: "Erreur de validation",
      description: "Veuillez corriger les erreurs dans le formulaire.",
      variant: "destructive",
    });
  };

  // Afficher le loader pendant le chargement initial
  if (isClientLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Afficher l'erreur si pas de client
  if (isError || !client) {
    return (
      <Card className="max-lg:shadow-none max-lg:border-none">
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-destructive">
            Erreur lors du chargement des données utilisateur
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-lg:shadow-none max-lg:border-none">
      <CardHeader>
        <CardTitle>Informations personnelles</CardTitle>
        <CardDescription>
          Mettez à jour vos informations personnelles et votre photo de profil.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-2 border-border">
                    <AvatarImage
                      width={128}
                      height={128}
                      src={profileImage || ""}
                      alt={client?.username || "Avatar"}
                    />
                    <AvatarFallback className="text-4xl">
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <div className="text-white text-sm font-medium">
                        {uploadProgress}%
                      </div>
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                        <Upload className="h-4 w-4" />
                      </div>
                      <span className="sr-only">Changer d'avatar</span>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isUploading}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {client?.fullname || client?.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {client?.email}
                  </p>
                </div>
                {uploadError && (
                  <p className="text-sm text-destructive">{uploadError}</p>
                )}
                {isUploading && (
                  <Progress
                    value={uploadProgress}
                    className="w-full max-w-[180px] h-2"
                  />
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d'utilisateur</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="votre-nom-utilisateur"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Votre nom d'utilisateur doit être unique
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="votre-email@exemple.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Votre adresse email sera utilisée pour les
                        notifications.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSaving || isUploading || !form.formState.isValid}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
