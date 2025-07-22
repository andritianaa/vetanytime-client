"use client";

import { EllipsisVertical, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { editOrgDescription } from '@/actions/vetenarian/vet.action';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { MultilingualTextarea } from '@/components/ui/multilingual-input';

export type EditDescriptionModalProps = {
  organizationId: string;
  description: string[];
};
type MultilingualValue = [string, string, string];

export const EditDescriptionModal = (props: EditDescriptionModalProps) => {
  const router = useRouter();

  const [description, setDescription] = useState<MultilingualValue>(
    props.description as MultilingualValue
  );
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!description[0]) {
      toast.error("Le titre en français est obligatoire !");
      return;
    }
    setIsLoading(true);
    await editOrgDescription(props.organizationId, description)
      .then(() => {
        toast.success("Données sauvegardées avec succès !");
        window.location.reload();
        router.refresh();
        setOpen(false);
      })
      .catch(() => {
        toast.error("Une erreur est survenue lors de la sauvegarde.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} size="icon" className="p-2">
          <EllipsisVertical />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la description</DialogTitle>
          <DialogDescription>
            Vous pouvez modifier la description de votre cabinet ici. Cette
            description sera visible par les utilisateurs.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <MultilingualTextarea
              value={description}
              onChange={setDescription}
              placeholder="Entrez la description..."
              rows={6}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  Enregistrement...
                  <Loader className="h-4 w-4 animate-spin" />
                </span>
              ) : (
                "Enregistrer"
              )}
            </Button>
            <Button onClick={handleClose} variant="outline">
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
