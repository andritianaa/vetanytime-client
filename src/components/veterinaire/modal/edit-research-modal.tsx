"use client";

import { EllipsisVertical, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { deleteResearch } from '@/actions/vetenarian/vet.action';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ResearchFormModal } from '@/components/veterinaire/modal/research-form-modal';
import { TRP } from '@/utils/translated-p';
import { Research } from '@prisma/client';

export type EditResearchesModalProps = {
  researches: Research[];
  organizationId: string;
};

export const EditResearchesModal = ({
  researches,
  organizationId,
}: EditResearchesModalProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedResearch, setSelectedResearch] = useState<Research | null>(
    null
  );

  const handleDelete = async (researchId: string) => {
    setIsLoading(true);
    try {
      await deleteResearch(researchId);
      window.location.reload();
      toast.success("Recherche supprimée avec succès !");
      router.refresh();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (research: Research) => {
    setSelectedResearch(research);
    setFormModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedResearch(null);
    setFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    router.refresh();
    setSelectedResearch(null);
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
            <DialogTitle>Gérer les recherches</DialogTitle>
            <DialogDescription>
              Ajoutez, modifiez ou supprimez les recherches de votre cabinet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {researches?.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-4 text-sm">
                  Aucune recherche ajoutée.
                </p>
                <Button onClick={handleAdd} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter votre première recherche
                </Button>
              </div>
            ) : (
              <div className="max-h-[400px] space-y-3 overflow-y-auto">
                {researches
                  ?.sort((a, b) => b.year - a.year)
                  .map((research) => (
                    <div
                      key={research.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1 space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {research.year}
                        </Badge>
                        <TRP
                          className="text-sm font-medium"
                          text={research.title}
                        />
                        <TRP
                          className="text-muted-foreground text-sm"
                          text={research.organization}
                        />
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
                            onClick={() => handleEdit(research)}
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(research.id)}
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

      <ResearchFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        research={selectedResearch}
        orgId={organizationId}
        onSuccess={handleFormSuccess}
      />
    </>
  );
};
