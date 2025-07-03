"use client";

import type React from "react";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { addSpecialisation, updateSpecialisation } from '@/actions/admin/list.actions';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Specialisation } from '@/generated/prisma';

type CreateSpecialisationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: Specialisation;
};

export function CreateSpecialisationModal({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: CreateSpecialisationModalProps) {
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
        await updateSpecialisation(editData.id, name.trim());
        toast.success("Spécialisation modifiée avec succès");
      } else {
        await addSpecialisation(name.trim());
        toast.success("Spécialisation ajoutée avec succès");
      }

      setName("");
      onSuccess();
    } catch (error) {
      toast.error(
        isEditing
          ? "Erreur lors de la modification de la spécialisation"
          : "Erreur lors de l'ajout de la spécialisation"
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
            {isEditing
              ? "Modifier la spécialisation"
              : "Ajouter une spécialisation"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de la spécialisation"
              : "Créez une nouvelle spécialisation dans le système"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de la spécialisation</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Chirurgie orthopédique"
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
