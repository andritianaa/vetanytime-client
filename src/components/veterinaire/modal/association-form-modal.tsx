"use client";

import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { createAssociation, updateAssociation } from '@/actions/vetenarian/vet.action';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { GlobalLanguageSelector } from '@/components/ui/global-language-selector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultilingualProvider } from '@/components/ui/multilingual-context';
import { MultilingualInput } from '@/components/ui/multilingual-input';
import { Association } from '@prisma/client';

type AssociationForm = {
  id?: string;
  association: [string, string, string];
  role: [string, string, string];
  startYear: number | "";
  endYear: number | "" | null;
};

const emptyForm: AssociationForm = {
  association: ["", "", ""],
  role: ["", "", ""],
  startYear: "",
  endYear: "",
};

type AssociationFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  association?: Association | null;
  orgId: string;
  onSuccess: () => void;
};

export const AssociationFormModal = ({
  open,
  onOpenChange,
  association,
  orgId,
  onSuccess,
}: AssociationFormModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AssociationForm>({ ...emptyForm });

  const isEditing = !!association;

  useEffect(() => {
    if (open) {
      if (association) {
        setFormData({
          id: association.id,
          association: association.association as [string, string, string],
          role: association.role as [string, string, string],
          startYear: association.startYear,
          endYear: association.endYear,
        });
      } else {
        setFormData({ ...emptyForm });
      }
    }
  }, [association, open]);

  const handleSubmit = async () => {
    if (formData.startYear === "" || !formData.startYear) {
      toast.error("L'année de début est obligatoire");
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        association: formData.association,
        role: formData.role,
        startYear: Number(formData.startYear),
        endYear:
          formData.endYear !== "" &&
          formData.endYear !== null &&
          formData.endYear
            ? Number(formData.endYear)
            : null,
      };

      if (isEditing && formData.id) {
        await updateAssociation(formData.id, data);
        window.location.reload();
        toast.success("Association modifiée avec succès !");
      } else {
        await createAssociation(orgId, data);
        window.location.reload();
        toast.success("Association ajoutée avec succès !");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormField = (field: keyof AssociationForm, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <MultilingualProvider>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Modifier l'association" : "Ajouter une association"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifiez les informations de cette association."
                : "Ajoutez une nouvelle association à votre cabinet."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <GlobalLanguageSelector />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Association</Label>
                <MultilingualInput
                  value={formData.association}
                  onChange={(value) => updateFormField("association", value)}
                  placeholder="Barreau de Paris, Paris Bar, Balie van Parijs"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Rôle</Label>
                <MultilingualInput
                  value={formData.role}
                  onChange={(value) => updateFormField("role", value)}
                  placeholder="Membre, Member, Lid"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Année de début *</Label>
                <Input
                  type="number"
                  placeholder="2020"
                  value={formData.startYear}
                  onChange={(e) =>
                    updateFormField(
                      "startYear",
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Année de fin</Label>
                <Input
                  type="number"
                  placeholder="2023 (optionnel)"
                  value={formData.endYear || ""}
                  onChange={(e) =>
                    updateFormField(
                      "endYear",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isEditing ? "Modifier" : "Ajouter"}
              </Button>
              <Button onClick={handleClose} variant="outline">
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MultilingualProvider>
  );
};
