"use client";

import type React from "react";

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

// Définir le schéma de validation
const profileFormSchema = z.object({
  fullname: z.string().optional(),
  username: z.string().min(3, {
    message: "The username must contain at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  theme: z.enum(["light", "dark", "system"]),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function EditPersonalInfoForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { client, mutate, isLoading: isClientLoading } = useClient();
  const [isLoading, setIsLoading] = useState(true);
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
  });

  // Charger les données de l'utilisateur
  useEffect(() => {
    if (client) {
      setProfileImage(client.image);

      form.reset({
        fullname: client.fullname || "",
        username: client.username,
        email: client.email,
      });
    } else {
      form.reset({
        fullname: "",
        username: "",
        email: "",
        theme: "light",
      });
    }
    setIsLoading(false);
  }, [form, isClientLoading]);

  // Gérer le changement d'image
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Type de fichier non supporté",
        description: "Veuillez sélectionner une image (JPG, PNG, etc.)",
        variant: "error",
      });
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille de l'image ne doit pas dépasser 5MB",
        variant: "error",
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
    setIsSaving(true);

    try {
      let imageUrl = client?.image;

      // Upload de la nouvelle image si nécessaire
      if (newImageFile) {
        const mediaResult = await uploadFile(newImageFile);
        if (mediaResult) {
          imageUrl = mediaResult.url;
        } else {
          throw new Error("Échec de l'upload de l'image");
        }
      }

      // Mettre à jour le profil
      const response = await fetch("/api/client", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          image: imageUrl,
        }),
      });

      if (!response.ok) throw new Error("Échec de la mise à jour du profil");

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });

      // Rafraîchir les données
      router.refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
      setNewImageFile(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="max-lg:shadow-none max-lg:border-none">
      <CardHeader>
        <CardTitle>Personnal informations</CardTitle>
        <CardDescription>
          Update your personal information and profile picture.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jon Doe" {...field} />
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
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="votre-nom-utilisateur"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your username must be unique
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
              <Button type="submit" disabled={isSaving || isUploading}>
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
