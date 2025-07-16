"use client";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { updateOrgPicture } from "@/actions/vetenarian/vet.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type React from "react";
interface OrgProfilePictureProps {
  currentPics: string;
  orgId: string;
}

export default function OrgProfilePicture({
  currentPics,
  orgId,
}: OrgProfilePictureProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !orgId) return;

    console.log("Starting upload..."); // Debug

    setIsUploading(true);

    try {
      // Créer l'aperçu immédiatement
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      console.log("Preview set:", previewUrl); // Debug

      // Convertir en base64 et uploader
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const dataUrl = e.target?.result as string;
          await updateOrgPicture(orgId, dataUrl);
          window.location.reload();
        } catch (error) {
          console.error("Upload error:", error);
          // En cas d'erreur, revenir à l'état initial
          URL.revokeObjectURL(previewUrl);
          setPreviewImage(null);
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        console.error("FileReader error");
        URL.revokeObjectURL(previewUrl);
        setPreviewImage(null);
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing file:", error);
      setIsUploading(false);
    }

    // Reset input pour permettre de re-sélectionner le même fichier
    event.target.value = "";
  };

  // Déterminer quelle image afficher
  const displayImage =
    previewImage || currentPics || "/placeholder.svg?height=80&width=80";

  console.log("Rendering with:", { currentPics, previewImage, isUploading }); // Debug

  return (
    <div className="relative group">
      <Avatar className="h-20 w-20">
        <AvatarImage src={displayImage || "/placeholder.svg"} alt="Profile" />
        <AvatarFallback>
          <Camera className="h-8 w-8 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      {/* Overlay au hover */}
      {!isUploading && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
          <label htmlFor={`image-upload-${orgId}`} className="cursor-pointer">
            <Camera className="h-6 w-6 text-white" />
          </label>
        </div>
      )}

      {/* Loading overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-1">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span className="text-white text-xs">Upload...</span>
          </div>
        </div>
      )}

      {/* Input caché */}
      <input
        id={`image-upload-${orgId}`}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}
