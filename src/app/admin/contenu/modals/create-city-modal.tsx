"use client";

import type React from "react";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { addCity, updateCity } from '@/actions/admin/list.actions';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type City = {
  id: string;
  name: string;
  arrondissement: string;
  province: string;
  createdAt: string;
};

type CreateCityModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: City | null;
};

export function CreateCityModal({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: CreateCityModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    arrondissement: "",
    province: "",
  });

  const isEditing = !!editData;

  // Pre-fill form when editing
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        arrondissement: editData.arrondissement,
        province: editData.province,
      });
    } else {
      setFormData({ name: "", arrondissement: "", province: "" });
    }
  }, [editData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.arrondissement || !formData.province) {
      toast.error("Tous les champs sont requis");
      return;
    }

    setLoading(true);

    try {
      if (isEditing && editData) {
        await updateCity(
          editData.id,
          formData.name,
          formData.arrondissement,
          formData.province
        );
        toast.success("Ville modifiée avec succès");
      } else {
        await addCity(
          formData.name,
          formData.arrondissement,
          formData.province
        );
        toast.success("Ville ajoutée avec succès");
      }

      setFormData({ name: "", arrondissement: "", province: "" });
      onSuccess();
    } catch (error) {
      toast.error(
        isEditing
          ? "Erreur lors de la modification de la ville"
          : "Erreur lors de l'ajout de la ville"
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
            {isEditing ? "Modifier la ville" : "Ajouter une ville"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de la ville"
              : "Créez une nouvelle ville dans le système"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de la ville</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Montréal"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="arrondissement">Arrondissement</Label>
              <Input
                id="arrondissement"
                value={formData.arrondissement}
                onChange={(e) =>
                  setFormData({ ...formData, arrondissement: e.target.value })
                }
                placeholder="Ex: Ville-Marie"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="province">Province</Label>
              <Input
                id="province"
                value={formData.province}
                onChange={(e) =>
                  setFormData({ ...formData, province: e.target.value })
                }
                placeholder="Ex: Québec"
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
