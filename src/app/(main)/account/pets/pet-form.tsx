"use client";

import type React from "react";

import { Loader2, Plus, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { addPet } from '@/actions/pet-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useMediaUpload } from '@/hooks/use-media-upload';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  birth: z.string().min(1, "La date de naissance est requise"),
  registrationId: z.string().min(1, "Le numéro d'identification est requis"),
  sexe: z.enum(["Male", "Female", "Other"]),
  breedId: z.string().min(1, "La race est requise"),
  image: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Breed {
  id: string;
  name: string;
}

interface PetFormProps {
  breeds: Breed[];
  clientId: string;
}

export function PetForm({ breeds }: PetFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    uploadFile,
    isUploading,
    uploadProgress,
    error: uploadError,
  } = useMediaUpload();
  const [petImage, setPetImage] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      birth: "",
      registrationId: "",
      sexe: "Male",
      breedId: "",
      image: "",
    },
  });

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
      setPetImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setNewImageFile(file);
  };

  const removeImage = () => {
    setPetImage(null);
    setNewImageFile(null);
    const fileInput = document.getElementById(
      "pet-image-upload"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      let imageUrl = "";

      // Upload de l'image si fournie
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

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      // Ajouter l'URL de l'image
      if (imageUrl) {
        formData.append("image", imageUrl);
      }

      const result = await addPet(formData);

      if (result.success) {
        toast({
          title: "Animal ajouté",
          description: "L'animal a été ajouté avec succès.",
        });
        form.reset();
        setPetImage(null);
        setNewImageFile(null);
      } else {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Ajouter un animal
        </CardTitle>
        <CardDescription>
          Ajoutez un nouveau compagnon à votre liste
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Section upload d'image */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-border">
                  <AvatarImage src={petImage || ""} alt="Aperçu de l'animal" />
                  <AvatarFallback className="text-2xl">🐾</AvatarFallback>
                </Avatar>
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div className="text-white text-sm font-medium">
                      {uploadProgress}%
                    </div>
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2">
                  <label htmlFor="pet-image-upload" className="cursor-pointer">
                    <div className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                      <Upload className="h-4 w-4" />
                    </div>
                    <span className="sr-only">Ajouter une photo</span>
                  </label>
                  <input
                    id="pet-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isUploading}
                  />
                </div>
                {petImage && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              {uploadError && (
                <p className="text-sm text-destructive">{uploadError}</p>
              )}
              {isUploading && (
                <Progress
                  value={uploadProgress}
                  className="w-full max-w-[200px] h-2"
                />
              )}
              <p className="text-xs text-muted-foreground text-center">
                Optionnel - Une image sera générée automatiquement si vous n'en
                ajoutez pas
              </p>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de l'animal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de naissance</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="registrationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro d'identification</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Numéro de puce ou tatouage"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sexe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sexe</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le sexe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Mâle</SelectItem>
                      <SelectItem value="Female">Femelle</SelectItem>
                      <SelectItem value="Other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="breedId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Race</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la race" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {breeds.map((breed) => (
                        <SelectItem key={breed.id} value={breed.id}>
                          {breed.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading || isUploading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ajout en cours...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter l'animal
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
