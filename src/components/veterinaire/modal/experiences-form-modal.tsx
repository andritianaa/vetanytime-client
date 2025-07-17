"use client";

import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { createExperience, updateExperience } from '@/actions/vetenarian/vet.action';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { GlobalLanguageSelector } from '@/components/ui/global-language-selector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultilingualProvider } from '@/components/ui/multilingual-context';
import { MultilingualInput } from '@/components/ui/multilingual-input';
import { Experience } from '@prisma/client';

type ExperienceForm = {
  id?: string;
  title: [string, string, string];
  organization: [string, string, string];
  country: [string, string, string];
  startYear: number | "";
  endYear: number | "" | null;
};

const emptyForm: ExperienceForm = {
  title: ["", "", ""],
  organization: ["", "", ""],
  country: ["", "", ""],
  startYear: "",
  endYear: "",
};

type ExperienceFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experience?: Experience | null;
  orgId: string;
  onSuccess: () => void;
};

export const ExperienceFormModal = ({
  open,
  onOpenChange,
  experience,
  orgId,
  onSuccess,
}: ExperienceFormModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ExperienceForm>({ ...emptyForm });

  const isEditing = !!experience;

  // Réinitialiser le formulaire quand l'expérience change ou quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      if (experience) {
        setFormData({
          id: experience.id,
          title: experience.title as [string, string, string],
          organization: experience.organization as [string, string, string],
          country: experience.country as [string, string, string],
          startYear: experience.startYear,
          endYear: experience.endYear,
        });
      } else {
        setFormData({ ...emptyForm });
      }
    }
  }, [experience, open]);

  const handleSubmit = async () => {
    if (formData.startYear === "" || !formData.startYear) {
      toast.error("L'année de début est obligatoire");
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        title: formData.title,
        organization: formData.organization,
        country: formData.country,
        startYear: Number(formData.startYear),
        endYear:
          formData.endYear !== "" &&
          formData.endYear !== null &&
          formData.endYear
            ? Number(formData.endYear)
            : null,
      };

      if (isEditing && formData.id) {
        await updateExperience(formData.id, data);
        window.location.reload();
        toast.success("Expérience modifiée avec succès !");
      } else {
        await createExperience(orgId, data);
        window.location.reload();

        toast.success("Expérience ajoutée avec succès !");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormField = (field: keyof ExperienceForm, value: any) => {
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
              {isEditing ? "Modifier l'expérience" : "Ajouter une expérience"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifiez les informations de cette expérience professionnelle."
                : "Ajoutez une nouvelle expérience professionnelle à votre cabinet."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Sélecteur de langue globale */}
            <GlobalLanguageSelector />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Titre du poste</Label>
                <MultilingualInput
                  value={formData.title}
                  onChange={(value) => updateFormField("title", value)}
                  placeholder="Avocat, Lawyer, Advocaat"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Organisation</Label>
                <MultilingualInput
                  value={formData.organization}
                  onChange={(value) => updateFormField("organization", value)}
                  placeholder="Cabinet Dupont, Dupont Law Firm, Advocatenkantoor Dupont"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Pays</Label>
                <MultilingualInput
                  value={formData.country}
                  onChange={(value) => updateFormField("country", value)}
                  placeholder="France, France, Frankrijk"
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
