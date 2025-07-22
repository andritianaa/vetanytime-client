"use client";

import { EllipsisVertical, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { deleteFormation } from '@/actions/vetenarian/vet.action';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { FormationFormModal } from '@/components/veterinaire/modal/formation-form-modal';
import { TRP } from '@/utils/translated-p';
import { Formation } from '@prisma/client';

export type EditFormationsModalProps = {
  formations: Formation[];
  organizationId: string;
};

export const EditFormationsModal = ({
  formations,
  organizationId,
}: EditFormationsModalProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(
    null
  );

  const handleDelete = async (formationId: string) => {
    setIsLoading(true);
    try {
      await deleteFormation(formationId);
      window.location.reload();
      toast.success("Formation supprimée avec succès !");
      router.refresh();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (formation: Formation) => {
    setSelectedFormation(formation);
    setFormModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedFormation(null);
    setFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    router.refresh();
    setSelectedFormation(null);
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
            <DialogTitle>Gérer les formations</DialogTitle>
            <DialogDescription>
              Ajoutez, modifiez ou supprimez les formations de votre cabinet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {formations?.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-4 text-sm">
                  Aucune formation ajoutée.
                </p>
                <Button onClick={handleAdd} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter votre première formation
                </Button>
              </div>
            ) : (
              <div className="max-h-[400px] space-y-3 overflow-y-auto">
                {formations
                  ?.sort((a, b) => b.startYear - a.startYear)
                  .map((formation) => (
                    <div
                      key={formation.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1 space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {formation.startYear}
                          {formation.endYear
                            ? ` - ${formation.endYear}`
                            : " - Présent"}
                        </Badge>
                        <TRP
                          className="text-sm font-medium"
                          text={formation.diploma}
                        />
                        <TRP
                          className="text-muted-foreground text-sm"
                          text={formation.specialisation}
                        />
                        <TRP
                          className="text-muted-foreground text-xs"
                          text={formation.school}
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
                            onClick={() => handleEdit(formation)}
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(formation.id)}
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

      <FormationFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        formation={selectedFormation}
        orgId={organizationId}
        onSuccess={handleFormSuccess}
      />
    </>
  );
};
