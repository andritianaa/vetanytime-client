"use client";

import { EllipsisVertical, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { deleteExperience } from '@/actions/vetenarian/vet.action';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ExperienceFormModal } from '@/components/veterinaire/modal/experiences-form-modal';
import { TRP } from '@/utils/translated-p';
import { Experience } from '@prisma/client';

export type EditExperiencesModalProps = {
  organizationId: string;
  experiences: Experience[];
};

export const EditExperiencesModal = ({
  organizationId,
  experiences,
}: EditExperiencesModalProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] =
    useState<Experience | null>(null);

  const handleDelete = async (experienceId: string) => {
    setIsLoading(true);
    try {
      await deleteExperience(experienceId);
      window.location.reload();
      toast.success("Expérience supprimée avec succès !");
      router.refresh();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (experience: Experience) => {
    setSelectedExperience(experience);
    setFormModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedExperience(null);
    setFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    router.refresh();
    setSelectedExperience(null);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="p-2">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gérer les expériences professionnelles</DialogTitle>
            <DialogDescription>
              Ajoutez, modifiez ou supprimez les expériences professionnelles de
              votre cabinet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Liste des expériences */}
            {experiences.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-4 text-sm">
                  Aucune expérience professionnelle ajoutée.
                </p>
                <Button onClick={handleAdd} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter votre première expérience
                </Button>
              </div>
            ) : (
              <div className="max-h-[400px] space-y-3 overflow-y-auto">
                {experiences
                  .sort((a, b) => b.startYear - a.startYear)
                  .map((experience) => (
                    <div
                      key={experience.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1 space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {experience.startYear}
                          {experience.endYear
                            ? ` - ${experience.endYear}`
                            : " - Présent"}
                        </Badge>
                        <TRP
                          className="text-sm font-medium"
                          text={experience.title}
                        />
                        <span className="text-muted-foreground flex items-center gap-2 text-sm">
                          <TRP text={experience.organization} />
                          •
                          <TRP text={experience.country} />
                        </span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isLoading}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEdit(experience)}
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(experience.id)}
                            className="text-destructive cursor-pointer font-semibold hover:text-red-500"
                          >
                            <Trash2 className="text-destructive mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
              </div>
            )}

            <div className="flex gap-2 border-t pt-4">
              <Button onClick={handleAdd} size="sm" className="flex-1 gap-2">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de formulaire séparé */}
      <ExperienceFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        experience={selectedExperience}
        orgId={organizationId}
        onSuccess={handleFormSuccess}
      />
    </>
  );
};
