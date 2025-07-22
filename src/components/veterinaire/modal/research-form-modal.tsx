"use client";

import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { createResearch, updateResearch } from '@/actions/vetenarian/vet.action';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { GlobalLanguageSelector } from '@/components/ui/global-language-selector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultilingualProvider } from '@/components/ui/multilingual-context';
import { MultilingualInput } from '@/components/ui/multilingual-input';
import { Research } from '@prisma/client';

type ResearchForm = {
  id?: string;
  title: [string, string, string];
  organization: [string, string, string];
  year: number | "";
};

const emptyForm: ResearchForm = {
  title: ["", "", ""],
  organization: ["", "", ""],
  year: "",
};

type ResearchFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  research?: Research | null;
  orgId: string;
  onSuccess: () => void;
};

export const ResearchFormModal = ({
  open,
  onOpenChange,
  research,
  orgId,
  onSuccess,
}: ResearchFormModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ResearchForm>({ ...emptyForm });

  const isEditing = !!research;

  useEffect(() => {
    if (open) {
      if (research) {
        setFormData({
          id: research.id,
          title: research.title as [string, string, string],
          organization: research.organization as [string, string, string],
          year: research.year,
        });
      } else {
        setFormData({ ...emptyForm });
      }
    }
  }, [research, open]);

  const handleSubmit = async () => {
    if (formData.year === "" || !formData.year) {
      toast.error("L'année est obligatoire");
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        title: formData.title,
        organization: formData.organization,
        year: Number(formData.year),
      };

      if (isEditing && formData.id) {
        await updateResearch(formData.id, data);
        window.location.reload();
        toast.success("Recherche modifiée avec succès !");
      } else {
        await createResearch(orgId, data);
        window.location.reload();
        toast.success("Recherche ajoutée avec succès !");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormField = (field: keyof ResearchForm, value: any) => {
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
              {isEditing ? "Modifier la recherche" : "Ajouter une recherche"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifiez les informations de cette recherche."
                : "Ajoutez une nouvelle recherche à votre cabinet."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <GlobalLanguageSelector />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Titre</Label>
                <MultilingualInput
                  value={formData.title}
                  onChange={(value) => updateFormField("title", value)}
                  placeholder="Recherche en droit, Legal Research, Juridisch Onderzoek"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Organisation</Label>
                <MultilingualInput
                  value={formData.organization}
                  onChange={(value) => updateFormField("organization", value)}
                  placeholder="Université de Paris, University of Paris, Universiteit van Parijs"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Année *</Label>
              <Input
                type="number"
                placeholder="2023"
                value={formData.year}
                onChange={(e) =>
                  updateFormField(
                    "year",
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
              />
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
