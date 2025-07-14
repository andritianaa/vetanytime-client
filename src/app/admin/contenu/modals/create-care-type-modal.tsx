"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { addCareType, updateCareType } from "@/actions/admin/list.actions";
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

type CareType = {
  id: string;
  name: string;
  createdAt: string;
  _count: {
    consultationTypes: number;
  };
};

type CreateCareTypeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: CareType | null;
};

export function CreateCareTypeModal({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: CreateCareTypeModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const isEditing = !!editData;

  // Pre-fill form when editing
  useEffect(() => {
    if (editData) {
      setName(editData.name);
    } else {
      setName("");
    }
  }, [editData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Le nom est requis");
      return;
    }

    setLoading(true);

    try {
      if (isEditing && editData) {
        await updateCareType(editData.id, name.trim());
        toast.success("profession modifié avec succès");
      } else {
        await addCareType(name.trim());
        toast.success("profession ajouté avec succès");
      }

      setName("");
      onSuccess();
    } catch (error) {
      toast.error(
        isEditing
          ? "Erreur lors de la modification du profession"
          : "Erreur lors de l'ajout du profession"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le profession" : "Ajouter un profession"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations du profession"
              : "Créez un nouveau profession dans le système"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom du profession</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Médecine générale"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isEditing
                  ? "Modification..."
                  : "Ajout..."
                : isEditing
                ? "Modifier"
                : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
