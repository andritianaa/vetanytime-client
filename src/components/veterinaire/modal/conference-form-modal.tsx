"use client";

import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { createConference, updateConference } from '@/actions/vetenarian/vet.action';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { GlobalLanguageSelector } from '@/components/ui/global-language-selector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultilingualProvider } from '@/components/ui/multilingual-context';
import { MultilingualInput } from '@/components/ui/multilingual-input';
import { Conference } from '@prisma/client';

type ConferenceForm = {
  id?: string;
  title: [string, string, string];
  organization: [string, string, string];
  year: number | "";
};

const emptyForm: ConferenceForm = {
  title: ["", "", ""],
  organization: ["", "", ""],
  year: "",
};

type ConferenceFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conference?: Conference | null;
  orgId: string;
  onSuccess: () => void;
};

export const ConferenceFormModal = ({
  open,
  onOpenChange,
  conference,
  orgId,
  onSuccess,
}: ConferenceFormModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ConferenceForm>({ ...emptyForm });

  const isEditing = !!conference;

  useEffect(() => {
    if (open) {
      if (conference) {
        setFormData({
          id: conference.id,
          title: conference.title as [string, string, string],
          organization: conference.organization as [string, string, string],
          year: conference.year,
        });
      } else {
        setFormData({ ...emptyForm });
      }
    }
  }, [conference, open]);

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
        await updateConference(formData.id, data);
        window.location.reload();
        toast.success("Conférence modifiée avec succès !");
      } else {
        await createConference(orgId, data);
        window.location.reload();
        toast.success("Conférence ajoutée avec succès !");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormField = (field: keyof ConferenceForm, value: any) => {
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
              {isEditing ? "Modifier la conférence" : "Ajouter une conférence"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifiez les informations de cette conférence."
                : "Ajoutez une nouvelle conférence à votre cabinet."}
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
                  placeholder="Conférence sur le droit, Law Conference, Rechtsconferentie"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Organisation</Label>
                <MultilingualInput
                  value={formData.organization}
                  onChange={(value) => updateFormField("organization", value)}
                  placeholder="Barreau de Paris, Paris Bar, Balie van Parijs"
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
