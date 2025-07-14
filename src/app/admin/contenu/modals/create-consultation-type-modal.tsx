"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  addConsultationType,
  updateConsultationType,
} from "@/actions/admin/list.actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CareType = {
  id: string;
  name: string;
};

type ConsultationType = {
  id: string;
  name: string;
  careTypeId: string;
  createdAt: string;
  CareType: {
    name: string;
  };
};

type CreateConsultationTypeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  careTypes: CareType[];
  editData?: ConsultationType | null;
};

export function CreateConsultationTypeModal({
  open,
  onOpenChange,
  onSuccess,
  careTypes,
  editData,
}: CreateConsultationTypeModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    careTypeId: "",
  });

  const isEditing = !!editData;

  // Pre-fill form when editing
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        careTypeId: editData.careTypeId,
      });
    } else {
      setFormData({ name: "", careTypeId: "" });
    }
  }, [editData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.careTypeId) {
      toast.error("Tous les champs sont requis");
      return;
    }

    setLoading(true);

    try {
      if (isEditing && editData) {
        await updateConsultationType(
          editData.id,
          formData.name.trim(),
          formData.careTypeId
        );
        toast.success("Type de consultation modifié avec succès");
      } else {
        await addConsultationType(formData.name.trim(), formData.careTypeId);
        toast.success("Type de consultation ajouté avec succès");
      }

      setFormData({ name: "", careTypeId: "" });
      onSuccess();
    } catch (error) {
      toast.error(
        isEditing
          ? "Erreur lors de la modification du type de consultation"
          : "Erreur lors de l'ajout du type de consultation"
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
              ? "Modifier le type de consultation"
              : "Ajouter un type de consultation"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations du type de consultation"
              : "Créez un nouveau type de consultation dans le système"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom du type de consultation</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Consultation de routine"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="careType">profession</Label>
              <Select
                value={formData.careTypeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, careTypeId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un profession" />
                </SelectTrigger>
                <SelectContent>
                  {careTypes.map((careType) => (
                    <SelectItem key={careType.id} value={careType.id}>
                      {careType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
