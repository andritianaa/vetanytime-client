"use client";

import type React from "react";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type Bread = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
};

interface CreateBreadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: Bread | null;
}

export function CreateBreadModal({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: CreateBreadModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isEditing = !!editData;

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setDescription(editData.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = isEditing ? `/api/breads/${editData.id}` : "/api/breads";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: description || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save bread");
      }

      toast({
        title: isEditing ? "Bread modifié" : "Bread créé",
        description: isEditing
          ? `${name} a été modifié avec succès.`
          : `${name} a été créé avec succès.`,
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Erreur",
        description: isEditing
          ? "Une erreur est survenue lors de la modification."
          : "Une erreur est survenue lors de la création.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le bread" : "Ajouter un bread"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations du bread."
              : "Ajoutez un nouveau bread au système."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom du bread"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du bread (optionnel)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Enregistrement..."
                : isEditing
                  ? "Modifier"
                  : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
