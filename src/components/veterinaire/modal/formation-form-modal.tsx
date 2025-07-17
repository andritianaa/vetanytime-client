"use client";

import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { createFormation, updateFormation } from '@/actions/vetenarian/vet.action';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { GlobalLanguageSelector } from '@/components/ui/global-language-selector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultilingualProvider } from '@/components/ui/multilingual-context';
import { MultilingualInput } from '@/components/ui/multilingual-input';
import { Formation } from '@prisma/client';

type FormationForm = {
  id?: string;
  specialisation: [string, string, string];
  school: [string, string, string];
  diploma: [string, string, string];
  startYear: number | "";
  endYear: number | "" | null;
};

const emptyForm: FormationForm = {
  specialisation: ["", "", ""],
  school: ["", "", ""],
  diploma: ["", "", ""],
  startYear: "",
  endYear: "",
};

type FormationFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formation?: Formation | null;
  orgId: string;
  onSuccess: () => void;
};

export const FormationFormModal = ({
  open,
  onOpenChange,
  formation,
  orgId,
  onSuccess,
}: FormationFormModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormationForm>({ ...emptyForm });

  const isEditing = !!formation;

  useEffect(() => {
    if (open) {
      if (formation) {
        setFormData({
          id: formation.id,
          specialisation: formation.specialisation as [string, string, string],
          school: formation.school as [string, string, string],
          diploma: formation.diploma as [string, string, string],
          startYear: formation.startYear,
          endYear: formation.endYear,
        });
      } else {
        setFormData({ ...emptyForm });
      }
    }
  }, [formation, open]);

  const handleSubmit = async () => {
    if (formData.startYear === "" || !formData.startYear) {
      toast.error("L'année de début est obligatoire");
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        specialisation: formData.specialisation,
        school: formData.school,
        diploma: formData.diploma,
        startYear: Number(formData.startYear),
        endYear:
          formData.endYear !== "" &&
          formData.endYear !== null &&
          formData.endYear
            ? Number(formData.endYear)
            : null,
      };

      if (isEditing && formData.id) {
        await updateFormation(formData.id, data);
        window.location.reload();
        toast.success("Formation modifiée avec succès !");
      } else {
        await createFormation(orgId, data);
        window.location.reload();
        toast.success("Formation ajoutée avec succès !");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormField = (field: keyof FormationForm, value: any) => {
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
              {isEditing ? "Modifier la formation" : "Ajouter une formation"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifiez les informations de cette formation."
                : "Ajoutez une nouvelle formation à votre cabinet."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <GlobalLanguageSelector />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Diplôme</Label>
                <MultilingualInput
                  value={formData.diploma}
                  onChange={(value) => updateFormField("diploma", value)}
                  placeholder="Master en Droit, Master in Law, Master in de Rechten"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Spécialisation</Label>
                <MultilingualInput
                  value={formData.specialisation}
                  onChange={(value) => updateFormField("specialisation", value)}
                  placeholder="Droit des affaires, Business Law, Ondernemingsrecht"
                />
              </div>
              <div className="space-y-2">
                <Label>École</Label>
                <MultilingualInput
                  value={formData.school}
                  onChange={(value) => updateFormField("school", value)}
                  placeholder="Université de Paris, University of Paris, Universiteit van Parijs"
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
