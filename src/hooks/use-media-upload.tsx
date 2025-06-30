"use client";

import { useState } from 'react';

import type { MediaInput } from "@/types/media";

type FileBrowserResponse = {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
};

export function useMediaUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<MediaInput | null> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const axios = (await import("axios")).default;

      // Utilisation du bon endpoint pour l'upload
      const response = await axios.post(
        "https://fileservertemp.teratany.org/upload",
        formData,
        {
          headers: {
            // Ajoutez ici les headers d'authentification si nécessaire
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(progress);
            }
          },
        }
      );

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = response.data as FileBrowserResponse;

      // Déterminer le type de média basé sur le mimetype retourné
      const mediaType = data.mimetype.startsWith("image")
        ? "image"
        : data.mimetype.startsWith("video")
        ? "video"
        : "document";

      // Créer un nouveau média dans la base de données
      const mediaResponse = await fetch("/api/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: data.url,
          type: mediaType,
          name: data.originalName,
          size: data.size,
          mimetype: data.mimetype,
        }),
      });

      if (!mediaResponse.ok) {
        throw new Error(`Failed to save media: ${mediaResponse.statusText}`);
      }

      const mediaData = await mediaResponse.json();

      return {
        id: mediaData.id,
        url: data.url,
        type: mediaType,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMultipleFiles = async (files: File[]): Promise<MediaInput[]> => {
    const results: MediaInput[] = [];

    for (const file of files) {
      const result = await uploadFile(file);
      if (result) {
        results.push(result);
      }
    }

    return results;
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    isUploading,
    uploadProgress,
    error,
  };
}
